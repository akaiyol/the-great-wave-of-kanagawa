import test from 'node:test';
import assert from 'node:assert/strict';
import {generateIntegratedCrest,integratedCrestSvg} from './integrated-crest.mjs';
import {pointInPolygon,polygonClearance,polygonSelfCrossings,cubicBezier} from './geometry.mjs';
import {generateIntegratedCrest as legacy,integratedCrestSvg as legacySvg} from '../../research/output/procedural-wave-2026-10-30/P073/source/src/procedural/integrated-crest.mjs';
const fixtures=[0,1,721,1847,13891,4294967295,5,11];
const geometry=p=>({body:p.bodyPolygons,foam:p.foamPolygons,branches:p.branches.map(b=>b.points)});
for(const seed of fixtures)test(`ordered bay keeps connected heads and simple contained foam at seed ${seed}`,()=>{
 const p=generateIntegratedCrest(seed,'all','interlocked');
 assert.ok([...p.bodyPolygons,...p.foamPolygons].flat(2).every(Number.isFinite));
 assert.equal(polygonSelfCrossings(p.baseFoam),0);
 for(const h of p.innerBayHeads){
  assert.ok(pointInPolygon(h.witness,p.baseBody));
  assert.ok(!pointInPolygon(h.witness,p.baseFoam));
  assert.ok(h.minBodyClearance>=2&&h.fitAttempts<18);
 }
 for(const g of p.grafts){const witness=cubicBezier(...g.branches[0].controls,.03);assert.ok(pointInPolygon(witness,p.baseFoam));}
 for(const q of p.baseFoam){
  const inside=p.bodyPolygons.some(poly=>pointInPolygon(q,poly));
  const edge=Math.min(...p.bodyPolygons.map(poly=>polygonClearance(q,poly)));
  assert.ok(inside||edge<=.1,'foam boundary leaves actual water body');
 }
 const profile=p.diagnostics.bayConstraints.headProfileChart;
 assert.ok(profile.every((q,i)=>!i||q[0]<=profile[i-1][0]+1e-12));
});
test('combined construction is deterministic and preserves actual child counts',()=>{
 const a=generateIntegratedCrest(721,'all','interlocked'),b=generateIntegratedCrest(721,'all','interlocked');
 assert.deepEqual(geometry(a),geometry(b));
 assert.deepEqual(a.grafts.map(g=>g.branches.length-1),a.wave.topology.children);
});
test('legacy single-group SVG remains exactly equal to retained P073',()=>{
 assert.equal(integratedCrestSvg(generateIntegratedCrest(721)),legacySvg(legacy(721)));
});
