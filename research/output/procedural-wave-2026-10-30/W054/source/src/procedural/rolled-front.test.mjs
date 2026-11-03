import test from 'node:test';
import assert from 'node:assert/strict';
import {generateWave,normalizedGeometry,geometryFingerprint} from './rolled-front.mjs';
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
 for(const w of waves){assert.deepEqual(normalizedGeometry(generateWave(w.seed)),normalizedGeometry(w));assert.equal(geometryFingerprint({...w,seed:123,topology:{},foamTopology:{},descriptor:{}}),w.fingerprint);}
});
test('six samples have distinct actual geometry and at least three root/child topologies',()=>{
 assert.equal(new Set(waves.map(w=>w.fingerprint)).size,seeds.length);
 assert.ok(new Set(waves.map(w=>JSON.stringify(w.topology))).size>=3);
 for(const w of waves){assert.ok(w.topology.roots>=2&&w.topology.roots<=4);assert.equal(w.topology.tips,w.topology.children.reduce((a,b)=>a+b,0));assert.equal(w.topology.relationships.length,w.topology.tips);}
});
test('invalid seeds throw rather than returning static fallback geometry',()=>{
 for(const s of[-1,4294967296,NaN,1.5])assert.throws(()=>generateWave(s),RangeError);
});
