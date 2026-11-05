import {generateParentFork} from './parent-fork.mjs';
import {cubicBezier,pointInPolygon} from '../../src/procedural/geometry.mjs';

export const mapping={sourceP:[2086.4,980.9],primitiveP:[60,60],sourceBand:[[2140,1098],[2144,1099]],uncertainty:6,scope:'Approximate translation; uncertainty exceeds segmentation band, not pixel truth'};
export const target=mapping.sourceBand[0].map((v,i)=>(v+mapping.sourceBand[1][i])/2-mapping.sourceP[i]+mapping.primitiveP[i]);
const pt=p=>p.map(v=>v.toFixed(3)).join(',');
const polygon=p=>'M'+p.map(pt).join(' L')+' Z';

export function generateMeasuredFork(seed=721){
 const baseline=generateParentFork(seed),curves=structuredClone(baseline.curves);
 const inner=curves.find(c=>c.feature==='B-inner'),notch=curves.find(c=>c.feature==='B-C-notch');
 // Horizontal leftward tangents agree at the registered upper-right apex.
 inner.controls=[inner.controls[0],[128,179],[target[0]+6,target[1]],[...target]];
 notch.controls=[[...target],[target[0]-6,target[1]],notch.controls[2],notch.controls[3]];
 const outline=[curves[0].controls[0]];
 for(const c of curves)for(let i=1;i<=32;i++)outline.push(cubicBezier(...c.controls,i/32));
 const coverage=baseline.supports.map(s=>{
  let inside=true;
  for(let k=1;k<s.points.length;k++)for(let i=0;i<=12;i++){
   const t=i/12,p=s.points[k-1].map((v,j)=>v+(s.points[k][j]-v)*t);
   for(const d of [[0,0],[3,0],[-3,0],[0,3],[0,-3]])inside&&=pointInPolygon(p.map((v,j)=>v+d[j]),outline);
  }
  return {from:s.from,to:s.to,inside};
 });
 const finite=[...outline,...baseline.ink,...baseline.accent].flat().every(Number.isFinite);
 if(!finite||!coverage.every(c=>c.inside))throw new Error('Measured fork finite/support preflight failed: '+JSON.stringify({finite,coverage}));
 const d='M'+pt(curves[0].controls[0])+curves.map(c=>' C'+c.controls.slice(1).map(pt).join(' ')).join('')+' Z';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 250 260"><rect width="250" height="260" fill="#e6dcc1"/><path d="${d}" fill="#eeecd5" stroke="#23485f" stroke-width="2.1" stroke-linejoin="round"/><path d="${polygon(baseline.accent)}" fill="#b3d2cc"/><path d="${polygon(baseline.ink)}" fill="#23485f"/></svg>`;
 return {...baseline,curves,outline,coverage,svg,mapping,target,modifiedFeatures:['B-inner','B-C-notch'],diagnostics:{finite,forkLevelsImplemented:coverage.every(c=>c.inside),scope:'P097 finite geometry and four actual sampled support corridors only; native visual review pending'}};
}
