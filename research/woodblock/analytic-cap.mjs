import {generateLinkedParentInk} from './linked-parent-ink.mjs';
export const path=ps=>'M'+ps.map(p=>p.map(v=>Number(v.toFixed(3))).join(',')).join(' L')+' Z';
export const area=ps=>Math.abs(ps.reduce((s,p,i)=>{const q=ps[(i+1)%ps.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2);
export function generateAnalyticCap(recipe,seed=721){
 const baseline=generateLinkedParentInk(seed),g=baseline.baseline.geometry;
 const parameters=recipe.construction.parameters;
 const same=(a,b)=>a.every((v,k)=>Math.abs(v-b[k])<1e-10);
 const strip=ps=>ps.filter((p,i)=>!i||!same(p,ps[i-1]));
 const hook=h=>{
  const {R,w,L,sx,sy,c}=h, start=Math.PI,end=start+h.sweepDegrees*Math.PI/180;
  const rotation=h.angleDegrees*Math.PI/180,ro=R+w/2,ri=R-w/2;
  const embed=([x,y])=>[c[0]+Math.cos(rotation)*sx*x-Math.sin(rotation)*sy*y,c[1]+Math.sin(rotation)*sx*x+Math.cos(rotation)*sy*y];
  let angles=Array.from({length:193},(_,i)=>start+(end-start)*i/192);
  const bump=h.shoulderBump;
  const bs=bump?1.8*Math.PI:0,be=bump?2.1*Math.PI:0;
  if(bump)angles.push(...Array.from({length:49},(_,i)=>bs+(be-bs)*i/48));
  angles.sort((a,b)=>a-b);angles=angles.filter((v,i)=>!i||Math.abs(v-angles[i-1])>1e-12);
  const radial=(r,t)=>[r*Math.cos(t),r*Math.sin(t)];
  const outer=angles.map(t=>radial(ro+(bump&&t>=bs&&t<=be?bump.amplitude*Math.sin(Math.PI*(t-bs)/(be-bs))**2:0),t));
  const center=radial(R,end);
  const cap=Array.from({length:33},(_,i)=>{const p=radial(w/2,end+Math.PI*i/32);return center.map((v,k)=>v+p[k]);});
  const inner=Array.from({length:193},(_,i)=>radial(ri,end-(end-start)*i/192));
  return strip([[-ro,L],...outer,...cap,...inner,[-ri,L]].map(embed));
 };
 const end=[499.09302928219745,232.8450269853508];
 const profile=strip([[275,215],...hook(parameters[0]),[343,211],...hook(parameters[1]),[434,190],end]);
 const first=g.seam.findIndex(p=>p[0]===end[0]&&p[1]===end[1]),last=g.seam.findIndex((p,i)=>i>first&&p[0]===275&&p[1]===215);
 if(first!==480||last<0)throw new Error('P134 exact seam interface unavailable');
 const seam=[...g.seam.slice(0,first),...profile.toReversed(),...g.seam.slice(last+1)],supportsheet=[...g.outer,...seam.slice(1)];
 return {seed,baseline,profile,geometry:{...g,seam,supportsheet,foamcomponents:[supportsheet,...g.children]},first,last};
}
export function composeAnalyticCap(study){
 const old=`<path d="${path(study.baseline.baseline.geometry.supportsheet)}"/>`,replacement=`<path d="${path(study.geometry.supportsheet)}"/>`;
 if(study.baseline.svg.split(old).length-1!==2)throw new Error('P134 expected two sheet paths');
 return study.baseline.svg.split(old).join(replacement).replace('<svg ','<svg data-seam-study="P134" ');
}
