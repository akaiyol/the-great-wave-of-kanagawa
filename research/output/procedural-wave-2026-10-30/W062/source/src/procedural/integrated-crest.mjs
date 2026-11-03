// W062: opt-in one-group replacement. Stable generator/render remain controls.
import {generateWave} from './rolled-front.mjs';
import {lerp,cubicBezier,cubicTangent,taperedRibbon,pointInPolygon,polygonClearance,polygonSelfCrossings,segmentsCross} from './geometry.mjs';
const unit=v=>v.map(x=>x/Math.hypot(...v));
const dot=(a,b)=>a.reduce((s,x,k)=>s+x*b[k],0);
const same=(a,b)=>a.every((x,k)=>x===b[k]);
export function generateIntegratedCrest(seed=721){
 const wave=generateWave(seed),group=wave.frontGroups.at(-1),start=wave.frontGraph[group.startIndex],end=wave.frontGraph[group.endIndex];
 const t=unit(group.tangent),rawOut=unit(group.normal).map(x=>-x),out=unit(rawOut.map((x,k)=>x-dot(rawOut,t)*t[k]));
 const span=Math.hypot(...end.map((x,k)=>x-start[k])),scale=span*.65;
 // The removed group's two frontier endpoints bound the real cutback base.
 const baseEdge=Array.from({length:25},(_,i)=>lerp(start,end,i/24));
 const origin=lerp(start,end,.43).map((x,k)=>x-out[k]*scale*.12);
 const P=(a,b)=>origin.map((x,k)=>x+scale*(out[k]*a+t[k]*b));
 const parent=taperedRibbon('graft-parent','cap',[P(0,0),P(.35,0),P(.65,.15),P(.75,.65)],scale*.43,scale*.24);
 const child=(id,station,length,reach,tipT,width)=>{
  const root=cubicBezier(...parent.controls,station),direction=unit(cubicTangent(parent.controls,station));
  return taperedRibbon(id,parent.id,[root,root.map((x,k)=>x+direction[k]*scale*length),P(reach,tipT-.32),P(reach-.3,tipT)],scale*width,scale*.022);
 };
 const branches=[parent,child('graft-child-a',.68,.28,1.55,1.12,.19),child('graft-child-b',.90,.25,1.02,1.76,.145)];
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
 const diagnostics={scope:'one real whole-wave group replacement; seed721 first control',removedRoot:group.rootId,removedChildIds:removedIds,replacedFrontRange:[group.startIndex,group.endIndex],removedFrontVertices:group.endIndex-group.startIndex+1,newBaseVertices:baseEdge.length,generatedBranches:branches.length,generatedChildren:branches.length-1,scale,attachments,cove:{samples,bodyHits,foamHits,boundaryCrossings,minClearance},simpleComponents:[...bodyPolygons,...foamPolygons].map(p=>polygonSelfCrossings(p)),finite:[...bodyPolygons,...foamPolygons].flat(2).every(Number.isFinite),sharedExposedPolygons:shared.length,sharedExposedGeometryError:0,retainedInk:inkSeams.length,removedInk:wave.inkSeams.length-inkSeams.length,flowContinuity:wave.continuity};
 return{seed,wave,group,baseBody,baseFoam,bodyPolygons,foamPolygons,branches,inkSeams,covePath,diagnostics};
}
const pt=p=>p.map(x=>x.toFixed(2)).join(',');
const path=p=>'M'+p.map(pt).join(' L')+' Z';
export function integratedCrestSvg(p){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img" aria-label="One integrated generated crest group"><defs><clipPath id="graft-water">${p.bodyPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</clipPath></defs><rect width="1200" height="800" fill="#e6dcc1"/><path d="M780 125 Q800 100 825 120 Q842 80 870 115 Q925 95 955 132 Q1005 122 1020 145 L775 150Z" fill="#efead6"/><g fill="#23485f" stroke="#23485f" stroke-width="2.5">${p.bodyPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g><g clip-path="url(#graft-water)">${p.wave.bands.map(b=>`<path d="${path(b.points)}" fill="${b.color}"/>`).join('')}${p.wave.strokes.map(s=>`<path d="M${s.map(pt).join(' L')}" fill="none" stroke="#1c3c52" stroke-width="1.1"/>`).join('')}</g><g fill="none" stroke="#23485f" stroke-width="2.1" stroke-linejoin="round">${p.foamPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g><g fill="#eeecd5">${p.foamPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g>${p.inkSeams.map(s=>`<path d="M${s.points.map(pt).join(' L')}" fill="none" stroke="#23485f" stroke-width="${s.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`).join('')}</svg>`;}
