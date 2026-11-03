import test from 'node:test';
import assert from 'node:assert/strict';
import {CREST_FIXTURES,reviewIdentity,requireCrestFixture,requireChannels,requirePhaseCoverage} from '../research/tests/evaluation-contract.mjs';
test('changing the evaluator invalidates a visual review even when app and reference match',()=>{
 assert.notEqual(reviewIdentity('a'.repeat(64),'b'.repeat(64),'c'.repeat(64),'e'.repeat(64)),reviewIdentity('a'.repeat(64),'b'.repeat(64),'d'.repeat(64),'e'.repeat(64)));
 assert.notEqual(reviewIdentity('a'.repeat(64),'b'.repeat(64),'c'.repeat(64),'e'.repeat(64)),reviewIdentity('a'.repeat(64),'b'.repeat(64),'c'.repeat(64),'f'.repeat(64)));
 assert.throws(()=>reviewIdentity('a'.repeat(64),'b'.repeat(64),undefined));
});
test('a vanished fixture cannot silently select a replacement or count as success',()=>{
 const fixture=CREST_FIXTURES[0];
 assert.throws(()=>requireCrestFixture([],fixture));
 assert.throws(()=>requireCrestFixture([{id:'other',family:'curl',layer:fixture.layer,x:0}],fixture));
});
test('empty and nonfinite channel probes cannot produce a zero-failure pass',()=>{
 const fixture=CREST_FIXTURES[0];
 assert.throws(()=>requireChannels([],fixture));
 assert.throws(()=>requireChannels(Array.from({length:4},()=>({head:[NaN,0],mouth:[0,0]})),fixture));
});
test('missing and duplicate sampling offsets fail coverage',()=>{
 const records=CREST_FIXTURES.map(f=>({...f,phases:Array.from({length:16},(_,i)=>({dx:i%4,dy:Math.floor(i/4),channels:Array(4).fill({})}))}));
 assert.equal(requirePhaseCoverage(records,4).headProbes,384);
 records[0].phases[15]=records[0].phases[0];
 assert.throws(()=>requirePhaseCoverage(records,4));
 assert.throws(()=>requirePhaseCoverage([],4));
});
