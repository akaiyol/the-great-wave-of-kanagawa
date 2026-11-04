// P081 study: each cluster is one shared exposed contour, not a union of shafts.
import {generateWave} from './rolled-front.mjs';
import {buildOrderedBay} from './ordered-bay.mjs';
import {cubicBezier,pointInPolygon,polygonSelfCrossings,polygonClearance} from './geometry.mjs';
const same=(a,b)=>a.every((x,k)=>x===b[k]);
const unit=v=>{const d=Math.hypot(...v);return v.map(x=>x/d);};
const sub=(a,b)=>a.map((x,k)=>x-b[k]);
function randomStream(seed){let s=(seed^0xb57d9c31)>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};}
export function clusterBoundary(wave,group,random){
 const start=wave.frontGraph[group.startIndex],end=wave.frontGraph[group.endIndex],delta=sub(end,start),span=Math.hypot(...delta),t=unit(delta);
 let n=[t[1],-t[0]];const desired=group.normal.map(x=>-x);if(n[0]*desired[0]+n[1]*desired[1]<0)n=n.map(x=>-x);
 const P=(s,v)=>start.map((x,k)=>x+t[k]*s+n[k]*v),base=q=>span*.25*Math.sin(Math.PI*q);
 const children=wave.foamNodes.filter(node=>node.parentId===group.rootId).length,count=children+2;
 const weights=Array.from({length:count},()=>.65+.7*random()),sum=weights.reduce((a,b)=>a+b,0),points=[start],leaves=[];
 const edge=(b,c,e)=>{const a=points.at(-1);for(let i=1;i<=20;i++)points.push(cubicBezier(a,b,c,e,i/20));};
 const first=span*.08,last=span*.92;
 const prev=group.startIndex?wave.frontGraph[group.startIndex-1]:wave.body[wave.body.findIndex(p=>same(p,wave.frontGraph[0]))-1];
 const incoming=unit(sub(start,prev)),after=wave.frontGraph[group.endIndex+1],outgoing=unit(sub(after,end));
 edge(start.map((x,k)=>x+incoming[k]*span*.045),P(first*.7,base(.08)),P(first,base(.08)));
 let cursor=first;
 for(let i=0;i<count;i++){
  const w=(last-first)*weights[i]/sum,a=cursor,b=a+w,h=w*(.9+.35*random()),v=Math.max(base(a/span),base(b/span))+h;
  const begin=points.length-1;
  edge(P(a+.04*w,v-.08*h),P(a+.15*w,v+.02*h),P(a+.4*w,v));
  edge(P(a+.95*w,v+.03*h),P(a+.95*w,v-.34*h),P(a+.68*w,v-.32*h));
  edge(P(a+.58*w,v-.42*h),P(a+.90*w,base(b/span)+.15*h),P(b,base(b/span)));
  const root=P(a+w*.5,base((a+w*.5)/span)-w*.12),dir=n.map(x=>x*w*.04);
  leaves.push({id:`${group.rootId}-lobe-${i}`,root,width:w,reach:h,range:[begin,points.length-1],controls:[root,root.map((x,k)=>x+dir[k]),root.map((x,k)=>x+dir[k]*2),root.map((x,k)=>x+dir[k]*3)]});
  cursor=b;
 }
 edge(P(last+span*.03,base(.92)*.5),end.map((x,k)=>x-outgoing[k]*span*.045),end);
 return{group,baseEdge:points,leaves,span,count};
}
export function generateClusterWave(seed=721){
 const wave=generateWave(seed),random=randomStream(seed),clusters=wave.frontGroups.map(g=>clusterBoundary(wave,g,random));
 const replace=polygon=>{
  const offset=polygon.findIndex(p=>same(p,wave.frontGraph[0]));if(offset<0)throw Error('shared front missing');
  const result=[];let cursor=0;
  for(const cluster of clusters){const start=offset+cluster.group.startIndex;result.push(...polygon.slice(cursor,start));if(result.length&&same(result.at(-1),cluster.baseEdge[0]))result.pop();result.push(...cluster.baseEdge);cursor=offset+cluster.group.endIndex+1;}
  result.push(...polygon.slice(cursor));return result;
 };
 const body=replace(wave.body),leaves=clusters.flatMap(c=>c.leaves);
 const grafts=leaves.map(l=>({group:{rootId:l.id},branches:[{controls:l.controls}]}));
 const bay=buildOrderedBay(wave,grafts,body),foam=replace(bay.cap);
 const d={finite:[...body,...foam].flat().every(Number.isFinite),bodyCrossings:polygonSelfCrossings(body),foamCrossings:polygonSelfCrossings(foam),bay:bay.diagnostics,leafCount:leaves.length,clusterCounts:clusters.map(c=>c.count),seamOutside:bay.seam.filter(p=>!pointInPolygon(p,body)&&polygonClearance(p,body)>.1).length,heads:bay.heads.map(h=>({id:h.rootId,inBody:pointInPolygon(h.witness,body),inFoam:pointInPolygon(h.witness,foam)})),roots:leaves.map(l=>({id:l.id,inFoam:pointInPolygon(l.root,foam),inBody:pointInPolygon(l.root,body)}))};
 return{seed,wave,clusters,leaves,bodyPolygons:[body],foamPolygons:[foam],branches:[],inkSeams:[],waterChannels:[],innerBayHeads:bay.heads,diagnostics:d};
}
