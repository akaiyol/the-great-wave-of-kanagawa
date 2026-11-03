import test from 'node:test';
import assert from 'node:assert/strict';
import {generateWave,normalizedGeometry,geometryFingerprint,profileField} from './rolled-front.mjs';
const seeds=[0,1,721,1847,13891,4294967295];
const waves=seeds.map(generateWave);
const structuralWaves=[...waves,...[5,11].map(generateWave)];
test('six requested seeds and four-root held-outs have simple boundaries and open sky coves',()=>{
 for(const w of structuralWaves){
  assert.ok([w.body,w.cap,...w.bands.map(b=>b.points),...w.strokes].every(p=>p.every(q=>q.length===2&&q.every(Number.isFinite))));
  assert.equal(w.foamTopology.bodyAndCapBoundaryCrossings,0,`seed ${w.seed}`);
  assert.equal(w.foamTopology.sharedFrontMaximumError,0);
  assert.ok(w.foamTopology.connectedByConstruction);
  assert.ok(w.foamTopology.openHollow.every(p=>p.waterHits===0&&p.foamHits===0&&p.boundaryCrossings===0&&p.minSegmentClearance>0),`sky ${w.seed}`);
 }
});
test('all generated bay heads share open water mouths and attached ivory tongues',()=>{
 for(const w of structuralWaves){assert.equal(w.topology.bayLobes,w.topology.roots);assert.ok(w.foamTopology.bayHeadInWater.every(Boolean));assert.ok(w.foamTopology.bayWaterContinuity.every(p=>p.outsideBody===0&&p.insideFoam===0),`bay ${w.seed}`);assert.equal(w.foamTopology.tongueOutsideFoam,0);}
});
test('retained chart stays C1, finite, ordered and without sampled trajectory crossings',()=>{
 for(const {continuity:c}of structuralWaves){assert.ok(c.finite);assert.ok(c.maxJoinPositionError<1e-10);assert.ok(c.maxJoinDerivativeError<1e-10);assert.ok(c.minJacobian<0&&c.maxJacobian<0);assert.equal(c.transverseCrossings,0);}
});
test('return regeneration is deterministic and fingerprints ignore nongeometry data',()=>{
 for(const w of waves){assert.deepEqual(normalizedGeometry(generateWave(w.seed)),normalizedGeometry(w));assert.equal(geometryFingerprint({...w,seed:123,topology:{},foamTopology:{},descriptor:{},profile:{},foamNodes:[]}),w.fingerprint);}
});
test('six samples have distinct actual geometry and at least three root/child topologies',()=>{
 assert.equal(new Set(waves.map(w=>w.fingerprint)).size,seeds.length);
 assert.ok(new Set(waves.map(w=>JSON.stringify(w.topology))).size>=3);
 for(const w of waves){assert.ok(w.topology.roots>=2&&w.topology.roots<=4);assert.equal(w.topology.tips,w.topology.children.reduce((a,b)=>a+b,0));assert.equal(w.topology.relationships.length,w.topology.tips);}
});
test('invalid seeds throw rather than returning static fallback geometry',()=>{
 for(const s of[-1,4294967296,NaN,1.5])assert.throws(()=>generateWave(s),RangeError);
});

test('transformed profiles stay invertible and in frame; actual normalized landmarks disperse',()=>{
 for(const w of structuralWaves){
  const p=w.profile,b=p.bounds;
  assert.ok(p.jacobianLowerBound>0&&p.sampledFieldJacobianMin>=p.jacobianLowerBound);
  assert.ok(b.minX>=0&&b.maxX<=1200&&b.minY>=0&&b.maxY<=800,`frame ${w.seed}`);
 }
 const extent=values=>Math.max(...values)-Math.min(...values);
 assert.ok(extent(waves.map(w=>w.profile.landmarks.crown[1]/800))>.1);
 assert.ok(extent(waves.map(w=>w.profile.landmarks.crown[0]/1200))>.05);
 assert.ok(extent(waves.map(w=>(w.profile.bounds.maxX-w.profile.landmarks.hollowStart[0])/(760-w.profile.landmarks.hollowStart[1])))>.2);
});
test('public foam nodes expose transformed attached centers, widths, frames and parent IDs',()=>{
 for(const w of structuralWaves){
  assert.equal(w.foamNodes.filter(n=>n.kind==='root').length,w.topology.roots);
  assert.equal(w.foamNodes.filter(n=>n.kind==='child').length,w.topology.tips);
  const ids=new Set(w.foamNodes.map(n=>n.id));
  for(const n of w.foamNodes){assert.ok(n.center.every(Number.isFinite)&&n.width>0&&n.insideFoam);assert.ok(n.parentId==='cap'||ids.has(n.parentId));for(const v of Object.values(n.frame))assert.ok(Math.abs(Math.hypot(...v)-1)<1e-10);}
 }
});
test('all 32 seeds 0..31 pass transformed structural and profile constraints without fallback',()=>{
 const cache=new Map(structuralWaves.map(w=>[w.seed,w]));
 for(let seed=0;seed<32;seed++){
  const w=cache.get(seed)||generateWave(seed),f=w.foamTopology,c=w.continuity,b=w.profile.bounds;
  assert.ok(f.finite&&c.finite,`finite ${seed}`);assert.equal(f.bodyAndCapBoundaryCrossings,0,`boundary ${seed}`);
  assert.ok(f.openHollow.every(p=>p.waterHits===0&&p.foamHits===0&&p.boundaryCrossings===0&&p.minSegmentClearance>0),`sky ${seed}`);
  assert.ok(f.bayHeadInWater.every(Boolean)&&f.bayWaterContinuity.every(p=>p.outsideBody===0&&p.insideFoam===0),`bay ${seed}`);assert.equal(f.tongueOutsideFoam,0,`tongue ${seed}`);
  assert.ok(c.maxJoinPositionError<1e-10&&c.maxJoinDerivativeError<1e-10&&c.maxJacobian<0&&c.minJacobian<0&&c.transverseCrossings===0,`C1/order ${seed}`);
  assert.ok(w.profile.jacobianLowerBound>0&&w.profile.sampledFieldJacobianMin>=w.profile.jacobianLowerBound,`field ${seed}`);
  assert.ok(b.minX>=0&&b.maxX<=1200&&b.minY>=0&&b.maxY<=800,`frame ${seed}`);
  assert.ok(w.foamNodes.every(n=>n.insideFoam),`nodes ${seed}`);
 }
});

test('profile push-forward tangent agrees with actual field finite differences',()=>{
 for(const seed of seeds){const f=profileField(seed);for(const p of [[200,300],[600,200],[1000,600]])for(const v of [[1,0],[0,1],[.8,-.6]]){
  const h=1e-3,a=f.apply(p.map((x,k)=>x-h*v[k])),b=f.apply(p.map((x,k)=>x+h*v[k])),numeric=b.map((x,k)=>(x-a[k])/(2*h)),analytic=f.push(p,v);
  assert.ok(Math.hypot(...numeric.map((x,k)=>x-analytic[k]))<1e-6);assert.ok(f.determinant(p)>0);
 }}
});
