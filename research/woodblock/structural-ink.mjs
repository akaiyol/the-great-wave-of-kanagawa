import {generateComponentField} from './component-field.mjs';
import {hash,random} from '../../src/random.mjs';
import {pointInPolygon} from '../../src/procedural/geometry.mjs';
const pt=p=>p.map(v=>Number(v.toFixed(3))).join(',');
const path=ps=>'M'+ps.map(pt).join(' L')+' Z';
const mix=(a,b,t)=>a.map((v,i)=>v+(b[i]-v)*t);
function cubic(c,t){const s=1-t;return c[0].map((v,i)=>s**3*v+3*s*s*t*c[1][i]+3*s*t*t*c[2][i]+t**3*c[3][i]);}
export function generateStructuralInk(seed=721){
 const baseline=generateComponentField(seed),g=baseline.geometry,r=random(hash(seed,0x50313038));
 const inFoam=p=>g.foamcomponents.some(poly=>pointInPolygon(p,poly));
 const seam=g.seam,lengths=[0];
 for(let i=1;i<seam.length;i++)lengths.push(lengths.at(-1)+Math.hypot(seam[i][0]-seam[i-1][0],seam[i][1]-seam[i-1][1]));
 function station(distance){
  distance=Math.max(0,Math.min(lengths.at(-1),distance));let i=1;while(i<lengths.length-1&&lengths[i]<distance)i++;
  const a=seam[i-1],b=seam[i],d=Math.hypot(b[0]-a[0],b[1]-a[1])||1;
  return {center:mix(a,b,(distance-lengths[i-1])/(lengths[i]-lengths[i-1]||1)),tangent:[(b[0]-a[0])/d,(b[1]-a[1])/d]};
 }
 const candidates=[];
 for(let distance=20;distance<lengths.at(-1);distance+=40){
  for(const offset of [14,34,56]){
   const s=station(distance+(r()-.5)*10),normal=[-s.tangent[1],s.tangent[0]];
   const plus=inFoam(s.center.map((v,i)=>v+normal[i]*8)),minus=inFoam(s.center.map((v,i)=>v-normal[i]*8));
   const sign=plus?1:minus?-1:0;
   const center=s.center.map((v,i)=>v+normal[i]*offset*sign);
   if(center[0]>=270)candidates.push({source:'seam',center,angle:Math.atan2(s.tangent[1],s.tangent[0]),distance,offset,normalFound:sign!==0});
  }
 }
 g.roots.forEach((root,i)=>candidates.push({source:'parent-I',center:[root[0]+64*g.scales[i],root[1]+7*g.scales[i]],angle:0,parent:i,normalFound:true}));
 const marks=candidates.map((candidate,index)=>{
  const kind=r()<.65?'hood':'counter',across=16+r()*10,aspect=.7+r()*.5,angle=candidate.angle+(r()-.5)*.6,maxWidth=1.4+r();
  const shape=kind==='hood'?[
   [[-.46,.12],[-.5,-.25],[-.28,-.48],[0,-.46]],
   [[0,-.46],[.33,-.45],[.49,-.05],[.35,.25]],
   [[.35,.25],[.29,.45],[.04,.49],[-.17,.43]],
  ]:[ [[-.39,.28],[-.46,.04],[-.18,-.12],[.08,-.11]], [[.08,-.11],[.23,-.12],[.34,-.03],[.43,.04]] ];
  const controls=shape.map(c=>c.map(([x,y])=>{
   const dx=x*across,dy=y*across*aspect;return[candidate.center[0]+dx*Math.cos(angle)-dy*Math.sin(angle),candidate.center[1]+dx*Math.sin(angle)+dy*Math.cos(angle)];
  }));
  const centerline=controls.flatMap((c,i)=>Array.from({length:33},(_,j)=>cubic(c,j/32)).slice(i?1:0));
  const sides=[[],[]],widths=[];
  centerline.forEach((p,i)=>{
   const a=centerline[Math.max(0,i-1)],b=centerline[Math.min(centerline.length-1,i+1)],dx=b[0]-a[0],dy=b[1]-a[1],d=Math.hypot(dx,dy)||1;
   const width=(i===0||i===centerline.length-1)?0:maxWidth*Math.sin(Math.PI*i/(centerline.length-1))**.65;widths.push(width);
   sides[0].push([p[0]+dy/d*width/2,p[1]-dx/d*width/2]);sides[1].push([p[0]-dy/d*width/2,p[1]+dx/d*width/2]);
  });
  const polygon=[...sides[0],...sides[1].toReversed()];
  // Sample the entire narrow strip, not just its centerline. Probe a 2-unit
  // disk at every transverse sample. This is bounded sampled containment.
  let fit=candidate.normalFound,failedSamples=0,fitSamples=0;
  for(let i=0;i<sides[0].length;i++)for(const t of [0,.25,.5,.75,1]){
   const p=mix(sides[0][i],sides[1][i],t);
   for(let j=0;j<16;j++){
    const a=j*Math.PI/8,q=[p[0]+2*Math.cos(a),p[1]+2*Math.sin(a)];fitSamples++;
    if(!inFoam(q)){fit=false;failedSamples++;}
   }
  }
  return {...candidate,index,kind,across,aspect,angle,maxWidth,controls,centerline,widths,polygon,closed:false,fit,fitSamples,failedSamples};
 });
 const accepted=marks.filter(m=>m.fit),finite=marks.every(m=>[...m.centerline,...m.polygon].every(p=>p.every(Number.isFinite)));
 if(!finite)throw new Error('P108 nonfinite ink ribbon');
 const marker='</g><g><defs><clipPath id="front-',at=baseline.svg.indexOf(marker);
 if(at<0)throw new Error('P108 primary-end SVG interface unavailable');
 const layer=`<g data-study="P108" fill="#23485f">${accepted.map(m=>`<path d="${path(m.polygon)}"/>`).join('')}</g>`;
 const svg=baseline.svg.slice(0,at)+layer+baseline.svg.slice(at);
 return {seed,baseline,svg,marks,diagnostics:{finite,generated:marks.length,accepted:accepted.length,rejected:marks.length-accepted.length,parentCandidates:4,fitRule:'Sampled full transverse ribbons with 16-direction 2-unit margin; not exact continuous containment.',scope:'Frozen P106 geometry; structural ink ablation only, visual and ribbon integrity review pending.'}};
}
