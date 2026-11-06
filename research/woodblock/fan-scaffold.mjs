import {generateWaterHierarchy} from './water-hierarchy.mjs';
import {hash,random} from '../../src/random.mjs';

const point=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const polygon=ps=>'M'+ps.map(point).join(' L')+' Z';
const line=ps=>'M'+ps.map(point).join(' L');
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function cubic([a,b,c,d],t){
 const s=1-t;return a.map((v,i)=>s*s*s*v+3*s*s*t*b[i]+3*s*t*t*c[i]+t*t*t*d[i]);
}
function sample(segments,n=48){
 return segments.flatMap((segment,i)=>Array.from({length:n+(i===segments.length-1?1:0)},(_,j)=>cubic(segment,j/n)));
}

// Research-only macro sheet: all coordinates are in the composition frame.
// Outer samples belong jointly to the water body and foam. The return seam
// is independently constructed; no inset, circular chart or internal holes.
export function generateFanScaffold(seed=721){
 const checkpoint=generateWaterHierarchy(seed),baseline=checkpoint.variant;
 const r=random(hash(seed,0x50313032));
 const jitter=(p,amount=5)=>p.map(v=>v+(r()-.5)*amount*2);
 const O=[0,300],A=jitter([360,90]),B=jitter([500,92]),F=jitter([690,345]),H=jitter([465,335]);
 const outerControls=[
  [O,jitter([150,230]),jitter([230,92]),A],
  [A,jitter([405,73]),jitter([465,73]),B],
  [B,jitter([590,115]),jitter([660,242]),F],
  [F,jitter([645,335]),jitter([545,305]),H],
 ];
 const outer=sample(outerControls);
 const hollowControls=[
  [H,jitter([415,385]),jitter([415,505]),jitter([475,595])],
 ];
 const knee=hollowControls[0][3],foot=jitter([620,700]);
 hollowControls.push([knee,jitter([505,645]),jitter([565,680]),foot]);
 const hollow=sample(hollowControls);
 const seamAnchors=[H,jitter([500,270]),jitter([450,205]),jitter([385,170]),jitter([310,190]),jitter([275,215]),[0,330]];
 const seamControls=[
  [seamAnchors[0],jitter([480,315]),jitter([511,292]),seamAnchors[1]],
  [seamAnchors[1],jitter([494,245]),jitter([468,230]),seamAnchors[2]],
  [seamAnchors[2],jitter([426,192]),jitter([409,168]),seamAnchors[3]],
  [seamAnchors[3],jitter([355,166]),jitter([344,198]),seamAnchors[4]],
  [seamAnchors[4],jitter([290,185]),jitter([288,211]),seamAnchors[5]],
  [seamAnchors[5],jitter([190,227]),jitter([90,307]),seamAnchors[6]],
 ];
 const seam=sample(seamControls,24);
 const body=[...outer,...hollow.slice(1),[730,830],[0,830]];
 const foam=[...outer,...seam.slice(1)];
 // Two independently controlled longitudinal water paths define a ruled
 // frame. Unequal opaque bands interpolate across it, not across arc radii.
 const outsideControls=[[ [0,830],jitter([0,590]),jitter([80,290]),seamAnchors[5] ]];
 const insideControls=[[ [730,830],jitter([465,685]),jitter([375,430]),H ]];
 const outside=sample(outsideControls,192),inside=sample(insideControls,192);
 const plans=[{u:.15,width:.022},{u:.34,width:.014},{u:.57,width:.035},{u:.81,width:.012}]
  .map((p,i)=>({...p,phase:r()*Math.PI*2,color:['#2b607f','#346e8b'][i%2]}));
 const bands=plans.map(p=>{
  const upper=[],lower=[];
  for(let i=0;i<outside.length;i++){
   const t=i/(outside.length-1),u=p.u+.008*Math.sin(t*Math.PI*1.4+p.phase),half=p.width*(.15+.85*Math.sin(Math.PI*t)**.65)/2;
   upper.push(mix(outside[i],inside[i],u-half));lower.push(mix(outside[i],inside[i],u+half));
  }
  return {color:p.color,points:[...upper,...lower.toReversed()]};
 });
 const strokes=[.25,.46,.7].map(u=>outside.map((p,i)=>mix(p,inside[i],u)));
 const geometry={outer,body,foam,hollow,seam,bands,strokes,outside,inside,controls:{outer:outerControls,hollow:hollowControls,seam:seamControls,outside:outsideControls,inside:insideControls},plans};
 const points=[...body,...foam,...bands.flatMap(b=>b.points),...strokes.flat()];
 const finite=points.every(p=>p.length===2&&p.every(Number.isFinite));
 const sharedOuter=outer.every((p,i)=>body[i]===p&&foam[i]===p);
 const primary=`<g data-study="P102"><defs><clipPath id="fan-body-${seed}"><path d="${polygon(body)}"/></clipPath></defs><path d="${polygon(body)}" fill="#23485f"/><g clip-path="url(#fan-body-${seed})">${bands.map(b=>`<path d="${polygon(b.points)}" fill="${b.color}"/>`).join('')}${strokes.map(ps=>`<path d="${line(ps)}" fill="none" stroke="#23485f" stroke-width="1.5"/>`).join('')}</g><path d="${polygon(foam)}" fill="#eeecd5" stroke="#23485f" stroke-width="1.5"/></g>`;
 const pose=baseline.pose;
 const marker=`<g transform="matrix(${pose.scaleX} 0 0 ${pose.scaleY} ${pose.offsetX} ${pose.offsetY})">`;
 const start=checkpoint.svg.indexOf(marker),end=checkpoint.svg.indexOf('</g><g><defs><clipPath id="front-',start);
 if(start<0||end<0)throw new Error('P102 primary SVG replacement interface unavailable');
 const prefix=checkpoint.svg.slice(0,start),suffix=checkpoint.svg.slice(end+4);
 const svg=prefix+primary+suffix;
 const diagnostics={finite,sharedOuter,unchangedSceneLayers:svg.startsWith(prefix)&&svg.endsWith(suffix),primaryReplacementCount:checkpoint.svg.split(marker).length-1,scope:'Coarse macro scaffold only; polygon integrity and native visual comparison pending. No branch anatomy or artistic acceptance.'};
 if(!finite||!sharedOuter||diagnostics.primaryReplacementCount!==1)throw new Error('P102 finite/shared-boundary preflight failed');
 return {seed,baseline,svg,geometry,diagnostics};
}
