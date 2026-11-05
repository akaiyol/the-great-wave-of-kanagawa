import {generateWaterHierarchy} from './water-hierarchy.mjs';
import {generateInkParent} from './ink-parent.mjs';
import {compositionSvg} from '../../src/procedural/composition.mjs';
const same=(a,b)=>a.length===b.length&&a.every((v,i)=>v===b[i]);
const path=p=>'M'+p.map(q=>q.map(x=>x.toFixed(2)).join(',')).join(' L')+' Z';
function replaceWalk(polygon,walk,replacement){
 const matches=[];
 for(let i=0;i<=polygon.length-walk.length;i++)if(walk.every((p,j)=>same(p,polygon[i+j])))matches.push(i);
 if(matches.length!==1)throw new Error('Expected one exact old baseEdge walk, found '+matches.length);
 const i=matches[0];return {points:[...polygon.slice(0,i),...replacement,...polygon.slice(i+walk.length)],index:i};
}
export function generateAttachedParent(seed=721){
 const water=generateWaterHierarchy(seed),baseline=water.variant,old=baseline.primary,local=generateInkParent(seed),groupIndex=old.grafts.length-1,graft=old.grafts[groupIndex];
 const cuts=[];
 for(let i=0;i<local.outline.length;i++){
  const a=local.outline[i],b=local.outline[(i+1)%local.outline.length];
  if((a[0]<40)!==(b[0]<40)){
   const t=(40-a[0])/(b[0]-a[0]);cuts.push({index:i,point:[40,a[1]+t*(b[1]-a[1])]});
  }
 }
 if(cuts.length!==2||cuts[0].point[1]>=cuts[1].point[1]||local.outline[cuts[0].index+1][0]<40)throw new Error('Expected two ordered root cuts and one exposed x>=40 chain');
 const sourceChain=[cuts[0].point,...local.outline.slice(cuts[0].index+1,cuts[1].index+1),cuts[1].point];
 if(sourceChain.some(p=>p[0]<40))throw new Error('Exposed chain leaves clipping half-plane');
 const start=old.wave.frontGraph[graft.group.startIndex],end=old.wave.frontGraph[graft.group.endIndex],delta=end.map((v,i)=>v-start[i]),span=Math.hypot(...delta),t=delta.map(v=>v/span),n=[t[1],-t[0]],scale=span/(cuts[1].point[1]-cuts[0].point[1]);
 const normalLength=Math.hypot(...graft.group.normal),orientation=n.reduce((s,v,i)=>s-v*graft.group.normal[i]/normalLength,0);
 if(!(orientation>0))throw new Error('Similarity outward orientation conflicts with -group.normal');
 const map=p=>start.map((v,i)=>v+scale*((p[0]-40)*n[i]+(p[1]-cuts[0].point[1])*t[i]));
 const sharedChain=sourceChain.map(map);sharedChain[0]=start;sharedChain[sharedChain.length-1]=end;
 const body=replaceWalk(old.baseBody,graft.baseEdge,sharedChain),foam=replaceWalk(old.baseFoam,graft.baseEdge,sharedChain);
 const prefix=`group-${groupIndex}-`,removedIds=old.branches.filter(b=>b.id.startsWith(prefix)).map(b=>b.id),branches=old.branches.filter(b=>!b.id.startsWith(prefix)),inkSeams=old.inkSeams.filter(s=>!removedIds.includes(s.ownerId));
 if(removedIds.length!==graft.branches.length)throw new Error('Selected branch prefix does not match graft branches');
 const marks=local.marks.map(m=>({name:m.name,points:m.polygon.map(map),centerline:m.points.map(map)})),accent=local.accent.map(map);
 const metadata={modifiedGroup:{index:groupIndex,...graft.group},cut:{x:40,cuts,sourceChain,rootEdgeRendered:false},transform:{start,end,t,n,scale,orientation},sharedChain,walkOffsets:{body:body.index,foam:foam.index},removedIds,anchors:Object.fromEntries(Object.entries(local.anchors).map(([k,p])=>[k,map(p)])),marks,accent,validityScope:'Unverified attachment; first-view preflight only'};
 const primary={...old,baseBody:body.points,baseFoam:foam.points,bodyPolygons:[body.points,...branches.map(b=>b.points)],foamPolygons:[foam.points,...branches.map(b=>b.points)],branches,inkSeams,grafts:old.grafts.slice(0,-1),groupCount:old.grafts.length,valid:null,reasons:['P100 geometry changed: validity unverified'],diagnostics:{scope:'P100 unverified reconstructed attachment'},attachedParent:metadata};
 const variant={...baseline,primary};
 const sharedChainIdentity=sharedChain.every((p,i)=>primary.baseBody[body.index+i]===p&&primary.baseFoam[foam.index+i]===p);
 const oldGroupRemoved=primary.branches.every(b=>!b.id.startsWith(prefix))&&primary.inkSeams.every(s=>!removedIds.includes(s.ownerId));
 const finite=[...primary.bodyPolygons,...primary.foamPolygons,...marks.map(m=>m.points),accent].flat(2).every(Number.isFinite);
 if(!finite||!sharedChainIdentity||!oldGroupRemoved)throw new Error('P100 finite/shared-chain/old-group preflight failed');
 let svg=compositionSvg(variant);
 const foamLayer=`<g fill="#eeecd5">${primary.foamPolygons.map(p=>`<path d="${path(p)}"/>`).join('')}</g>`;
 if(svg.split(foamLayer).length!==2)throw new Error('Exact primary foam render insertion interface not found');
 const interior=`<path d="${path(accent)}" fill="#b3d2cc"/>${marks.map(m=>`<path d="${path(m.points)}" fill="#23485f"/>`).join('')}`;
 svg=svg.replace(foamLayer,foamLayer+interior);
 return {seed,baseline,variant,svg,metadata,bandPlans:water.bandPlans,diagnostics:{finite,sharedChainIdentity,oldGroupRemoved,scope:'P100 initial preflight only; attachment/sky/ink and visual validity unverified'}};
}
