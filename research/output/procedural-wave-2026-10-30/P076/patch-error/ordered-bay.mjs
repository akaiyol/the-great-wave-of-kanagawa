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
  const desired=desiredAt(u),separation=Math.min(4*Math.sqrt(1-t),Math.max(0,available*.25));
  const r=i===stations.length-1?endR:Math.min(upper-separation,Math.max(inner+Math.min(2,available*.25),desired));
  entry.push([u,r]);corridor.push({u,inner,upper,available,r});
 }
 const end=wave.frontGraph.at(-1),index=wave.cap.findIndex(p=>p[0]===end[0]&&p[1]===end[1]),prefix=wave.cap.slice(0,index+25);
 const seam=[...entry.map(p=>map(...p)),...profile.slice(1).map(p=>map(...p))];
 return{cap:[...prefix,...seam.slice(1),...wave.cap.slice(-24)],heads,seam,diagnostics:{method:'flowing trajectory with body-constrained ordered chart',entrySampling:'head-profile knots plus regular chart grid',headProfileMonotone:monotone,minEntryCorridor:Math.min(...corridor.map(c=>c.available)),entryFinite:entry.flat().every(Number.isFinite),entryOutsideBody:entry.filter(p=>signedClearance(map(...p))<-.1).length,headFits:heads.map(h=>({rootId:h.rootId,attempts:h.fitAttempts,halfWidth:h.halfWidth,minBodyClearance:h.minBodyClearance})),entryChart:entry,headProfileChart:profile}};
}
