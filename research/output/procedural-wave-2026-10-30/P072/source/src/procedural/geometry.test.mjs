import test from 'node:test';
import assert from 'node:assert/strict';
import {pointSegmentDistance,polygonClearance,taperedRibbon} from './geometry.mjs';
import {generateWave,normalizedGeometry,waveSvg} from './rolled-front.mjs';
import {generateBranchPatch,branchPatchSvg} from './branch-patch.mjs';
import {generateWave as retainedWave,normalizedGeometry as retainedGeometry,waveSvg as retainedSvg} from '../../research/output/procedural-wave-2026-10-30/W057/source/src/procedural/rolled-front.mjs';
import {generateBranchPatch as retainedPatch,branchPatchSvg as retainedPatchSvg} from '../../research/output/procedural-wave-2026-10-30/W060/source/src/procedural/branch-patch.mjs';

test('zero-length polygon edge retains finite distance and does not poison clearance',()=>{
 assert.equal(pointSegmentDistance([4,6],[1,2],[1,2]),5);
 assert.equal(pointSegmentDistance([1,2],[1,2],[1,2]),0);
 // A repeated closing vertex is a valid zero-length edge in this polygon.
 const polygon=[[0,0],[4,0],[4,4],[0,4],[0,0]];
 assert.equal(polygonClearance([2,2],polygon),2);
 assert.equal(polygonClearance([6,4],polygon),2);
 assert.equal(pointSegmentDistance([2,3],[0,0],[4,0]),3);
 assert.ok(Math.abs(pointSegmentDistance([6,3],[0,0],[4,0])-Math.sqrt(13))<1e-12);
});

test('refactor preserves W057 normalized actual geometry, fingerprints and SVG for primary, held-out and 0..31 seeds',()=>{
 const seeds=[...new Set([0,1,721,1847,13891,4294967295,5,11,...Array.from({length:32},(_,i)=>i)])];
 for(const seed of seeds){
  const before=retainedWave(seed),after=generateWave(seed);
  assert.deepEqual(normalizedGeometry(after),retainedGeometry(before),`actual geometry ${seed}`);
  assert.equal(after.baseFingerprint,before.baseFingerprint,`base fingerprint ${seed}`);
  assert.equal(after.fingerprint,before.fingerprint,`full fingerprint ${seed}`);
  assert.equal(waveSvg(after),retainedSvg(before),`SVG ${seed}`);
 }
});

test('reusable tapered ribbon preserves W060 branch points, diagnostics and SVG',()=>{
 const before=retainedPatch(),after=generateBranchPatch();
 assert.deepEqual(after,before);
 assert.equal(branchPatchSvg(after),retainedPatchSvg(before));
 for(const branch of before.branches){
  assert.deepEqual(taperedRibbon(branch.id,branch.parentId,branch.controls,branch.rootWidth,branch.tipWidth),branch);
 }
});
