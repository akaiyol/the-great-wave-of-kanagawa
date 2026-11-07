import test from 'node:test';
import assert from 'node:assert/strict';
import {continuationPlan as plan} from './continuation-plan.mjs';
const now=1794087382;
const input=(primary={},weekly={},extra={})=>({now,busy:false,checkpoint:false,primary:{usedPercent:100,resetsAt:1794087509,...primary},weekly:{usedPercent:40,resetsAt:now+10000,...weekly},...extra});
test('observed early retry adds buffer then rounds up UTC minute',()=>{
 const p=plan(input());assert.equal(p.action,'retry');assert.equal(p.target,1794087600);assert.equal(p.schedulerTimezone,'UTC');assert.match(p.rrule,/BYHOUR=21;BYMINUTE=40;BYSECOND=0;/);
});
test('both exhausted windows use latest reset',()=>assert.equal(plan(input({}, {usedPercent:100,resetsAt:now+600})).target,Math.ceil((now+690)/60)*60));
test('available continues without requiring unused reset metadata',()=>assert.equal(plan(input({usedPercent:20,resetsAt:null})).action,'continue'));
test('98 percent proactively arms and uses latest near reset',()=>{
 const p=plan(input({usedPercent:98,resetsAt:now+100},{usedPercent:99,resetsAt:now+300}));assert.equal(p.action,'arm');assert.equal(p.target,Math.ceil((now+390)/60)*60);
});
test('explicit checkpoint near limit arms',()=>assert.equal(plan(input({usedPercent:99},{usedPercent:20},{checkpoint:true})).action,'arm'));
test('stale or unknown blocking reset never schedules',()=>{
 for(const resetsAt of [now,now-1,null,undefined,NaN,'tomorrow'])assert.equal(plan(input({resetsAt})).action,'unknown');
});
test('unknown usage never starts work',()=>{
 for(const usedPercent of [undefined,null,NaN,Infinity,-1,101,'98'])assert.equal(plan(input({usedPercent})).action,'unknown');
 assert.equal(plan({now,busy:false,checkpoint:false}).action,'unknown');
});
test('busy never starts another run',()=>assert.equal(plan({busy:true}).action,'busy'));
test('year rollover fixes date and expires before annual recurrence',()=>{
 const reset=Date.parse('2026-12-31T23:59:40Z')/1000,p=plan(input({resetsAt:reset},{},{now:reset-30}));
 assert.equal(p.scheduledAt,'2027-01-01T00:02:00.000Z');assert.match(p.rrule,/BYMONTH=1;BYMONTHDAY=1;BYHOUR=0;BYMINUTE=2;BYSECOND=0;UNTIL=20270101T000400Z$/);
 const until=Date.parse('2027-01-01T00:04:00Z')/1000;assert.equal(until-p.target,120);assert.ok(Date.parse('2028-01-01T00:02:00Z')/1000>until);
});
test('month rollover uses target calendar date',()=>{
 const reset=Date.parse('2026-11-30T23:59:40Z')/1000,p=plan(input({resetsAt:reset},{},{now:reset-30}));assert.equal(p.scheduledAt,'2026-12-01T00:02:00.000Z');
});

test('ordinary usage denial never starts work',()=>assert.equal(plan(input({usedPercent:20},{},{ordinaryUsageAllowed:false})).action,'unknown'));

test('far-future reset cannot match an earlier calendar year',()=>{
 const at=Date.parse('2026-11-07T23:00:00Z')/1000;
 assert.equal(plan(input({resetsAt:Date.parse('2027-12-01T00:00:00Z')/1000},{},{now:at})).action,'unknown');
 assert.equal(plan(input({resetsAt:at+8*86400+1},{},{now:at})).action,'unknown');
});
