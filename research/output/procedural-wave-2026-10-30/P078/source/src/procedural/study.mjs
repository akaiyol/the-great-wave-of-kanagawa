import {generateIntegratedCrest,integratedCrestSvg} from './integrated-crest.mjs';
import {pointInPolygon,cubicBezier} from './geometry.mjs';

// Public gallery entry point deliberately accepts only a seed: Array.map's
// index must never become a crest-construction option.
export function generateWave(seed=721){
 const p=generateIntegratedCrest(seed,'all','interlocked');
 const {wave,diagnostics:d}=p,c=wave.continuity,bay=d.bayConstraints;
 const points=[...p.bodyPolygons,...p.foamPolygons].flat();
 const bounds={minX:Infinity,maxX:-Infinity,minY:Infinity,maxY:-Infinity};
 for(const [x,y] of points){bounds.minX=Math.min(bounds.minX,x);bounds.maxX=Math.max(bounds.maxX,x);bounds.minY=Math.min(bounds.minY,y);bounds.maxY=Math.max(bounds.maxY,y);}
 const finite=[...points,...wave.bands.flatMap(b=>b.points),...wave.strokes.flat(),...p.inkSeams.flatMap(s=>s.points)].every(q=>q.length===2&&q.every(Number.isFinite))&&p.inkSeams.every(s=>Number.isFinite(s.strokeWidth));
 const checks=[
  [finite&&d.finite,'non-finite combined geometry'],
  [d.simpleComponents.length===p.bodyPolygons.length+p.foamPolygons.length&&d.simpleComponents.every(n=>n===0),'combined component self-crossings'],
  [d.waterTongues.length>0&&d.waterTongues.every(h=>h.headInConnectedBay===true)&&p.innerBayHeads.every(h=>p.bodyPolygons.some(poly=>pointInPolygon(h.witness,poly))&&!p.foamPolygons.some(poly=>pointInPolygon(h.witness,poly))),'water head leaves connected bay'],
  [d.foamRootKept.length>0&&d.foamRootKept.every(r=>r.insideFoamAfterWaterSubtraction===true)&&p.grafts.every(g=>pointInPolygon(cubicBezier(...g.branches[0].controls,.03),p.baseFoam)),'foam root loses attachment'],
  [d.innerBaySeamOutsideBody===0,'inner bay seam leaves body'],
  [bay?.headProfileMonotone===true,'bay head profile is not monotone'],
  [bay?.entryFinite===true,'non-finite bay entry'],
  [bay?.headFits.length>0&&bay.headFits.every(h=>Number.isFinite(h.minBodyClearance)&&h.minBodyClearance>=2&&h.attempts<18),'bay head fit failed'],
  [c.finite&&c.transverseCrossings===0&&c.maxJoinPositionError<1e-8&&c.maxJoinDerivativeError<1e-8,'surface C1 continuity failed'],
  [wave.profile.jacobianLowerBound>0,'profile Jacobian is not positive'],
  [bounds.minX>=-1e-6&&bounds.maxX<=1200+1e-6&&bounds.minY>=0&&bounds.maxY<=800,'combined body or foam exceeds 1200x800 bounds'],
 ];
 Object.assign(p,{topology:wave.topology,profile:wave.profile,continuity:c,bounds,valid:checks.every(([pass])=>pass),reasons:checks.filter(([pass])=>!pass).map(([,reason])=>reason)});
 const signature=JSON.stringify(normalizedGeometry(p));
 let hash=2166136261;
 for(let i=0;i<signature.length;i++)hash=Math.imul(hash^signature.charCodeAt(i),16777619)>>>0;
 p.fingerprint=hash.toString(16).padStart(8,'0');
 return p;
}

// One frame derived from all rendered geometry makes translation/scale
// normalization include the complete grafted crest rather than its old base.
export function normalizedGeometry(p){
 const polygons=[...p.bodyPolygons,...p.foamPolygons,...p.wave.bands.map(b=>b.points),...p.wave.strokes,...p.inkSeams.map(s=>s.points)];
 let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
 for(const poly of polygons)for(const [x,y] of poly){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
 const span=Math.max(maxX-minX,maxY-minY),quantize=n=>Number(n.toFixed(7));
 const normalize=poly=>poly.map(([x,y])=>[quantize((x-minX)/span),quantize((y-minY)/span)]);
 return{bodyPolygons:p.bodyPolygons.map(normalize),foamPolygons:p.foamPolygons.map(normalize),bands:p.wave.bands.map(b=>normalize(b.points)),strokes:p.wave.strokes.map(normalize),inkSeams:p.inkSeams.map(s=>({points:normalize(s.points),strokeWidth:quantize(s.strokeWidth/span)}))};
}

export function waveSvg(p){
 // Every SVG in a collection needs its own clip ID in the shared document.
 return integratedCrestSvg(p).replaceAll('graft-water',`graft-water-${p.seed}`);
}
