import {generateSupportCove} from './support-cove.mjs';
const path=ps=>'M'+ps.map(p=>p.join(',')).join(' L')+' Z';
const inside=(p,poly)=>{let yes=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes;}return yes;};
const cubic=(c,t)=>c[0].map((v,k)=>(1-t)**3*v+3*(1-t)**2*t*c[1][k]+3*(1-t)*t*t*c[2][k]+t**3*c[3][k]);
export function generateAreaWaterheads(seed=721){
 const baseline=generateSupportCove(seed),g=baseline.geometry;
 const specifications=[[[[250,340],[245,300],[270,250],[285,225]],24,16],[[[310,345],[300,285],[320,230],[345,192]],28,20],[[[380,350],[355,280],[385,220],[405,172]],32,20]];
 const lobes=specifications.map(([spine,rootWidth,tipWidth])=>{
  const centers=Array.from({length:65},(_,i)=>cubic(spine,i/64));
  const tangents=centers.map((p,i)=>{const a=centers[Math.max(0,i-1)],b=centers[Math.min(64,i+1)],d=Math.hypot(b[0]-a[0],b[1]-a[1]);return[(b[0]-a[0])/d,(b[1]-a[1])/d];});
  const normals=tangents.map(([x,y])=>[-y,x]),widths=centers.map((_,i)=>{const t=i/64;return rootWidth+(tipWidth-rootWidth)*t*t*(3-2*t);});
  const side=sign=>centers.map((p,i)=>p.map((v,k)=>v+sign*widths[i]*normals[i][k]));
  const tip=centers[64],n=normals[64],t=tangents[64];
  const cap=Array.from({length:31},(_,i)=>{const a=(i+1)*Math.PI/32;return tip.map((v,k)=>v+tipWidth*(Math.cos(a)*n[k]+Math.sin(a)*t[k]));});
  return{spine,rootWidth,tipWidth,centers,widths,polygon:[...side(1),...cap,...side(-1).reverse()]};
 });
 const insideSharedBody=p=>g.watercomponents.some(poly=>inside(p,poly));
 const insideOldFoam=p=>g.foamcomponents.some(poly=>inside(p,poly));
 const insideLobes=p=>lobes.some(l=>inside(p,l.polygon));
 const materialAt=p=>!insideSharedBody(p)?'sky':insideOldFoam(p)&&!insideLobes(p)?'foam':'blue';
 const diagnostics={finite:lobes.every(l=>l.polygon.every(p=>p.every(Number.isFinite))),lobes:lobes.map(l=>{
  const boundary=l.polygon.flatMap((a,i)=>{const b=l.polygon[(i+1)%l.polygon.length];return[a,a.map((v,k)=>(v+b[k])/2)];});
  const a=l.polygon[0],b=l.polygon.at(-1),roots=Array.from({length:31},(_,i)=>a.map((v,k)=>v+(b[k]-v)*(i+1)/32));
  return{boundarySamples:boundary.length,boundaryOutsideSharedBody:boundary.filter(p=>!insideSharedBody(p)).length,rootInteriorSamples:roots.length,rootInteriorsExistingBlue:roots.every(p=>insideSharedBody(p)&&!insideOldFoam(p))};
 })};
 diagnostics.boundaryContained=diagnostics.lobes.every(l=>l.boundaryOutsideSharedBody===0);
 diagnostics.rootsExistingBlue=diagnostics.lobes.every(l=>l.rootInteriorsExistingBlue);
 const clipId=`p121-area-body-${seed}`,paths=ps=>ps.map(poly=>`<path d="${path(poly)}"/>`).join('');
 const layer=`<g data-study="P121"><defs><clipPath id="${clipId}">${paths(g.watercomponents)}</clipPath></defs><g fill="#23485f" clip-path="url(#${clipId})">${paths(lobes.map(l=>l.polygon))}</g></g>`;
 const at=baseline.svg.indexOf('<g><defs><clipPath id="front-');
 if(at<0)throw new Error('P121 foreground interface unavailable');
 return{seed,baseline,svg:baseline.svg.slice(0,at)+layer+baseline.svg.slice(at),geometry:{...g,lobes,insideSharedBody,insideOldFoam,insideLobes,materialAt},diagnostics};
}
