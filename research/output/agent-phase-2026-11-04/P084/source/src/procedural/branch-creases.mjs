// P079: a partial crease follows each child's own cubic; parent stems stay blank.
import {cubicBezier,lerp,pointInPolygon,polygonClearance,pointSegmentDistance,segmentsCross} from './geometry.mjs';
const distance=(a,b)=>Math.hypot(...a.map((x,k)=>x-b[k]));
const length=points=>points.slice(1).reduce((sum,p,i)=>sum+distance(points[i],p),0);

// Clearance is checked on the rendered polyline, including both round caps.
// Distance to a polygon boundary is 1-Lipschitz: the half-spacing guard also
// covers the unsampled part of each segment. Extra .02 covers SVG rounding.
export function creaseClearance(points,polygon,strokeWidth){
 let minimum=Infinity,samples=0,safe=true;
 const required=strokeWidth/2+1;
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],steps=Math.max(1,Math.ceil(distance(a,b)/.2));
  const guard=distance(a,b)/steps/2+.02;
  for(let j=0;j<=steps;j++){
   const p=lerp(a,b,j/steps),clearance=polygonClearance(p,polygon);samples++;
   minimum=Math.min(minimum,clearance);
   if(!pointInPolygon(p,polygon)||clearance<required+guard)safe=false;
  }
 }
 return{safe,minInteriorClearance:Number.isFinite(minimum)?minimum:null,requiredClearance:required,samples};
}

export function creasePairGap(a,b){
 let minimum=Infinity;
 for(let i=1;i<a.points.length;i++)for(let j=1;j<b.points.length;j++){
  const p=a.points[i-1],q=a.points[i],r=b.points[j-1],s=b.points[j];
  minimum=Math.min(minimum,segmentsCross(p,q,r,s)?0:Math.min(pointSegmentDistance(p,r,s),pointSegmentDistance(q,r,s),pointSegmentDistance(r,p,q),pointSegmentDistance(s,p,q)));
 }
 return minimum-(a.strokeWidth+b.strokeWidth)/2;
}

export function buildBranchCreases(branches){
 const inkSeams=[],diagnostics=[];
 for(const branch of branches.filter(b=>b.parentId!=='cap')){
  const strokeWidth=Math.max(1,Math.min(2,branch.rootWidth*.12));
  const taper=branch.tipWidth/branch.rootWidth;
  const interval=[.28+.08*taper,.82-.10*taper];
  const candidates=Array.from({length:129},(_,i)=>({t:interval[0]+(interval[1]-interval[0])*i/128,p:cubicBezier(...branch.controls,interval[0]+(interval[1]-interval[0])*i/128)}));
  let best=[],run=[];
  const retain=()=>{if(length(run.map(v=>v.p))>length(best.map(v=>v.p)))best=run;run=[];};
  for(const candidate of candidates){
   if(!run.length){
    const c=polygonClearance(candidate.p,branch.points);
    if(pointInPolygon(candidate.p,branch.points)&&c>=strokeWidth/2+1+.12)run=[candidate];
   }else if(creaseClearance([run.at(-1).p,candidate.p],branch.points,strokeWidth).safe)run.push(candidate);
   else retain();
  }
  retain();
  const points=best.map(v=>v.p),arcLength=length(points);
  const check=creaseClearance(points,branch.points,strokeWidth);
  const seam={ownerId:branch.id,points,strokeWidth};
  const separated=inkSeams.every(other=>creasePairGap(seam,other)>=Math.max(strokeWidth,other.strokeWidth)+.02);
  const emitted=arcLength>=5&&check.safe&&separated;
  if(emitted)inkSeams.push({ownerId:branch.id,points,strokeWidth});
  diagnostics.push({ownerId:branch.id,emitted,reason:emitted?null:!separated?'insufficient stroke separation':'no interior partial arc of at least 5 SVG units',candidateInterval:interval,retainedInterval:best.length?[best[0].t,best.at(-1).t]:null,arcLength,strokeWidth,...check});
 }
 return{inkSeams,diagnostics};
}
