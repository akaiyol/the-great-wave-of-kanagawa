import test from 'node:test';
import assert from 'node:assert/strict';
import {components,fixedPhaseConnectivity,fixedPhaseOpenness} from '../research/tests/validation-metrics.mjs';
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

import {CREST_FIXTURES} from '../research/tests/evaluation-contract.mjs';
function connectedPhases(){return CREST_FIXTURES.map(f=>({...f,phases:Array.from({length:16},(_,i)=>({dx:i%4,dy:Math.floor(i/4),channels:Array(4).fill({}),occupiedSamples:2464,componentsAtLeastThreeSamples:1,largestComponentFraction:1}))}));}
test('fixed no-spray connectivity accepts all six connected fixtures at all sixteen offsets',()=>{
 const result=fixedPhaseConnectivity(connectedPhases());assert.equal(result.pass,true);assert.equal(result.phases,96);assert.equal(result.fixtures,6);assert.deepEqual(result.failures,[]);
});
test('actual three-sample detached-tail regression fails at seed 721 fixture 2:0:0 offset (1,3)',()=>{
 const mask=new Uint8Array(2500);mask.fill(1,0,2464);mask.fill(1,2474,2477);
 const fragment=components(mask,2500);assert.equal(fragment.occupiedSamples,2467);assert.equal(fragment.componentsAtLeastThreeSamples,2);assert.equal(fragment.largestComponentFraction,2464/2467);
 const records=connectedPhases();Object.assign(records[0].phases[13],fragment);
 const result=fixedPhaseConnectivity(records);assert.equal(result.pass,false);assert.equal(result.failures.length,1);assert.deepEqual(result.failures[0],{seed:721,id:'2:0:0',layer:2,dx:1,dy:3,...fragment});
 // Removing the detached tail restores strict connectivity for the complete set.
 mask.fill(0,2474,2477);Object.assign(records[0].phases[13],components(mask,2500));assert.equal(fixedPhaseConnectivity(records).pass,true);
});
test('one- and two-sample fragments fail despite the large-component diagnostic reporting one',()=>{
 for(const size of [1,2]){
  const mask=new Uint8Array(20);mask.fill(1,0,10);mask.fill(1,15,15+size);const records=connectedPhases();Object.assign(records[0].phases[0],components(mask,20));
  assert.equal(records[0].phases[0].componentsAtLeastThreeSamples,1);assert.equal(fixedPhaseConnectivity(records).pass,false);
 }
});
test('fixed connectivity rejects empty, missing, duplicate and nonfinite evidence',()=>{
 assert.throws(()=>fixedPhaseConnectivity([]));
 for(const mutate of [r=>r.pop(),r=>r[0].phases.pop(),r=>r[0].phases[15]=r[0].phases[0],r=>r[0].phases[0].occupiedSamples=0,r=>delete r[0].phases[0].largestComponentFraction,r=>r[0].phases[0].largestComponentFraction=NaN,r=>r[0].phases[0].occupiedSamples=Infinity,r=>r[0].phases[0].componentsAtLeastThreeSamples=NaN]){
  const records=connectedPhases();mutate(records);assert.throws(()=>fixedPhaseConnectivity(records));
 }
});

function openPhases(){const r=connectedPhases();for(const record of r)for(const phase of record.phases)phase.channels=Array.from({length:4},()=>({headOpen:true,mouthOpen:true}));return r;}
test('principal-cove gate rejects connected foam that blocks exterior water',()=>{
 const r=openPhases();assert.equal(fixedPhaseOpenness(r).pass,true);r[0].phases[13].channels[1].mouthOpen=false;
 assert.equal(fixedPhaseConnectivity(r).pass,true);const result=fixedPhaseOpenness(r);assert.equal(result.pass,false);assert.equal(result.headProbes,384);assert.equal(result.mouthProbes,384);assert.equal(result.failures.length,1);
});
test('principal-cove gate rejects missing and nonboolean observations',()=>{
 assert.throws(()=>fixedPhaseOpenness([]));const r=openPhases();delete r[0].phases[0].channels[0].headOpen;assert.throws(()=>fixedPhaseOpenness(r));
});
