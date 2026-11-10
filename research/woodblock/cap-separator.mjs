import {generateLinkedParentInk} from './linked-parent-ink.mjs';
export const path=ps=>'M'+ps.map(p=>p.map(v=>Number(v.toFixed(3))).join(',')).join(' L')+' Z';
export const area=ps=>Math.abs(ps.reduce((s,p,i)=>{const q=ps[(i+1)%ps.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2);
export function generateCapSeparator(recipe,seed=721){
 const baseline=generateLinkedParentInk(seed),g=baseline.baseline.geometry;
 const profile=[recipe.controls[0][0]];
 for(const c of recipe.controls)for(let j=1;j<=48;j++){const t=j/48,s=1-t;profile.push(j===48?c[3]:c[0].map((v,k)=>s**3*v+3*s*s*t*c[1][k]+3*s*t*t*c[2][k]+t**3*c[3][k]));}
 const first=g.seam.findIndex(p=>p[0]===recipe.end[0]&&p[1]===recipe.end[1]),last=g.seam.findIndex((p,i)=>i>first&&p[0]===275&&p[1]===215);
 if(first!==480||last<0)throw new Error('P133 exact seam interface unavailable');
 const seam=[...g.seam.slice(0,first),...profile.toReversed(),...g.seam.slice(last+1)],supportsheet=[...g.outer,...seam.slice(1)];
 return {seed,baseline,profile,geometry:{...g,seam,supportsheet,foamcomponents:[supportsheet,...g.children]},first,last};
}
export function composeCapSeparator(study){
 const old=`<path d="${path(study.baseline.baseline.geometry.supportsheet)}"/>`,replacement=`<path d="${path(study.geometry.supportsheet)}"/>`;
 if(study.baseline.svg.split(old).length-1!==2)throw new Error('P133 expected two sheet paths');
 return study.baseline.svg.split(old).join(replacement).replace('<svg ','<svg data-seam-study="P133" ');
}
