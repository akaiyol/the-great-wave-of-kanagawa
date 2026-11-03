import test from 'node:test';
import assert from 'node:assert/strict';
import {CREST_FIXTURES,reviewIdentity} from '../research/tests/evaluation-contract.mjs';
import {FOCUSED_PROTOCOL,FOCUSED_UNRUN_CHECKS,focusedCaptureKey,requireFocusedEvidence} from '../research/tests/focused-capture-contract.mjs';
function evidence(){
 const r={sourceFingerprint:'a'.repeat(64),referenceSHA256:'b'.repeat(64),evaluationFingerprint:'c'.repeat(64),renderProtocolFingerprint:'d'.repeat(64)};
 r.mode='focused';r.expected={status:'incomplete',focusedChecks:'pass'};r.renderProtocol={focused:FOCUSED_PROTOCOL};r.unrunChecks=FOCUSED_UNRUN_CHECKS.map(name=>({name,status:'not_run'}));
 const identity=reviewIdentity(r.sourceFingerprint,r.referenceSHA256,r.evaluationFingerprint,r.renderProtocolFingerprint);
 r.crestPhases={records:CREST_FIXTURES.map(f=>({...f,phases:Array.from({length:16},(_,i)=>({dx:i%4,dy:Math.floor(i/4),channels:Array(4).fill({})}))}))};
 const common={identity,sha256:'e'.repeat(64),width:100,height:80,mime:'image/png'};
 r.captures=[{...common,id:'contact-sheet'},{...common,id:'reference-crop'},...CREST_FIXTURES.flatMap(f=>['raw','sampled'].map(k=>({...common,id:focusedCaptureKey(f,k),fixture:{seed:f.seed,id:f.id,layer:f.layer},worldBounds:[0,0,100,80],cssPixelsPerWorldUnit:1,pngPixelsPerWorldUnit:1})))];
 return r;
}
test('focused set requires six native fixture pairs plus contact sheet and separate reference',()=>{
 assert.deepEqual(requireFocusedEvidence(evidence()),{captures:14,fixtures:6,phases:96});
 assert.equal(FOCUSED_PROTOCOL.nativeCSSPixelsPerWorldUnit,1);
 for(const missing of ['contact-sheet','reference-crop',focusedCaptureKey(CREST_FIXTURES[1],'sampled')]){
  const r=evidence();r.captures=r.captures.filter(c=>c.id!==missing);assert.throws(()=>requireFocusedEvidence(r),/Incomplete focused captures/);
 }
});
test('missing app identity, stale capture identity and absent PNG hash are incomplete',()=>{
 for(const mutate of [r=>delete r.evaluationFingerprint,r=>r.captures[0].identity='stale',r=>delete r.captures[1].sha256]){
  const r=evidence();mutate(r);assert.throws(()=>requireFocusedEvidence(r));
 }
});
test('duplicate capture cannot fill a missing fixture slot',()=>{
 const r=evidence();r.captures[3]={...r.captures[2]};assert.throws(()=>requireFocusedEvidence(r),/duplicate/);
});
test('native evidence rejects fitted scale, inconsistent world bounds and swapped layers',()=>{
 for(const mutate of [c=>c.cssPixelsPerWorldUnit=.5,c=>c.worldBounds=[0,0,99,80],c=>c.worldBounds=[1,0,100,80],c=>c.fixture={...c.fixture,layer:0}]){
  const r=evidence();mutate(r.captures[2]);assert.throws(()=>requireFocusedEvidence(r),/Inconsistent native-scale/);
 }
});
test('captures cannot substitute for missing phase coverage',()=>{
 const r=evidence();r.crestPhases.records[0].phases.pop();assert.throws(()=>requireFocusedEvidence(r),/Incomplete phase/);
});

test('focused diagnostics cannot promote skipped full-validation checks to a pass',()=>{
 for(const mutate of [r=>r.expected.status='pass',r=>r.unrunChecks[0].status='pass',r=>r.unrunChecks.pop(),r=>r.renderProtocol={focused:{...FOCUSED_PROTOCOL,nativeCSSPixelsPerWorldUnit:2}}]){
  const r=evidence();mutate(r);assert.throws(()=>requireFocusedEvidence(r));
 }
});
