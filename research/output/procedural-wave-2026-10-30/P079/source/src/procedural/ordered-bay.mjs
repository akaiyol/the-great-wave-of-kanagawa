import {cubicBezier,pointInPolygon,polygonClearance} from './geometry.mjs';

// Both sides of the water mouth use the same longitudinal chart. The
// descending head boundary is a graph; the returning entry stays below it
// and inside the actual body. No source-image mask defines these constraints.
export function buildOrderedBay(wave,grafts,body){
 const chart=wave.surfaceChart,map=(u,r)=>chart.map(u,r);
 const signedClearance=p=>{const d=polygonClearance(p,body);return pointInPolygon(p,body)?d:-d;};
 const plans=grafts.map(g=>{const [u,r]=chart.inverseFront(g.branches[0].controls[0]);return{rootId:g.group.rootId,u,r:r-18};}).sort((a,b)=>b.u-a.u);
 const headCurve=h=>[[h.u+h.halfWidth,h.r-15],[h.u+h.halfWidth,h.r+8],[h.u-h.halfWidth*.65,h.r+10],[h.u-h.halfWidth,h.r-12]];
 const heads=plans.map((h,i)=>{
  const gap=Math.min(...plans.filter((_,j)=>j!==i).map(q=>Math.abs(q.u-h.u)));
  let halfWidth=Math.min(.13,gap*.27),attempts=0,minClearance;
  for(;attempts<18;attempts++){
   const controls=headCurve({...h,halfWidth});
   minClearance=Math.min(...Array.from({length:49},(_,j)=>signedClearance(map(...cubicBezier(...controls,j/48)))));
   if(minClearance>=2)break;
   halfWidth*=.8;
  }
  return{...h,halfWidth,head:map(h.u,h.r),witness:map(h.u,h.r-2),fitAttempts:attempts,minBodyClearance:minClearance};
 });
 const profile=[],first=heads[0];let position=[first.u+first.halfWidth,first.r-15];profile.push(position);
 const edge=(b,c,e)=>{const a=position;for(let i=1;i<=32;i++)profile.push(cubicBezier(a,b,c,e,i/32));position=e;};
 for(let i=0;i<heads.length;i++){
  const h=heads[i],w=h.halfWidth;
  edge([h.u+w,h.r+8],[h.u-w*.65,h.r+10],[h.u-w,h.r-12]);
  if(i+1<heads.length){
   const next=heads[i+1],mid=(h.u+next.u)/2,depth=Math.min(h.r,next.r)-38,start=h.u-w,target=next.u+next.halfWidth;
   edge([start+(mid-start)*.25,h.r-30],[mid+(start-mid)*.15,depth],[mid,depth]);
   edge([mid-(mid-target)*.15,depth],[target,next.r-28],[target,next.r-14]);
  }
 }
 const last=heads.at(-1);
 edge([last.u-.25,last.r-12],[-.22,217],[-.6,210]);
 const monotone=profile.every((p,i)=>!i||p[0]<=profile[i-1][0]+1e-12);
 const upperAt=u=>{
  let i=0;while(i+1<profile.length&&profile[i+1][0]>u)i++;
  const a=profile[i],b=profile[Math.min(i+1,profile.length-1)];
  const t=a[0]===b[0]?0:(u-a[0])/(b[0]-a[0]);return a[1]+(b[1]-a[1])*t;
 };
 const innerAt=u=>{
  let previous=40;
  for(let r=42;r<=420;r+=2){
   if(pointInPolygon(map(u,r),body)){
    let lo=previous,hi=r;for(let k=0;k<18;k++){const mid=(lo+hi)/2;if(pointInPolygon(map(u,mid),body))hi=mid;else lo=mid;}
    return hi;
   }previous=r;
  }
  return NaN;
 };
 const maxU=profile[0][0],endR=profile[0][1];
 const desiredControls=[[.2,135],[.65,125],[maxU,155],[maxU,endR]];
 const desiredAt=u=>{
  let lo=0,hi=1;
  for(let k=0;k<24;k++){const t=(lo+hi)/2;if(cubicBezier(...desiredControls,t)[0]<u)lo=t;else hi=t;}
  return cubicBezier(...desiredControls,(lo+hi)/2)[1];
 };
 // Include every head/cove knot so a coarse entry edge cannot bridge over
 // a narrow radial minimum between otherwise valid endpoint samples.
 const stations=[...new Set([.2,maxU,...Array.from({length:127},(_,i)=>.2+(maxU-.2)*(i+1)/128),...profile.map(p=>p[0]).filter(u=>u>.2&&u<maxU)])].sort((a,b)=>a-b);
 const entry=[[.2,135]],corridor=[];
 for(let i=1;i<stations.length;i++){
  const u=stations[i],t=(u-.2)/(maxU-.2),inner=innerAt(u),upper=upperAt(u),available=upper-inner;
  const desired=desiredAt(u),separation=Math.min(4*Math.sqrt(1-t),Math.max(0,available*.25));
  const r=i===stations.length-1?endR:Math.min(upper-separation,Math.max(inner+Math.min(2,available*.25),desired));
  entry.push([u,r]);corridor.push({u,inner,upper,available,r});
 }
 const end=wave.frontGraph.at(-1),index=wave.cap.findIndex(p=>p[0]===end[0]&&p[1]===end[1]),prefix=wave.cap.slice(0,index+25);
 const seam=[...entry.map(p=>map(...p)),...profile.slice(1).map(p=>map(...p))];
 return{cap:[...prefix,...seam.slice(1),...wave.cap.slice(-24)],heads,seam,diagnostics:{method:'body-constrained ordered chart',entrySampling:'head-profile knots plus regular chart grid',headProfileMonotone:monotone,minEntryCorridor:Math.min(...corridor.map(c=>c.available)),entryFinite:entry.flat().every(Number.isFinite),entryOutsideBody:entry.filter(p=>signedClearance(map(...p))<-.1).length,headFits:heads.map(h=>({rootId:h.rootId,attempts:h.fitAttempts,halfWidth:h.halfWidth,minBodyClearance:h.minBodyClearance})),entryChart:entry,headProfileChart:profile}};
}
