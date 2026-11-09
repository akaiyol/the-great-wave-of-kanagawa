import {generateAreaWaterheads} from './area-waterheads.mjs';
const path=ps=>'M'+ps.map(p=>p.join(',')).join(' L')+' Z';
const inside=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
const cubic=(c,t)=>c[0].map((v,k)=>(1-t)**3*v+3*(1-t)**2*t*c[1][k]+3*(1-t)*t*t*c[2][k]+t**3*c[3][k]);
export function generateCoupledMaterial(seed=721){
 const previous=generateAreaWaterheads(seed),baseline=previous.baseline,g=previous.geometry;
 const specifications=[[[[314,178],[300,207],[302,236],[310,269]],13,4],[[[375,136],[362,177],[356,218],[368,255]],14,5]];
 const ivoryRibbons=specifications.map(([spine,rootWidth,tipWidth])=>{
  const centers=Array.from({length:65},(_,i)=>cubic(spine,i/64));
  const tangents=centers.map((p,i)=>{const a=centers[Math.max(0,i-1)],b=centers[Math.min(64,i+1)],d=Math.hypot(b[0]-a[0],b[1]-a[1]);return[(b[0]-a[0])/d,(b[1]-a[1])/d];});
  const normals=tangents.map(([x,y])=>[-y,x]),widths=centers.map((_,i)=>{const t=i/64;return rootWidth+(tipWidth-rootWidth)*t*t*(3-2*t);});
  const side=sign=>centers.map((p,i)=>p.map((v,k)=>v+sign*widths[i]*normals[i][k]));
  const tip=centers[64],n=normals[64],t=tangents[64];
  const cap=Array.from({length:31},(_,i)=>{const a=(i+1)*Math.PI/32;return tip.map((v,k)=>v+tipWidth*(Math.cos(a)*n[k]+Math.sin(a)*t[k]));});
  return{spine,rootWidth,tipWidth,centers,widths,polygon:[...side(1),...cap,...side(-1).reverse()]};
 });
 const blueLobes=g.lobes;
 const insideIvoryRibbons=p=>ivoryRibbons.some(r=>inside(p,r.polygon));
 const materialAt=p=>!g.insideSharedBody(p)?'sky':insideIvoryRibbons(p)||(g.insideOldFoam(p)&&!g.insideLobes(p))?'foam':'blue';
 const witnesses=[[308,249],[363,236],[345,177],[410,157]].map(p=>({p,material:materialAt(p)}));
 const clipId=`p122-coupled-body-${seed}`,paths=ps=>ps.map(poly=>`<path d="${path(poly)}"/>`).join('');
 const layer=`<g data-study="P122"><defs><clipPath id="${clipId}">${paths(g.watercomponents)}</clipPath></defs><g fill="#eeecd5" clip-path="url(#${clipId})">${paths(ivoryRibbons.map(r=>r.polygon))}</g></g>`;
 const at=previous.svg.indexOf('<g><defs><clipPath id="front-');
 if(at<0)throw new Error('P122 foreground interface unavailable');
 return{seed,baseline,previous,svg:previous.svg.slice(0,at)+layer+previous.svg.slice(at),geometry:{...g,blueLobes,ivoryRibbons,insideIvoryRibbons,materialAt},witnesses};
}
