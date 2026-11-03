import test from 'node:test';
import assert from 'node:assert/strict';
import {generateWave,profileField,normalizedGeometry,waveSvg} from './rolled-front.mjs';
import {generateWave as frozenWave,normalizedGeometry as frozenGeometry,waveSvg as frozenSvg} from '../../research/output/procedural-wave-2026-10-30/P070/source/src/procedural/rolled-front.mjs';

const tolerance=1e-7;
const wave=generateWave(721);
const near=(actual,expected)=>assert.ok(Math.hypot(...actual.map((v,i)=>v-expected[i]))<tolerance,`${actual} vs ${expected}`);

test('profile inverse round trips native points for three seeds',()=>{
 for(const seed of [0,721,1847]){
  const profile=profileField(seed);
  for(const point of [[0,760],[25,535],[200,300],[540,407],[600,200],[1000,600],[1200,760]])near(profile.inverse(profile.apply(point)),point);
 }
});

test('surface chart inverse round trips the annular front',()=>{
 for(const u of [.6,1,1.5])for(const r of [120,220,280])near(wave.surfaceChart.inverseFront(wave.surfaceChart.map(u,r)),[u,r]);
 // atan2 wraps beyond the lower half of the front; unwrap to positive u.
 near(wave.surfaceChart.inverseFront(wave.surfaceChart.map(5.5,220)),[5.5,220]);
});

test('new inverse and surface APIs reject nonfinite inputs',()=>{
 const profile=profileField(721);
 for(const point of [[NaN,0],[0,Infinity],[-Infinity,1],[],[1],null]){
  assert.throws(()=>profile.inverse(point),RangeError);
  assert.throws(()=>wave.surfaceChart.inverseFront(point),RangeError);
 }
 for(const [u,r]of [[NaN,220],[.6,Infinity],[-Infinity,120]])assert.throws(()=>wave.surfaceChart.map(u,r),RangeError);
});

test('surface exposure preserves frozen P070 seed721 geometry, fingerprints and SVG',()=>{
 const before=frozenWave(721);
 assert.deepEqual(normalizedGeometry(wave),frozenGeometry(before));
 assert.equal(wave.baseFingerprint,before.baseFingerprint);
 assert.equal(wave.fingerprint,before.fingerprint);
 assert.equal(waveSvg(wave),frozenSvg(before));
});
