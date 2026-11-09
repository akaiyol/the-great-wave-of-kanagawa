import fs from 'node:fs';
import {generateJunctionPair} from './junction-pair.mjs';
import {pointInPolygon,pointSegmentDistance,segmentsCross} from '../../src/procedural/geometry.mjs';
const distance=(a,b,c,d)=>segmentsCross(a,b,c,d)?0:Math.min(pointSegmentDistance(a,c,d),pointSegmentDistance(b,c,d),pointSegmentDistance(c,a,b),pointSegmentDistance(d,a,b));
const edges=p=>p.map((a,i)=>[a,p[(i+1)%p.length]]);
const clean=p=>p.filter((a,i)=>!i||Math.hypot(...a.map((v,j)=>v-p[i-1][j]))>1e-9).filter((a,i,ps)=>i!==ps.length-1||Math.hypot(...a.map((v,j)=>v-ps[0][j]))>1e-9);
function simple(poly){const es=edges(clean(poly));let contacts=0;for(let i=0;i<es.length;i++)for(let j=i+2;j<es.length;j++)if(!(i===0&&j===es.length-1)&&distance(...es[i],...es[j])<1e-8)contacts++;return contacts;}
function containment(poly,outer){const es=edges(outer);let contacts=0,minClearance=Infinity;for(const e of edges(poly))for(const b of es){const d=distance(...e,...b);if(d<1e-8)contacts++;minClearance=Math.min(minClearance,d);}return {inside:poly.every(p=>pointInPolygon(p,outer)),contacts,minClearance};}
const cases=generateJunctionPair(),deterministic=JSON.stringify(cases)===JSON.stringify(generateJunctionPair());
const summaries=cases.map(item=>{
 const parentContacts=simple(item.child),fullParentContacts=simple(item.outline),boundary=edges(clean(item.outline));
 const supportChecks=item.supports.map(s=>{let minClearance=Infinity;for(let i=1;i<s.points.length;i++)for(const edge of boundary)minClearance=Math.min(minClearance,distance(s.points[i-1],s.points[i],...edge));return {inside:s.points.every(p=>pointInPolygon(p,item.outline)),minClearance};});
 const markChecks=[...item.marks.map(m=>m.polygon),item.accent].map(p=>containment(p,item.child));
 const open=item.marks.every(m=>!m.closed&&Math.hypot(...m.points[0].map((v,i)=>v-m.points.at(-1)[i]))>1e-8);
 const reconstruction=item.name!=='reference'||Math.max(...[...item.marks.flatMap((m,i)=>m.polygon.flatMap((p,k)=>p.map((v,j)=>Math.abs(v-item.reference.ink[i][k][j])))),...item.accent.flatMap((p,k)=>p.map((v,j)=>Math.abs(v-item.reference.accent[k][j])))])<1e-10;
 const pass=deterministic&&!parentContacts&&!fullParentContacts&&supportChecks.every(c=>c.inside&&c.minClearance>=3)&&markChecks.every(c=>c.inside&&!c.contacts)&&open&&item.det>0&&Math.abs(item.invariant)<1e-10&&reconstruction;
 return {pass,parentContacts,fullParentContacts,supportChecks,markChecks,open,det:item.det,invariant:item.invariant,reconstruction,frameOnly:item.frameOnly};
});
const order=[2,0,1],ids=['Q','R','S'],out=process.argv[2]||'research/output/agent-phase-2026-11-09/P128';fs.mkdirSync(out,{recursive:true});
const pass=summaries.every(s=>s.pass),summary={phase:'P128',pass,deterministic,cases:order.map((index,i)=>({id:ids[i],...summaries[index]})),scope:'Local integrity only; model angle constant is not a museum measurement.'};
fs.writeFileSync(out+'/summary.json',JSON.stringify(summary,null,2)+'\n');
fs.writeFileSync(out+'/geometry.json',JSON.stringify(cases)+'\n');
fs.writeFileSync(out+'/local-case-key.json',JSON.stringify(Object.fromEntries(order.map((index,i)=>[ids[i],cases[index].name])),null,2)+'\n');
const svgPath=out+'/local.svg';
if(pass){const path=ps=>'M'+ps.map(p=>p.join(',')).join(' L')+' Z';const panels=order.map((index,i)=>{const item=cases[index];return `<g transform="translate(${i*260},0)"><path d="${path(item.child)}" fill="#eeecd5" stroke="#23485f" stroke-width="2.1" stroke-linejoin="round"/><path d="${path(item.accent)}" fill="#b3d2cc"/>${item.marks.map(m=>`<path d="${path(m.polygon)}" fill="#23485f"/>`).join('')}<text x="60" y="265" font-size="12" fill="#23485f">${ids[i]}</text></g>`;}).join('');fs.writeFileSync(svgPath,`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -25 800 310"><rect x="-20" y="-25" width="800" height="310" fill="#e6dcc1"/>${panels}</svg>`);}else if(fs.existsSync(svgPath))fs.unlinkSync(svgPath);
console.log(JSON.stringify(summary));if(!pass)process.exitCode=1;
