import fs from 'node:fs';
import {generateSupportCove} from './support-cove.mjs';
import {generateMeasuredFork} from './measured-fork.mjs';
import {hash} from '../../src/random.mjs';
import {pointInPolygon,polygonSelfCrossings,polygonClearance} from '../../src/procedural/geometry.mjs';
const s=generateSupportCove(721),g=s.geometry,b=s.baseline.geometry,p=s.baseline.baseline.geometry;
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const inPolys=(q,ps)=>ps.some(poly=>pointInPolygon(q,poly));
const foam=q=>inPolys(q,g.foamcomponents),body=q=>inPolys(q,g.watercomponents),air=q=>!foam(q)&&!body(q);
// Partition each route segment at every material-edge intersection. Testing each
// open interval checks the composed polygon roles continuously, not just vertices.
function route(points,predicate){
 let intervals=0,failures=0,collinearContacts=0;
 for(let k=1;k<points.length;k++){
  const a=points[k-1],b=points[k],r=b.map((v,i)=>v-a[i]),ts=[0,1];
  for(const poly of [...g.foamcomponents,...g.watercomponents])for(let j=0;j<poly.length;j++){
   const c=poly[j],d=poly[(j+1)%poly.length],v=d.map((n,i)=>n-c[i]),den=r[0]*v[1]-r[1]*v[0];
   if(Math.abs(den)<1e-10){
    const q=c.map((n,i)=>n-a[i]),rr=r[0]*r[0]+r[1]*r[1];
    if(rr&&Math.abs(q[0]*r[1]-q[1]*r[0])<1e-9){
     const t0=(q[0]*r[0]+q[1]*r[1])/rr,t1=((d[0]-a[0])*r[0]+(d[1]-a[1])*r[1])/rr;
     const lo=Math.max(0,Math.min(t0,t1)),hi=Math.min(1,Math.max(t0,t1));
     if(lo<=hi){ts.push(lo,hi);collinearContacts++;}
    }
    continue;
   }
   const q=c.map((n,i)=>n-a[i]),t=(q[0]*v[1]-q[1]*v[0])/den,u=(q[0]*r[1]-q[1]*r[0])/den;
   if(t>0&&t<1&&u>=0&&u<=1)ts.push(t);
  }
  const sorted=[...new Set(ts)].sort((x,y)=>x-y);
  for(let j=1;j<sorted.length;j++)if(sorted[j]-sorted[j-1]>1e-10){intervals++;const t=(sorted[j]+sorted[j-1])/2;if(!predicate(a.map((v,i)=>v+r[i]*t)))failures++;}
  for(const t of sorted)if(!predicate(a.map((v,i)=>v+r[i]*t)))failures++;
 }
 return{intervals,failures,collinearContacts,pass:failures===0};
}
const roles={W:route(b.routes.W.points,q=>body(q)&&!foam(q)),F:route(b.routes.F.points,foam),S:route(b.routes.S.points,air)};
const witness=JSON.parse(fs.readFileSync('research/output/agent-phase-2026-11-07/P110/checks.json')).positiveAreaRootWitnesses;
const roots=witness.map(w=>{
 const sheetInside=pointInPolygon(w.point,g.supportsheet),childInside=pointInPolygon(w.point,g.children[w.child]);
 const sheetClearance=polygonClearance(w.point,g.supportsheet),childClearance=polygonClearance(w.point,g.children[w.child]);
 return{...w,sheetInside,childInside,sheetClearance,childClearance,pass:sheetInside&&childInside&&Math.min(sheetClearance,childClearance)>=w.clearance-1e-6};
});
const primitive=generateMeasuredFork(hash(721,106)),root=p.roots[0],scale=p.scales[0];
const start=primitive.anchors.lowerCove.map((v,i)=>root[i]+(v-(i?67:40))*scale);
// Find a diagnostic open-sky path from a pre-existing semantic cove anchor.
// Grid search only proposes a route; polygon-edge partitioning validates it.
let found=null,visited=0;
if(air(start)){
 const queue=[[0,0]],parents=new Map([['0,0',null]]);let at=0,end;
 while(at<queue.length&&at<25000){const u=queue[at++];visited++;const q=u.map((v,i)=>v+start[i]);if(q[0]>=590&&q[1]<=150){end=u;break;}
  for(const d of [[1,0],[0,-1],[-1,0],[0,1]]){const v=u.map((n,i)=>n+d[i]),key=v.join(',');if(v[0]<-45||v[0]>95||v[1]<-40||v[1]>40||parents.has(key)||!air(v.map((n,i)=>n+start[i])))continue;parents.set(key,u);queue.push(v);}
 }
 if(end){const path=[];for(let u=end;u;u=parents.get(u.join(',')))path.push(u.map((v,i)=>v+start[i]));found=path.reverse();}
}
const maxMaterialX=Math.max(...[...g.foamcomponents,...g.watercomponents].flat().map(q=>q[0]));
if(found)found.push([maxMaterialX+10,found.at(-1)[1]]);
const strictAir=q=>air(q)&&[...g.foamcomponents,...g.watercomponents].every(poly=>polygonClearance(q,poly)>1e-7);
const sky={exteriorExit:found?.at(-1),maxMaterialX,anchor:start,anchorAir:air(start),baselineAnchorCovered:inPolys(start,b.watercomponents)||inPolys(start,b.foamcomponents),visited,path:found,validation:found?route(found,strictAir):null,pass:!!found&&route(found,strictAir).pass&&found.at(-1)[0]>maxMaterialX};
const frozen={children:eq(g.children,b.children),seam:eq(g.seam,b.seam),profile:eq(g.profile,b.profile),band:eq(g.band,b.band),waterSuffix:eq(g.waterbase.slice(g.outer.length),b.waterbase.slice(b.outer.length)),nonprimary:s.svg.slice(s.svg.indexOf('</g><g><defs><clipPath id="front-'))===s.baseline.svg.slice(s.baseline.svg.indexOf('</g><g><defs><clipPath id="front-')),deterministic:s.svg===generateSupportCove(721).svg,noFading:!/(?:opacity|filter|mask)=/.test(s.svg)};
frozen.nonprimaryPrefix=s.svg.slice(0,s.svg.indexOf('<g data-study="P116">'))===s.baseline.svg.slice(0,s.baseline.svg.indexOf('<g data-study="P110">'));
const ids=[...s.svg.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);frozen.uniqueIds=ids.length===new Set(ids).size;
const crossings={support:polygonSelfCrossings(g.supportsheet),water:polygonSelfCrossings(g.waterbase)};
const pass=Object.values(roles).every(r=>r.pass)&&roots.every(r=>r.pass)&&sky.pass&&Object.values(frozen).every(Boolean)&&Object.values(crossings).every(x=>x===0);
console.log(JSON.stringify({phase:'P116',seed:721,pass,roles,roots,sky,frozen,crossings,scope:'Specified polygon routes test partition intervals and intersection points, including collinear contacts; sky exit extends beyond main-material x bound. Floating tolerance1e-7, not general topology proof; roots have direct sheet/child interior clearances ≥1.5. One seed/static SVG, not browser or artistic acceptance.'},null,2));
process.exitCode=pass?0:1;
