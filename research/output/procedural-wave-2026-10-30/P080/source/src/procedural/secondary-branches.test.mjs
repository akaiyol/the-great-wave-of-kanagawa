import test from 'node:test';
import assert from 'node:assert/strict';
import {generateIntegratedCrest} from './integrated-crest.mjs';
import {cubicBezier,pointInPolygon,polygonClearance,polygonSelfCrossings} from './geometry.mjs';
const data=v=>JSON.parse(JSON.stringify(v));
test('seed721 opt-in secondary branches preserve baseline and attach actual hierarchy',()=>{
 const baseline=generateIntegratedCrest(721,'all','interlocked',{branchCreases:true});
 assert.deepEqual(data(generateIntegratedCrest(721,'all','interlocked',{secondaryBranches:false,branchCreases:true})),data(baseline));
 const options={secondaryBranches:true,branchCreases:true};
 const on=generateIntegratedCrest(721,'all','interlocked',options);
 assert.deepEqual(data(on),data(generateIntegratedCrest(721,'all','interlocked',options)));
 assert.deepEqual(on.branches.slice(0,baseline.branches.length),baseline.branches);
 const added=on.branches.slice(baseline.branches.length); assert.equal(added.length,5);
 assert.equal(on.diagnostics.secondaryBranches.length,baseline.branches.filter(b=>b.parentId!=='cap').length);
 for(const branch of added){
  const parent=baseline.branches.find(b=>b.id===branch.parentId);assert.ok(parent);assert.notEqual(parent.parentId,'cap');
  assert.deepEqual(branch.controls[0],cubicBezier(...parent.controls,.5));
  assert.equal(polygonSelfCrossings(branch.points),0);assert.ok(branch.points.flat().every(Number.isFinite));
  const witness=cubicBezier(...branch.controls,.03);
  for(const poly of [parent.points,branch.points]){assert.ok(pointInPolygon(witness,poly));assert.ok(polygonClearance(witness,poly)>.1);}
  assert.ok(on.bodyPolygons.includes(branch.points));assert.ok(on.foamPolygons.includes(branch.points));
  assert.ok(on.diagnostics.branchCreases.some(d=>d.ownerId===branch.id));
 }
 for(const head of on.innerBayHeads)assert.ok(!on.foamPolygons.some(poly=>pointInPolygon(head.witness,poly)));
 assert.deepEqual(on.bodyPolygons.slice(0,baseline.bodyPolygons.length),baseline.bodyPolygons);
 assert.deepEqual(on.foamPolygons.slice(0,baseline.foamPolygons.length),baseline.foamPolygons);
});
