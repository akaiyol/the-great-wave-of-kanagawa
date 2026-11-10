import fs from 'node:fs';
import {generateAnalyticCap,composeAnalyticCap,path,area} from './analytic-cap.mjs';
import {pointInPolygon,pointSegmentDistance,segmentsCross} from '../../src/procedural/geometry.mjs';
const out='research/output/agent-phase-2026-11-10/P134';fs.mkdirSync(out,{recursive:true});
const recipe=JSON.parse(fs.readFileSync('research/proposals/P134-analytic-cap-v2.json','utf8'));
const summary={phase:'P134',policyVersion:'v2',pass:false,checks:{},stoppedAt:null};
const save=()=>fs.writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2)+'\n');
function gate(name,result){summary.checks[name]=result;if(!result.pass){summary.stoppedAt=name;save();console.log(JSON.stringify(summary));process.exit(1);}}
const same=(a,b)=>Math.hypot(...a.map((v,k)=>v-b[k]))<1e-9;
function contact(ps,closed){const p=ps.filter((v,i)=>!i||!same(v,ps[i-1]));if(closed&&same(p[0],p.at(-1)))p.pop();const n=p.length-(closed?0:1);for(let i=0;i<n;i++)for(let j=i+2;j<n;j++){if(closed&&i===0&&j===n-1)continue;const a=p[i],b=p[(i+1)%p.length],c=p[j],d=p[(j+1)%p.length];const cross=segmentsCross(a,b,c,d),distance=cross?0:Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));if(cross||distance<1e-8)return {pass:false,i,j,cross,distance,segments:[[a,b],[c,d]]};}return {pass:true};}
const study=generateAnalyticCap(recipe),g=study.geometry,old=study.baseline.baseline.geometry;
const blue=[...g.waterbase.slice(g.outer.length-1),...g.seam.toReversed().slice(0,-1)];
gate('finite',{pass:[study.profile,g.supportsheet,blue].every(p=>p.every(q=>q.length===2&&q.every(Number.isFinite)))});
for(const [name,p] of Object.entries({profile:study.profile,Fsheet:g.supportsheet,mainBlue:blue}))for(const mode of ['raw','serialized'])gate(name+'.'+mode,contact(mode==='raw'?p:p.map(q=>q.map(v=>Number(v.toFixed(3)))),name!=='profile'));
let inside=true;for(let i=1;i<study.profile.length;i++){const a=study.profile[i-1],b=study.profile[i];for(const p of [a,b,a.map((v,k)=>(v+b[k])/2)])inside&&=pointInPolygon(p,g.waterbase);for(let j=0;j<g.waterbase.length;j++)if(segmentsCross(a,b,g.waterbase[j],g.waterbase[(j+1)%g.waterbase.length]))inside=false;}
gate('profileInsideBody',{pass:inside});
const residual=Math.abs(area(g.supportsheet)+area(blue)-area(g.waterbase));gate('partition',{pass:residual<=1e-6,residual});
gate('frozenIdentity',{pass:['waterbase','outer','children','watercomponents','band'].every(k=>g[k]===old[k])});
const svg=composeAnalyticCap(study),oldMarkup=`<path d="${path(old.supportsheet)}"/>`,newMarkup=`<path d="${path(g.supportsheet)}"/>`;
gate('exactRestoration',{pass:svg.split(newMarkup).join(oldMarkup).replace(' data-seam-study="P134"','')===study.baseline.svg});
gate('deterministic',{pass:svg===composeAnalyticCap(generateAnalyticCap(recipe))});
summary.pass=true;save();fs.writeFileSync(out+'/candidate.svg',svg);fs.writeFileSync('research/woodblock/analytic-cap.html','<!doctype html><meta charset="utf-8"><title>P134 study</title><style>html,body{margin:0;width:100%;height:100%;overflow:hidden}object{width:100%;height:100%;display:block}</style><object type="image/svg+xml" data="../output/agent-phase-2026-11-10/P134/candidate.svg"></object>');console.log(JSON.stringify(summary));
