// W063: opt-in one-group replacement with continuous parent-flank attachment.
import {buildBranchCreases} from './branch-creases.mjs';
import {generateWave} from './rolled-front.mjs';
import {buildOrderedBay} from './ordered-bay.mjs';
import {lerp,cubicBezier,cubicTangent,taperedRibbon,pointInPolygon,polygonClearance,polygonSelfCrossings,segmentsCross} from './geometry.mjs';
const unit=v=>v.map(x=>x/Math.hypot(...v));
const dot=(a,b)=>a.reduce((s,x,k)=>s+x*b[k],0);
const same=(a,b)=>a.every((x,k)=>x===b[k]);
// Smooth width envelope and rounded end for compact foam lobes.
function lobedRibbon(id,parentId,controls,rootWidth,tipWidth,bulge){
 const centerline=[],left=[],right=[];
 for(let i=0;i<=96;i++){
  const t=i/96,p=cubicBezier(...controls,t),v=unit(cubicTangent(controls,t)),n=[-v[1],v[0]];
  const ease=t*t*(3-2*t),width=rootWidth+(tipWidth-rootWidth)*ease+bulge*Math.sin(Math.PI*t)**2;
  centerline.push(p);left.push(p.map((x,k)=>x+n[k]*width/2));right.push(p.map((x,k)=>x-n[k]*width/2));
 }
 const end=centerline.at(-1),v=unit(cubicTangent(controls,1)),n=[-v[1],v[0]],cap=[];
 for(let i=1;i<12;i++){const angle=Math.PI/2-Math.PI*i/12;cap.push(end.map((x,k)=>x+tipWidth/2*(v[k]*Math.cos(angle)+n[k]*Math.sin(angle))));}
 return{id,parentId,controls,rootWidth,tipWidth,centerline,points:[...left,...cap,...right.reverse()],widthProfile:'smooth swelling lobe',roundedTip:true};
}
function generateGraft(wave,group,recipe='legacy'){
 const seed=wave.seed,start=wave.frontGraph[group.startIndex],end=wave.frontGraph[group.endIndex];
 const t=unit(group.tangent),rawOut=unit(group.normal).map(x=>-x),out=unit(rawOut.map((x,k)=>x-dot(rawOut,t)*t[k]));
 const span=Math.hypot(...end.map((x,k)=>x-start[k])),scale=span*.65;
 const origin=lerp(start,end,.43).map((x,k)=>x-out[k]*scale*.12);
 const P=(a,b)=>origin.map((x,k)=>x+scale*(out[k]*a+t[k]*b));
 const turning=recipe==='turning'||recipe==='branched';
 const parentControls=turning?[P(0,0),P(.28,0),P(.50,.12),P(.48,.62)]:[P(0,0),P(.35,0),P(.65,.15),P(.75,.65)];
 const parent=taperedRibbon('graft-parent','cap',parentControls,scale*.43,scale*.24);
 const child=(id,station,length,reach,tipT,width)=>{
  const root=cubicBezier(...parent.controls,station),direction=unit(cubicTangent(parent.controls,station));
  return taperedRibbon(id,parent.id,[root,root.map((x,k)=>x+direction[k]*scale*length),P(reach,tipT-.32),P(reach-.3,tipT)],scale*width,scale*.022);
 };
 // P068: children occupy different sectors of the turning parent frame.
 // Their terminal tangents return, while their roots diverge upward/downward.
 const recurvedChild=(id,station,shape,width,tip)=>{
  const root=cubicBezier(...parent.controls,station),direction=unit(cubicTangent(parent.controls,station));
  const outward=[direction[1],-direction[0]];
  const local=(along,across)=>root.map((x,k)=>x+scale*(direction[k]*along+outward[k]*across));
  return lobedRibbon(id,parent.id,[root,local(...shape[0]),local(...shape[1]),local(...shape[2])],scale*width,scale*tip,scale*.08);
 };
 const sourceChildren=wave.foamNodes.filter(n=>n.parentId===group.rootId);
 const generatedChildren=recipe==='branched'?sourceChildren.map((node,i)=>{
  const u=sourceChildren.length===1?.45:i/(sourceChildren.length-1);
  const shape=[[.12+.20*u,.28*(1-u)],[.64+.06*u,.40-.10*u],[.45+.20*u,.12-.17*u]];
  return recurvedChild(node.id,sourceChildren.length===1?.72:.42+.48*u,shape,.20-.04*u,.055-.015*u);
 }):turning?[recurvedChild('graft-child-a',.50,[[.12,.28],[.64,.40],[.45,.12]],.20,.055),recurvedChild('graft-child-b',.90,[[.32,0],[.70,.30],[.65,-.05]],.16,.04)]:[child('graft-child-a',.68,.28,1.55,1.12,.19),child('graft-child-b',.90,.25,1.02,1.76,.145)];
 const branches=[parent,...generatedChildren];
 // Join the real exterior to sampled parent flanks, before either child root.
 // The sole straight cross-section lies through parent interior and is hidden.
 const stationIndex=20,station=stationIndex/96;
 const firstFlank=parent.points[193-stationIndex],secondFlank=parent.points[stationIndex];
 const difference=(a,b)=>a.map((x,k)=>x-b[k]);
 const frontOffset=wave.body.findIndex(p=>same(p,wave.frontGraph[0]));
 const predecessor=group.startIndex?wave.frontGraph[group.startIndex-1]:wave.body[frontOffset-1];
 const incoming=unit(difference(start,predecessor));
 const outgoing=unit(difference(wave.frontGraph[group.endIndex+1],end));
 const firstGrowth=unit(difference(parent.points[192-stationIndex],firstFlank));
 const secondReturn=unit(difference(secondFlank,parent.points[stationIndex+1]));
 const joinCurve=(a,b,ta,tb)=>{
  const handle=Math.hypot(...difference(b,a))*.34;
  return[a,a.map((x,k)=>x+ta[k]*handle),b.map((x,k)=>x-tb[k]*handle),b];
 };
 const entryControls=joinCurve(start,firstFlank,incoming,firstGrowth),exitControls=joinCurve(secondFlank,end,secondReturn,outgoing);
 const sample=controls=>Array.from({length:49},(_,i)=>cubicBezier(...controls,i/48));
 const entry=sample(entryControls),exit=sample(exitControls),baseEdge=[...entry,secondFlank,...exit.slice(1)];
 const tangentError=(actual,expected)=>Math.hypot(...unit(actual).map((x,k)=>x-expected[k]));
 const joinErrors=[tangentError(cubicTangent(entryControls,0),incoming),tangentError(cubicTangent(entryControls,1),firstGrowth),tangentError(cubicTangent(exitControls,0),secondReturn),tangentError(cubicTangent(exitControls,1),outgoing)];
 const crossSection=Array.from({length:95},(_,i)=>lerp(firstFlank,secondFlank,(i+1)/96));
 const collar={station,childRootStations:recipe==='branched'?sourceChildren.map((_,i)=>sourceChildren.length===1?.72:.42+.48*i/(sourceChildren.length-1)):turning?[.50,.90]:[.68,.90],construction:'frontier tangent to actual parent flank, hidden cross-section, return flank to frontier tangent',joinPositionError:Math.max(Math.hypot(...difference(entry.at(-1),firstFlank)),Math.hypot(...difference(exit[0],secondFlank))),normalizedTangentErrors:joinErrors,maxNormalizedTangentError:Math.max(...joinErrors),hiddenCrossSectionSamples:crossSection.length,hiddenCrossSectionOutsideParent:crossSection.filter(p=>!pointInPolygon(p,parent.points)).length,hiddenCrossSectionMinInteriorClearance:Math.min(...crossSection.map(p=>polygonClearance(p,parent.points))),exposedConnectorSegments:entry.length+exit.length-2,removedLargeStraightChord:true};

 const replace=polygon=>{const offset=polygon.findIndex(p=>same(p,wave.frontGraph[0]));if(offset<0)throw Error('shared front not found');return[...polygon.slice(0,offset+group.startIndex),...baseEdge,...polygon.slice(offset+group.endIndex+1)];};
 const baseBody=replace(wave.body),baseFoam=replace(wave.cap),shared=branches.map(b=>b.points),bodyPolygons=[baseBody,...shared],foamPolygons=[baseFoam,...shared];
 const removedIds=wave.foamNodes.filter(n=>n.parentId===group.rootId).map(n=>n.id);
 const inkSeams=wave.inkSeams.filter(s=>!removedIds.includes(s.ownerId));
 const attachments=branches.map(branch=>{const parentPolygon=branch.parentId==='cap'?baseFoam:parent.points,witness=cubicBezier(...branch.controls,.03);return{id:branch.id,parentId:branch.parentId,witness,insideBoth:pointInPolygon(witness,parentPolygon)&&pointInPolygon(witness,branch.points),parentClearance:polygonClearance(witness,parentPolygon),branchClearance:polygonClearance(witness,branch.points)};});
 // Explicit local sky route exits between the unequal children into the hollow.
 const covePath=[P(1.0,1.1),P(1.45,1.55),P(2.05,2.0),P(3,2.0)];
 let bodyHits=0,foamHits=0,boundaryCrossings=0,minClearance=Infinity,samples=0;
 for(let k=1;k<covePath.length;k++){
  for(const poly of bodyPolygons)for(let i=0;i<poly.length;i++)boundaryCrossings+=+segmentsCross(covePath[k-1],covePath[k],poly[i],poly[(i+1)%poly.length]);
  for(let j=0;j<=96;j++){const p=lerp(covePath[k-1],covePath[k],j/96);samples++;bodyHits+=+bodyPolygons.some(poly=>pointInPolygon(p,poly));foamHits+=+foamPolygons.some(poly=>pointInPolygon(p,poly));minClearance=Math.min(minClearance,...bodyPolygons.map(poly=>polygonClearance(p,poly)));}
 }
 const diagnostics={recipe,localCoveScope:turning?'legacy route; no claim that it lies between new children':'between legacy children',collar,scope:'one real whole-wave group replacement; seed721 continuous attachment control',removedRoot:group.rootId,removedChildIds:removedIds,replacedFrontRange:[group.startIndex,group.endIndex],removedFrontVertices:group.endIndex-group.startIndex+1,newBaseVertices:baseEdge.length,generatedBranches:branches.length,generatedChildren:branches.length-1,scale,attachments,cove:{samples,bodyHits,foamHits,boundaryCrossings,minClearance},simpleComponents:[...bodyPolygons,...foamPolygons].map(p=>polygonSelfCrossings(p)),finite:[...bodyPolygons,...foamPolygons].flat(2).every(Number.isFinite),sharedExposedPolygons:shared.length,sharedExposedGeometryError:0,retainedInk:inkSeams.length,removedInk:wave.inkSeams.length-inkSeams.length,flowContinuity:wave.continuity};
 return{seed,wave,group,baseBody,baseFoam,bodyPolygons,foamPolygons,branches,inkSeams,covePath,baseEdge,attachmentCurves:[entryControls,exitControls],diagnostics};
}
// The two-group control deliberately preserves the original junction/bridge.
// It tests the visible result before attempting a new inter-group boundary.
function generateBareCrest(seed=721,groupCount=1,variant='legacy'){
 if(!['legacy','turning','branched','interlocked'].includes(variant))throw new RangeError('Unknown crest variant');
 if(![1,2,'all'].includes(groupCount)||groupCount==='all'&&!['branched','interlocked'].includes(variant))throw new RangeError('groupCount must be 1, 2, or all for branched');
 const wave=generateWave(seed);
 const selected=groupCount==='all'?wave.frontGroups:wave.frontGroups.slice(-groupCount);
 const grafts=selected.map((group,i)=>generateGraft(wave,group,['branched','interlocked'].includes(variant)?'branched':variant==='turning'&&groupCount===2&&i===0?'turning':'legacy'));
 if(groupCount===1)return grafts[0];
 const replaceAll=polygon=>{
  const offset=polygon.findIndex(p=>same(p,wave.frontGraph[0]));
  if(offset<0)throw Error('shared front not found');
  const result=[];let cursor=0;
  for(const graft of grafts){
   const start=offset+graft.group.startIndex;
   result.push(...polygon.slice(cursor,start));
   if(result.length&&same(result.at(-1),graft.baseEdge[0]))result.pop();
   result.push(...graft.baseEdge);
   cursor=offset+graft.group.endIndex+1;
  }
  result.push(...polygon.slice(cursor));
  return result;
 };
 const baseBody=replaceAll(wave.body);
 const bay=variant==='interlocked'?buildOrderedBay(wave,grafts,baseBody):null;
 const innerBayHeads=bay?.heads??[],newBaySeam=bay?.seam??[];
 const capSource=bay?.cap??wave.cap;
 const baseFoam=replaceAll(capSource);
 const branches=grafts.flatMap((g,i)=>g.branches.map(b=>({...b,id:`group-${i}-${b.id}`,parentId:b.parentId==='cap'?'cap':`group-${i}-${b.parentId}`})));
 const shared=branches.map(b=>b.points),bodyPolygons=[baseBody,...shared],foamPolygons=[baseFoam,...shared];
 const removedIds=grafts.flatMap(g=>g.diagnostics.removedChildIds);
 const inkSeams=wave.inkSeams.filter(s=>!removedIds.includes(s.ownerId));
 // The rejected independent tongue overlay is removed. Water and ivory now
 // meet on one simple inner bay seam; no disconnected strip is painted on top.
 const waterChannels=[];
 const waterTongueDiagnostics=innerBayHeads.map(h=>{
  const witness=h.witness;
  return{rootId:h.rootId,halfWidth:h.halfWidth,chartPosition:[h.u,h.r],headInConnectedBay:bodyPolygons.some(poly=>pointInPolygon(witness,poly))&&!pointInPolygon(witness,baseFoam)};
 });
 const foamRootKept=grafts.map(g=>{const witness=cubicBezier(...g.branches[0].controls,.03);return{root:g.group.rootId,insideFoamAfterWaterSubtraction:foamPolygons.some(poly=>pointInPolygon(witness,poly))&&!waterChannels.some(channel=>pointInPolygon(witness,channel.points))};});
 const junction=wave.frontGraph[grafts[0].group.endIndex];
 const interGroupRoute=[[18,17],[38,37],[63,67],[93,92]].map(v=>v.map((x,k)=>x+junction[k]));
 let routeHits=0,routeCrossings=0,routeMinClearance=Infinity,routeSamples=0;
 for(let k=1;k<interGroupRoute.length;k++){
  for(const poly of bodyPolygons)for(let i=0;i<poly.length;i++)routeCrossings+=+segmentsCross(interGroupRoute[k-1],interGroupRoute[k],poly[i],poly[(i+1)%poly.length]);
  for(let j=0;j<=64;j++){const p=lerp(interGroupRoute[k-1],interGroupRoute[k],j/64);routeSamples++;routeHits+=+bodyPolygons.some(poly=>pointInPolygon(p,poly));routeMinClearance=Math.min(routeMinClearance,...bodyPolygons.map(poly=>polygonClearance(p,poly)));}
 }
 const diagnostics={variant,bayConstraints:bay?.diagnostics??null,innerBaySeamOutsideBody:newBaySeam.filter(p=>!bodyPolygons.some(poly=>pointInPolygon(p,poly))&&Math.min(...bodyPolygons.map(poly=>polygonClearance(p,poly)))>.1).length,waterTongues:waterTongueDiagnostics,foamRootKept,declaredInterGroupRoute:{points:interGroupRoute,samples:routeSamples,bodyHits:routeHits,boundaryCrossings:routeCrossings,minClearance:routeMinClearance,scope:'seed721 explicit route below upper tips into open hollow; sampled route only, not entire union proof'},scope:'selected whole-wave crest groups; retained original junctions; sky topology unproven',groups:grafts.map(g=>({root:g.group.rootId,range:[g.group.startIndex,g.group.endIndex],collar:g.diagnostics.collar,localAttachments:g.diagnostics.attachments})),simpleComponents:[...bodyPolygons,...foamPolygons].map(p=>polygonSelfCrossings(p)),finite:[...bodyPolygons,...foamPolygons].flat(2).every(Number.isFinite),sharedExposedGeometryError:0,interGroupSky:'declared route sampled; whole sky topology unproven',localCovesAgainstCombinedUnion:grafts.map(g=>({root:g.group.rootId,bodyHits:g.covePath.filter(p=>bodyPolygons.some(poly=>pointInPolygon(p,poly))).length})),retainedInk:inkSeams.length};
 return{seed,wave,grafts,groupCount,baseBody,baseFoam,bodyPolygons,foamPolygons,waterChannels,innerBayHeads,branches,inkSeams,diagnostics};
}
export function generateIntegratedCrest(seed=721,groupCount=1,variant='legacy',options={}){
 const crest=generateBareCrest(seed,groupCount,variant);
 if(!options.branchCreases)return crest;
 const creases=buildBranchCreases(crest.branches);
 return{...crest,inkSeams:[...crest.inkSeams,...creases.inkSeams],diagnostics:{...crest.diagnostics,branchCreases:creases.diagnostics}};
}
const pt=p=>p.map(x=>x.toFixed(2)).join(',');
const path=p=>'M'+p.map(pt).join(' L')+' Z';
export function integratedCrestSvg(p,{background=true}={}){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="One integrated generated crest group"><defs><clipPath id="graft-water">${p.bodyPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</clipPath></defs>${background?'<rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z" fill="#efead6"/>':''}<g fill="#23485f" stroke="#23485f" stroke-width="2.5">${p.bodyPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g><g clip-path="url(#graft-water)">${p.wave.bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}${p.wave.strokes.map(s=>`<path d="M${s.map(pt).join(' L')}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><g fill="none" stroke="#23485f" stroke-width="2.1" stroke-linejoin="round">${p.foamPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g><g fill="#eeecd5">${p.foamPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g>${(p.waterChannels??[]).map(c=>`<path d="${path(c.points)}" fill="#23485f" stroke="#23485f" stroke-width="1.1"/>`).join('')}${p.inkSeams.map(s=>`<path d="M${s.points.map(pt).join(' L')}" fill="none" stroke="#23485f" stroke-width="${s.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;}
