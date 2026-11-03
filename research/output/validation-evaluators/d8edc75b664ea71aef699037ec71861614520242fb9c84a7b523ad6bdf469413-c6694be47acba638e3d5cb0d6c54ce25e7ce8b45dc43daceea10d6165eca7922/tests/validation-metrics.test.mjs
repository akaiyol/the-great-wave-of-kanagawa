import test from 'node:test';
import assert from 'node:assert/strict';
import {components} from '../research/tests/validation-metrics.mjs';
test('foam-grid diagnostic uses eight-neighbor connectivity and excludes tiny fragments from reported component count',()=>{
 const connected=components(Uint8Array.from([1,0,1,0,1,0,0,0,1]),3);
 assert.equal(connected.componentsAtLeastThreeSamples,1);assert.equal(connected.largestComponentFraction,1);
 const separate=components(Uint8Array.from([1,1,0,0,1,1,0,0,0,0,0,0,0,0,1,1]),4);
 assert.equal(separate.componentsAtLeastThreeSamples,1);assert.equal(separate.occupiedSamples,6);assert.equal(separate.largestComponentFraction,4/6);
});

import {exteriorWater} from '../research/tests/crest-phase-checks.mjs';
test('water cannot escape through a diagonal-only opening in foam',()=>{
 const mask=new Uint8Array(25);for(const n of [7,11,13,17])mask[n]=1;
 assert.equal(exteriorWater(mask,5)[12],0);
 mask[7]=0;const open=exteriorWater(mask,5);assert.equal(open[12],1);
 assert.equal(open[11],0);
});
