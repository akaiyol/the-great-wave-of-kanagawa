// P080: opt-in second-level lobes grown from actual child cubics.
import {cubicBezier,cubicTangent,pointInPolygon,polygonClearance,polygonSelfCrossings,segmentsCross} from './geometry.mjs';
const unit=v=>v.map(x=>x/Math.hypot(...v));
const distance=(a,b)=>Math.hypot(...a.map((x,k)=>x-b[k]));
function overlaps(a,b){
 if(a.some(p=>pointInPolygon(p,b)||polygonClearance(p,b)<1e-7)||b.some(p=>pointInPolygon(p,a)))return true;
 return a.some((p,i)=>b.some((q,j)=>segmentsCross(p,a[(i+1)%a.length],q,b[(j+1)%b.length])));
}
export function buildSecondaryBranches(crest,lobedRibbon){
 const branches=[],diagnostics=[],initial=[...crest.branches],byId=new Map(initial.map(b=>[b.id,b]));
 const groupRoot=b=>{while(b.parentId!=='cap'&&byId.has(b.parentId))b=byId.get(b.parentId);return b.id;};
 for(const child of initial.filter(b=>b.parentId!=='cap')){
  const id=child.id+'-secondary',W=child.rootWidth;
  const parentArc=child.centerline.slice(1).reduce((s,p,i)=>s+distance(p,child.centerline[i]),0),L=Math.min(W*1.8,parentArc*.45);
  const a=unit(cubicTangent(child.controls,.48)),b=unit(cubicTangent(child.controls,.52)),cross=a[0]*b[1]-a[1]*b[0];
  const record={id,parentId:child.id,parentArc,length:L,rootWidth:W*.65,curvatureCross:cross,emitted:false,reason:null};
  diagnostics.push(record);
  if(W<5||L<8){record.reason='parent too small: root width <5 or secondary length <8';continue;}
  if(!Number.isFinite(cross)||Math.abs(cross)<1e-6){record.reason='near-zero curvature: convex outward side undefined';continue;}
  const root=cubicBezier(...child.controls,.5),T=unit(cubicTangent(child.controls,.5)),N=[T[1]*Math.sign(cross),-T[0]*Math.sign(cross)];
  const P=(along,out)=>root.map((x,k)=>x+T[k]*along*L+N[k]*out*L);
  const secondary=lobedRibbon(id,child.id,[root,P(.4,0),P(.75,.8),P(.3,.8)],W*.65,W*.35,W*.15);
  const witness=cubicBezier(...secondary.controls,.03);
  record.attachment={insideBoth:pointInPolygon(witness,child.points)&&pointInPolygon(witness,secondary.points),parentClearance:polygonClearance(witness,child.points),branchClearance:polygonClearance(witness,secondary.points)};
  if(!secondary.points.flat().every(Number.isFinite)||polygonSelfCrossings(secondary.points)){record.reason='non-finite or self-crossing secondary polygon';continue;}
  if(!record.attachment.insideBoth||Math.min(record.attachment.parentClearance,record.attachment.branchClearance)<=.1){record.reason='attachment lacks interior clearance';continue;}
  const rootId=groupRoot(child);
  const unrelated=[...initial,...branches].filter(node=>groupRoot(node)!==rootId);
  record.unrelatedOverlapIds=unrelated.filter(node=>overlaps(secondary.points,node.points)).map(node=>node.id);
  if(record.unrelatedOverlapIds.length){record.reason='overlap with unrelated root group';continue;}
  record.coveredWaterHeadIds=(crest.innerBayHeads??[]).filter(head=>[...crest.foamPolygons,...branches.map(b=>b.points),secondary.points].some(poly=>pointInPolygon(head.witness,poly))).map(head=>head.rootId);
  if(record.coveredWaterHeadIds.length){record.reason='full foam union covers water-head witness';continue;}
  record.emitted=true;branches.push(secondary);byId.set(id,secondary);
 }
 return{branches,diagnostics};
}
