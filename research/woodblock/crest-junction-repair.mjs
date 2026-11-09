import {generateCrestJunctionGroup} from './crest-junction-group.mjs';
import {segmentsCross,pointInPolygon} from '../../src/procedural/geometry.mjs';
export const path=ps=>'M'+ps.map(p=>p.map(v=>Number(v.toFixed(3))).join(',')).join(' L')+' Z';
export const area=ps=>Math.abs(ps.reduce((s,p,i)=>{const q=ps[(i+1)%ps.length];return s+p[0]*q[1]-q[0]*p[1];},0)/2);
export function generateCrestJunctionRepair(seed=721){
 const raw=generateCrestJunctionGroup(seed),p=raw.geometry.profile,hits=[];
 for(let i=0;i<p.length-1;i++)for(let j=i+2;j<p.length-1;j++)if(segmentsCross(p[i],p[i+1],p[j],p[j+1]))hits.push([i,j]);
 if(hits.length!==1)throw new Error('P131 requires exactly one proper crossing');
 const [i,j]=hits[0],a=p[i],b=p[i+1],c=p[j],d=p[j+1],r=b.map((v,k)=>v-a[k]),s=d.map((v,k)=>v-c[k]);
 const cross=(u,v)=>u[0]*v[1]-u[1]*v[0],t=cross(c.map((v,k)=>v-a[k]),s)/cross(r,s),q=a.map((v,k)=>v+t*r[k]);
 const cycle=[q,...p.slice(i+1,j+1)],cycleArea=area(cycle);let diameter=0;for(const x of cycle)for(const y of cycle)diameter=Math.max(diameter,Math.hypot(...x.map((v,k)=>v-y[k])));
 if(cycleArea>2.25||diameter>3)throw new Error('P131 cycle exceeds eligibility');
 const profile=[...p.slice(0,i+1),q,...p.slice(j+1)],g=raw.geometry;
 const start=g.seam.findIndex(p=>p[0]===440&&p[1]===205),end=g.seam.findIndex((p,k)=>k>start&&p[0]===310&&p[1]===200);
 const seam=[...g.seam.slice(0,start),...profile,...g.seam.slice(end+1)],supportsheet=[...g.outer,...seam.slice(1)],foamcomponents=[supportsheet,...g.children];
 const old=`<path d="${path(g.supportsheet)}"/>`,replacement=`<path d="${path(supportsheet)}"/>`,replacementCount=raw.svg.split(old).length-1;
 if(replacementCount!==2)throw new Error('P131 replacement count');
 const svg=raw.svg.split(old).join(replacement).replace('data-seam-study="P130"','data-seam-study="P130" data-integrity-study="P131"');
 const materialAt=p=>!g.watercomponents.some(poly=>pointInPolygon(p,poly))?'sky':foamcomponents.some(poly=>pointInPolygon(p,poly))?'foam':'blue';
 return {seed,baseline:raw.baseline,rawP130:raw,svg,geometry:{...g,profile,seam,supportsheet,foamcomponents,materialAt},materialAt,cleanup:{i,j,q,cycleArea,diameter,replacementCount,cycleBounds:[Math.min(...cycle.map(p=>p[0])),Math.min(...cycle.map(p=>p[1])),Math.max(...cycle.map(p=>p[0])),Math.max(...cycle.map(p=>p[1]))],lostOriginalToe:true,C1Preserved:false}};
}
