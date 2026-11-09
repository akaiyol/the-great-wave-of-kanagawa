import fs from 'node:fs';
import {isDeepStrictEqual} from 'node:util';
import {generateJunctionPair} from './junction-pair.mjs';
import {cubicBezier,pointInPolygon,pointSegmentDistance,segmentsCross} from '../../src/procedural/geometry.mjs';
const previous='research/output/agent-phase-2026-11-09/P128',out=process.argv[2]||'research/output/agent-phase-2026-11-09/P129';
const cases=generateJunctionPair(),saved=JSON.parse(fs.readFileSync(previous+'/geometry.json','utf8'));
const geometryIdentical=isDeepStrictEqual(cases,saved),original=JSON.parse(fs.readFileSync(previous+'/summary.json','utf8'));
const distance=(a,b,c,d)=>segmentsCross(a,b,c,d)?0:Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
const length=(a,b)=>Math.hypot(...a.map((v,i)=>v-b[i]));
function check(points,parent){let minClearance=Infinity,contacts=0;for(let i=1;i<points.length;i++)for(let j=0;j<parent.length;j++){const d=distance(points[i-1],points[i],parent[j],parent[(j+1)%parent.length]);minClearance=Math.min(minClearance,d);if(d<1e-8)contacts++;}const inside=points.every(p=>pointInPolygon(p,parent));return {pass:inside&&!contacts&&minClearance>=3,inside,contacts,minClearance};}
const routes=cases.map(item=>{
 const L=item.curves.find(c=>c.feature==='A-outer').controls,R=[...item.curves.find(c=>c.feature==='A-inner').controls].reverse();
 const centers=Array.from({length:65},(_,k)=>{const u=.8*k/64,l=cubicBezier(...L,u),r=cubicBezier(...R,u);return l.map((v,i)=>(v+r[i])/2);});
 const old=item.supports.find(s=>s.from==='P'&&s.to==='A').points,newRoute=[item.anchors.P,...centers];
 const oldCheck=check(old,item.child),newCheck=check(newRoute,item.child),oldTipDistance=length(old.at(-1),item.anchors.A),newTipDistance=length(newRoute.at(-1),item.anchors.A),tipReachPass=newTipDistance<=oldTipDistance;
 return {old,newRoute,oldCheck,newCheck,oldTipDistance,newTipDistance,tipReachPass,pass:newCheck.pass&&tipReachPass};
});
const order=[2,0,1],ids=['Q','R','S'];
const pass=geometryIdentical&&original.pass===false&&routes.every(r=>r.pass);
const summary={phase:'P129',pass,geometryIdentical,originalP128Pass:original.pass,geometryEvidence:previous+'/geometry.json',cases:order.map((index,i)=>{const r=routes[index];return {id:ids[i],pass:r.pass,oldRoute:r.oldCheck,newRoute:r.newCheck,oldTipDistance:r.oldTipDistance,newTipDistance:r.newTipDistance,tipReachPass:r.tipReachPass};}),scope:'One fixed polygonal radius3 support route only; original P128 failure unchanged. No minimum-width, bottleneck-absence or artistic claim.'};
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2)+'\n');fs.writeFileSync(out+'/routes.json',JSON.stringify({geometryEvidence:summary.geometryEvidence,cases:order.map((index,i)=>({id:ids[i],old:routes[index].old,newRoute:routes[index].newRoute}))},null,2)+'\n');
const outputs=['local-parents.svg','support-overlays.svg'];
if(pass){
 const path=points=>'M'+points.map(p=>p.join(',')).join(' L');
 const panel=(index,i,overlay)=>{const item=cases[index],r=routes[index];return `<g transform="translate(${i*260},0)"><path d="${path(item.child)} Z" fill="#eeecd5" stroke="#23485f" stroke-width="2.1" stroke-linejoin="round"/><path d="${path(item.accent)} Z" fill="#b3d2cc"/>${item.marks.map(m=>`<path d="${path(m.polygon)} Z" fill="#23485f"/>`).join('')}${overlay?`<path d="${path(r.old)}" fill="none" stroke="#c77828" stroke-width="1.5"/><path d="${path(r.newRoute)}" fill="none" stroke="#267943" stroke-width="1.5"/>`:''}<text x="60" y="265" font-size="12" fill="#23485f">${ids[i]}</text></g>`;};
 for(let k=0;k<outputs.length;k++)fs.writeFileSync(out+'/'+outputs[k],`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -25 800 310"><rect x="-20" y="-25" width="800" height="310" fill="#e6dcc1"/>${order.map((index,i)=>panel(index,i,k===1)).join('')}</svg>`);
}else for(const file of outputs)if(fs.existsSync(out+'/'+file))fs.unlinkSync(out+'/'+file);
console.log(JSON.stringify(summary));if(!pass)process.exitCode=1;
