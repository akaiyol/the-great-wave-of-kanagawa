// W060: partial centerline-grown fork control. The body and ivory share
// exactly the same exposed branch polygons; the base ends behind the fork.
import {lerp,cubicBezier,pointInPolygon as inside,polygonClearance as clearance,segmentsCross as crosses,polygonSelfCrossings as selfCrossings,taperedRibbon as ribbon} from './geometry.mjs';
const bez=(controls,t)=>cubicBezier(...controls,t);
export function generateBranchPatch(){
 const waterBase=[[80,600],[80,180],[220,145],[330,150],[425,228],[415,315],[345,390],[380,510],[450,600]];
 const foamBase=[[80,180],[220,145],[330,150],[425,228],[415,315],[300,380],[80,410]];
 const parent=ribbon('parent','cap',[[390,235],[440,225],[510,265],[525,330]],70,40);
 const aRoot=bez(parent.controls,.70),bRoot=bez(parent.controls,.90);
 const children=[ribbon('child-a','parent',[aRoot,[558,270],[628,326],[586,368]],32,2.2),ribbon('child-b','parent',[bRoot,[560,345],[585,430],[538,445]],24,1.8)];
 const branches=[parent,...children],sharedBranchPolygons=branches.map(b=>b.points);
 const bodyPolygons=[waterBase,...sharedBranchPolygons],foamPolygons=[foamBase,...sharedBranchPolygons];
 const attachments=branches.map(branch=>{const parentPoly=branch.parentId==='cap'?foamBase:parent.points,witness=bez(branch.controls,.03);return{id:branch.id,parentId:branch.parentId,witness,insideBoth:inside(witness,parentPoly)&&inside(witness,branch.points),parentClearance:clearance(witness,parentPoly),childClearance:clearance(witness,branch.points)};});
 const covePaths=[[[565,350],[615,410],[650,500],[480,500]]];
 const coves=covePaths.map(path=>{let bodyHits=0,foamHits=0,minClearance=Infinity,samples=0,boundaryCrossings=0;for(let k=1;k<path.length;k++){
  for(const poly of bodyPolygons)for(let i=0;i<poly.length;i++)if(crosses(path[k-1],path[k],poly[i],poly[(i+1)%poly.length]))boundaryCrossings++;
  for(let i=0;i<=96;i++){const p=lerp(path[k-1],path[k],i/96);samples++;bodyHits+=+bodyPolygons.some(poly=>inside(p,poly));foamHits+=+foamPolygons.some(poly=>inside(p,poly));minClearance=Math.min(minClearance,...bodyPolygons.map(poly=>clearance(p,poly)));}
 }return{samples,bodyHits,foamHits,boundaryCrossings,minClearance};});
 const diagnostics={scope:'partial centerline-grown parent fork; no whole-crest claim',finite:[...bodyPolygons,...foamPolygons].flat(2).every(Number.isFinite),individualBoundaryCrossings:[...new Set([...bodyPolygons,...foamPolygons])].map(poly=>selfCrossings(poly)),attachments,coves,sharedExposedPolygons:sharedBranchPolygons.length,sharedExposedGeometryError:0,waterBaseMaxX:Math.max(...waterBase.map(p=>p[0])),childRootMinX:Math.min(...children.map(c=>c.controls[0][0])),widthHierarchy:children.map((c,i)=>({id:c.id,rootWidth:c.rootWidth,parentWidthAtRoot:70-30*[.7,.9][i],ratio:c.rootWidth/(70-30*[.7,.9][i]),tipWidth:c.tipWidth}))};
 return{waterBase,foamBase,branches,bodyPolygons,foamPolygons,covePaths,diagnostics};
}
const point=p=>p.map(x=>x.toFixed(3)).join(',');
const path=p=>'M'+p.map(point).join(' L')+' Z';
export function branchPatchSvg(p){return`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 720 620" role="img" aria-label="Partial centerline-grown foam fork construction control"><rect width="720" height="620" fill="#e6dcc1"/><g fill="#23485f">${p.bodyPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g><path d="M80 480 Q170 490 315 420 M80 540 Q235 555 370 510" fill="none" stroke="#39738a" stroke-width="12"/><g fill="none" stroke="#23485f" stroke-width="2.2" stroke-linejoin="round">${p.foamPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g><g fill="#eeecd5">${p.foamPolygons.map(poly=>`<path d="${path(poly)}"/>`).join('')}</g></svg>`;}
