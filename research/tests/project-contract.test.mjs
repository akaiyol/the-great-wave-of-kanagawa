import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { checkProjectContract, syncProjectContract } from '../../scripts/project-contract.mjs';
import { startPhase, checkPhase } from '../../scripts/phase.mjs';
import { recordStrategy } from '../../scripts/strategy.mjs';
function fixture(t) {
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'goal-contract-'));t.after(()=>fs.rmSync(root,{recursive:true,force:true}));
 fs.mkdirSync(path.join(root,'research'));fs.mkdirSync(path.join(root,'agents'));
 const put=(p,v)=>fs.writeFileSync(path.join(root,p),typeof v==='string'?v:JSON.stringify(v));
 const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
 const hash=p=>createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex');
 for(const p of ['project-goals.json','goal-progress.json']) fs.copyFileSync(new URL(`../${p}`,import.meta.url),path.join(root,'research',p));
 const progress=read('research/goal-progress.json');for(const e of Object.values(progress.criteria))e.evidence=[];put('research/goal-progress.json',progress);
 put('agents/role.txt','role v2');put('research/agent-architecture.json',{sourcePins:{'agents/role.txt':hash('agents/role.txt')},nodes:[{id:'Lead',label:'Lead: owner'},{id:'Review',label:'Review'}],edges:[{from:'Lead',to:'Review',label:'Check'}]});
 put('research/agent-state.json',{projectContract:{enabled:true,goalsSha256:hash('research/project-goals.json')}});put('research/agent-memory.json',{lessons:[]});
 put('README.md','Prose preserved\n<!-- goals:start -->\n<!-- goals:end -->\n<!-- architecture:start -->\n<!-- architecture:end -->\n');
 return {root,put,read};
}
test('sync and startup preserve equal goals, protection and outstanding criteria',t=>{
 const {root}=fixture(t);syncProjectContract(root);assert.equal(checkProjectContract(root).ok,true);
 const record=startPhase(root,{id:'P1',objective:'Test contract',hypothesis:'Visibility survives',baseline:'Scattered goals',failureIds:[],artifactTarget:'a.txt',plannedTokens:1000,goalIds:['SYSTEM'],otherGoalProtection:'Preserve canonical artwork criteria'});
 assert.deepEqual(record.goalIds,['SYSTEM']);assert.equal(checkPhase(root).status,'working');
 const brief=fs.readFileSync(path.join(root,'research/agent-brief.md'),'utf8');assert.match(brief,/Goal ART \(equal\)/);assert.match(brief,/Goal SYSTEM \(equal\)/);assert.match(brief,/A1 \(unmet\)/);
});
test('goal and role mutations fail sync before writes, without repinning',t=>{
 for(const input of ['research/project-goals.json','agents/role.txt']){
  const {root}=fixture(t);syncProjectContract(root);const before=fs.readFileSync(path.join(root,'GOALS.md'),'utf8');fs.appendFileSync(path.join(root,input),' ');
  assert.throws(()=>syncProjectContract(root),/pin mismatch/);assert.equal(fs.readFileSync(path.join(root,'GOALS.md'),'utf8'),before);
 }
});
test('diagram drift, unknown nodes, unsafe labels and progress drift fail',t=>{
 const {root,put,read}=fixture(t);syncProjectContract(root);
 const p=path.join(root,'README.md');fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace('n_Lead -->','n_Review -->'));assert.throws(()=>checkProjectContract(root),/drift/);syncProjectContract(root);
 const a=read('research/agent-architecture.json');a.edges[0].to='Absent';put('research/agent-architecture.json',a);assert.throws(()=>syncProjectContract(root),/Unknown/);a.edges[0].to='Review';a.nodes[0].label='bad"]';put('research/agent-architecture.json',a);assert.throws(()=>syncProjectContract(root),/Unsafe/);
});
test('bad phase goal IDs block before state writes; progress IDs/evidence are checked',t=>{
 const {root,put,read}=fixture(t);syncProjectContract(root);const before=fs.readFileSync(path.join(root,'research/agent-state.json'),'utf8');
 assert.throws(()=>startPhase(root,{id:'P1',objective:'Test',hypothesis:'Test',baseline:'Test',failureIds:[],artifactTarget:'a.txt',plannedTokens:1000,goalIds:['OTHER'],otherGoalProtection:'Preserve'}),/goalIds/);
 assert.equal(fs.readFileSync(path.join(root,'research/agent-state.json'),'utf8'),before);assert.equal(fs.existsSync(path.join(root,'research/phases')),false);
 const p=read('research/goal-progress.json');p.criteria.A1.evidence=['missing'];put('research/goal-progress.json',p);assert.throws(()=>checkProjectContract(root),/Missing/);p.criteria.A1.evidence=[];p.criteria.BAD={status:'met',evidence:[]};put('research/goal-progress.json',p);assert.throws(()=>checkProjectContract(root),/IDs mismatch/);
});
test('a met criterion cannot be recorded without evidence',t=>{
 const {root,put,read}=fixture(t);syncProjectContract(root);
 const progress=read('research/goal-progress.json');progress.criteria.A1.status='met';
 put('research/goal-progress.json',progress);
 assert.throws(()=>checkProjectContract(root),/Met criterion requires evidence: A1/);
});
test('strategy and project goals are jointly enforced on a real phase start',t=>{
 const {root,put,read}=fixture(t);const state=read('research/agent-state.json');state.strategyPolicy={enabled:true};put('research/agent-state.json',state);syncProjectContract(root);
 recordStrategy(root,{id:'S1',targetPhase:'P1',family:'joint-gates',hypothesis:'Both gates apply',reviewer:{agentId:'independent-test-reviewer',role:'wave_evaluator'},recommendation:'continue',reason:'Test the actual combined transition',supportingEvidence:[{path:'agents/role.txt',claim:'Role exists'}],contraryEvidence:[{path:'agents/role.txt',claim:'Role presence alone does not prove quality'}],unknowns:['Judgment quality'],prediction:{ifTrue:'The valid phase starts',ifFalse:'A missing goal or strategy bypasses a gate'},test:{action:'Start one phase',success:'Both gates checked',failure:'A bypass',maxWorkTokens:800}});
 const spec={id:'P1',family:'joint-gates',strategyReview:'research/strategies/S1.json',objective:'Joint gates',hypothesis:'Both gates apply',baseline:'Separate gate tests',failureIds:[],artifactTarget:'a.txt',plannedTokens:1000,goalIds:['SYSTEM'],otherGoalProtection:'Preserve visual acceptance'};
 assert.throws(()=>startPhase(root,{...spec,goalIds:[]}),/goalIds/);
 assert.throws(()=>startPhase(root,{...spec,strategyReview:'research/strategies/absent.json'}),/missing/i);
 assert.equal(startPhase(root,spec).status,'working');assert.equal(checkPhase(root).ok,true);
});
