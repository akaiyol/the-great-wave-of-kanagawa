import {pathToFileURL} from 'node:url';

const validNumber=v=>typeof v==='number'&&Number.isFinite(v);
const unknown=reason=>({action:'unknown',reason,schedulerTimezone:'UTC'});
export function nightWindow(now){
 if(!validNumber(now))return {open:false,localHour:null};
 const date=new Date(now*1000);
 if(!Number.isFinite(date.getTime()))return {open:false,localHour:null};
 const localHour=Number(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Toronto',hour:'2-digit',hourCycle:'h23'}).format(date));
 return {open:localHour>=0&&localHour<8,localHour};
}
/** Pure quota planner. Percentages are observed inputs, not runtime telemetry. */
export function continuationPlan(input={}){
 if(input.busy===true)return {action:'busy',schedulerTimezone:'UTC'};
 if(input.ordinaryUsageAllowed===false)return unknown('Ordinary usage not allowed');
 if(!validNumber(input.now)||!Number.isInteger(input.now))return unknown('Invalid now');
 if(typeof input.automatic!=='boolean')return unknown('Missing automatic mode');
 if(input.automatic&&!nightWindow(input.now).open)return {action:'wait_window',reason:'outsidewindow',schedulerTimezone:'UTC'};
 if(typeof input.busy!=='boolean'||typeof input.checkpoint!=='boolean')return unknown('Missing state');
 const windows=[input.primary,input.weekly];
 if(windows.some(w=>!w||!validNumber(w.usedPercent)||w.usedPercent<0||w.usedPercent>100))return unknown('Unknown usage');
 const exhausted=windows.filter(w=>w.usedPercent>=100);
 const near=windows.filter(w=>w.usedPercent>=98);
 if(!exhausted.length&&!near.length&&!input.checkpoint)return {action:'continue',schedulerTimezone:'UTC'};
 // An explicit checkpoint below the proactive threshold has no known blocker.
 if(!exhausted.length&&!near.length)return unknown('Checkpoint has no near-limit reset');
 const blockers=exhausted.length?exhausted:near;
 if(blockers.some(w=>!validNumber(w.resetsAt)||!Number.isInteger(w.resetsAt)||w.resetsAt<=input.now))return unknown('Unknown or stale blocking reset');
 // Account windows are five hours and one week. Bound accepted data to eight
 // days so a year-less calendar rule cannot first match an earlier year.
 if(blockers.some(w=>w.resetsAt-input.now>8*86400))return unknown('Blocking reset exceeds supported eight-day horizon');
 const target=Math.ceil((Math.max(...blockers.map(w=>w.resetsAt))+90)/60)*60;
 if(input.automatic&&!nightWindow(target).open)return {action:'wait_window',reason:'retryoutsidewindow',schedulerTimezone:'UTC'};
 const date=new Date(target*1000),until=new Date((target+120)*1000);
 if(!Number.isFinite(date.getTime())||!Number.isFinite(until.getTime())||date.getUTCFullYear()<1970||date.getUTCFullYear()>9999||until.getUTCFullYear()>9999)return unknown('Unsupported calendar date');
 const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace('.000','');
 // Every time/date field is fixed and UNTIL expires two minutes after the
 // single intended occurrence, preventing a future annual recurrence.
 const rrule=`FREQ=YEARLY;BYMONTH=${date.getUTCMonth()+1};BYMONTHDAY=${date.getUTCDate()};BYHOUR=${date.getUTCHours()};BYMINUTE=${date.getUTCMinutes()};BYSECOND=0;UNTIL=${stamp(until)}`;
 return {action:exhausted.length?'retry':'arm',target,scheduledAt:date.toISOString(),rrule,schedulerTimezone:'UTC'};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 let raw='';process.stdin.setEncoding('utf8');
 for await(const chunk of process.stdin)raw+=chunk;
 try{process.stdout.write(JSON.stringify(continuationPlan(JSON.parse(raw)))+'\n');}
 catch{process.stdout.write(JSON.stringify(unknown('Invalid JSON input'))+'\n');process.exitCode=1;}
}
