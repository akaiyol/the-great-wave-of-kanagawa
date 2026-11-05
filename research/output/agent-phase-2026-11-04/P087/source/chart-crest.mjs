// P087 disposable study: exposed foam and inner water seam share sector plans.
// This is not integrated into the gallery or an accepted visual construction.
import {generateWave} from './rolled-front.mjs';
import {generateComposition,compositionSvg} from './composition.mjs';
import {random,hash} from '../random.mjs';
import {cubicBezier} from './geometry.mjs';
const same=(a,b)=>a.every((v,k)=>v===b[k]);
const lerp=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const pt=p=>p.map(n=>n.toFixed(3)).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
const line=ps=>'M'+ps.map(pt).join(' L');
export function generateChartCrest(seed=721){
 const wave=generateWave(seed),map=wave.surfaceChart.map,r=random(hash(seed,0x43303837));
 const uStart=wave.surfaceChart.inverseFront(wave.frontGraph[0])[0],uEnd=2.08;
 const count=3+Math.floor(r()*2),weights=Array.from({length:count},()=>.6+r()),sum=weights.reduce((a,b)=>a+b,0);
 const base=u=>lerp(264,172,smooth((u-uStart)/(uEnd-uStart)));
 let u=uStart;const plans=[],frontChart=[[uStart,264]],waterChart=[];
 const edge=(b,c,e)=>{const a=frontChart.at(-1);for(let j=1;j<=16;j++)frontChart.push(cubicBezier(a,b,c,e,j/16));};
 for(let i=0;i<count;i++){
  const start=u,end=i===count-1?uEnd:u+(uEnd-uStart)*weights[i]/sum,children=2+Math.floor(r()*3);
  const childWeights=Array.from({length:children},()=>.55+r()),total=childWeights.reduce((a,b)=>a+b,0),leaves=[];
  let v=start;
  for(let j=0;j<children;j++){
   const a=v,b=j===children-1?end:v+(end-start)*childWeights[j]/total,w=b-a;
   const h=(24+r()*27)*(i===count-1?.8:1),floor=base(a),next=base(b);
   const tip=[a+w*.64,floor+h];
   edge([a+w*.10,floor+h*.65],[a+w*.37,floor+h*1.15],tip);
   edge([a+w*.94,floor+h*1.01],[a+w*.98,floor+h*.68],[a+w*.76,floor+h*.66]);
   edge([a+w*.52,floor+h*.56],[a+w*.89,next+5],[b,next]);
   leaves.push({a,b,height:h,waterReach:h*(.47+r()*.13),tip:map(...tip)});v=b;
  }
  plans.push({start,end,children,leaves});u=end;
 }
 const front=frontChart.map(p=>map(...p));
 // Deep water incursions under each child derive from the same plans. The
 // seam is a monotone chart graph, not a reused Cartesian bay/overlay.
 for(let k=0;k<=360;k++){
  const u=uStart+(uEnd-uStart)*k/360;
  const group=plans.find(g=>u<=g.end+1e-10)??plans.at(-1);
  const leaf=group.leaves.find(l=>u<=l.b+1e-10)??group.leaves.at(-1);
  const t=(u-leaf.a)/(leaf.b-leaf.a),head=Math.sin(Math.PI*Math.max(0,Math.min(1,t)))**2;
  waterChart.push([u,base(u)-20+leaf.waterReach*head]);
 }
 const offset=wave.body.findIndex(p=>same(p,wave.frontGraph[0])),after=offset+wave.frontGraph.length;
 const oldEnd=wave.frontGraph.at(-1),frontEnd=front.at(-1);
 const returnEdge=Array.from({length:25},(_,i)=>cubicBezier(frontEnd,map(uEnd+.12,130),map(.35,114),oldEnd,i/24));
 const body=[...wave.body.slice(0,offset),...front,...returnEdge.slice(1),...wave.body.slice(after)];
 const prefix=wave.cap.slice(0,wave.cap.findIndex(p=>same(p,wave.frontGraph[0])));
 // The foam's clean end turns into the same inner chart, before returning
 // down the back. Only body/foam share the visible exterior.
 const innerEnd=map(...waterChart.at(-1));
 const turn=Array.from({length:25},(_,i)=>cubicBezier(frontEnd,map(uEnd+.08,base(uEnd)-8),innerEnd,innerEnd,i/24));
 const backSeam=Array.from({length:65},(_,i)=>map(lerp(uStart,-.6,i/64),lerp(244,210,i/64)));
 const foam=[...prefix,...front,...turn.slice(1),...waterChart.slice(0,-1).reverse().map(p=>map(...p)),...backSeam.slice(1),...wave.cap.slice(-24)];
 const inkSeams=plans.flatMap(g=>g.leaves.map(l=>{
  const t=.67,du=l.b-l.a,points=Array.from({length:21},(_,i)=>{
   const f=i/20;return map(l.a+du*(t-.16*f),base(l.a)+l.height*(.75-.29*f));
  });return {points,strokeWidth:1.45};
 }));
 const all=[...body,...foam,...inkSeams.flatMap(s=>s.points)];
 return {seed,wave,bodyPolygons:[body],foamPolygons:[foam],inkSeams,plans,frontChart,waterChart,diagnostics:{finite:all.flat().every(Number.isFinite),parentCount:count,childCounts:plans.map(g=>g.children),scope:'seeded sector construction; visual/union validity not yet established'}};
}
export function chartCrestSvg(p){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800"><defs><clipPath id="chart-water-${p.seed}"><path d="${path(p.bodyPolygons[0])}"/></clipPath></defs><path d="${path(p.bodyPolygons[0])}" fill="#23485f" stroke="#23485f" stroke-width="2.5"/><g clip-path="url(#chart-water-${p.seed})">${p.wave.bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}${p.wave.strokes.map(s=>`<path d="${line(s)}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><path d="${path(p.foamPolygons[0])}" fill="#eeecd5" stroke="#23485f" stroke-width="2.1"/>${p.inkSeams.map(s=>`<path d="${line(s.points)}" fill="none" stroke="#23485f" stroke-width="${s.strokeWidth}" stroke-linecap="round"/>`).join('')}</svg>`;}
export function chartComposition(seed=721){
 const composition=generateComposition(seed),crest=generateChartCrest(seed);
 const original=compositionSvg(composition),start=original.indexOf('<g transform="matrix('),end=original.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw Error('P084 composition layer contract changed');
 const p=composition.pose,layer=chartCrestSvg(crest).replace(/^<svg[^>]*>/,'').replace(/<\/svg>$/,'');
 return {composition,crest,svg:original.slice(0,start)+`<g transform="matrix(${p.scaleX} 0 0 ${p.scaleY} ${p.offsetX} ${p.offsetY})">`+layer+original.slice(end)};
}
