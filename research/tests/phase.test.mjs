import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
import { startPhase, recordResult, reviewPhase, checkPhase, generateBrief } from '../../scripts/phase.mjs';

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wave-phase-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'research'), { recursive: true });
  const state = { schemaVersion: 3, retainedCandidate: 'W064', lastDecision: 'Keep local continuity', nested: { preserve: true } };
  fs.writeFileSync(path.join(root, 'research/agent-state.json'), JSON.stringify(state));
  fs.writeFileSync(path.join(root, 'research/agent-memory.json'), JSON.stringify({ lessons: [{ id: 'delivery', lesson: 'Save first artifact', reentryCondition: 'Next phase' }] }));
  fs.writeFileSync(path.join(root, 'evidence.txt'), 'Observed check result');
  return { root, state, read: file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')) };
}
const spec = (id = 'P001', plannedTokens = 1001) => ({ id, objective: 'Enforce phase review', hypothesis: 'Structured transitions stop unreviewed advancement', failureIds: ['review.missing'], baseline: 'Narrative logs', artifactTarget: 'artifact.txt', plannedTokens });
const result = (id = 'P001', extra = {}) => ({ id, summary: 'Executable artifact delivered', artifactDelivered: true, technicalVerdict: 'pass', artisticVerdict: 'not_applicable', evidence: ['evidence.txt'], nextAction: 'Review this phase', estimatedWorkTokens: 800, ...extra });
const review = (id = 'P001', extra = {}) => ({ id, findings: ['The artifact gate prevented premature advancement'], actions: [{ decision: 'retain', summary: 'Keep explicit review gate', evidence: ['evidence.txt'] }], nextImprovement: 'Apply gate to next phase', estimatedReviewTokens: 30, ...extra });
const artifact = root => fs.writeFileSync(path.join(root, 'artifact.txt'), 'Executable result');

test('95/5 allocation rounds review up, preserves state and gates every transition', t => {
  const { root, state, read } = fixture(t);
  assert.deepEqual(checkPhase(root), { ok: true, currentPhase: null, status: null });
  const phase = startPhase(root, spec());
  assert.deepEqual(phase.budget, { workTokens: 950, reviewTokens: 51 });
  assert.equal(phase.accounting.actualTokens, null);
  const updated = read('research/agent-state.json');
  for (const [key, value] of Object.entries(state)) assert.deepEqual(updated[key], value);
  assert.equal(updated.currentPhaseRecord, 'research/phases/P001.json');
  assert.throws(() => startPhase(root, spec('P002')), /reviewed/);
  assert.throws(() => reviewPhase(root, review()), /recorded result/);
  assert.throws(() => recordResult(root, result()), /missing/);
  assert.equal(checkPhase(root).status, 'working');
  artifact(root);
  assert.throws(() => recordResult(root, result('P001', { evidence: [] })), /at least one/);
  assert.throws(() => recordResult(root, result('P002')), /mismatch/);
  assert.equal(recordResult(root, result()).status, 'review_required');
  assert.throws(() => startPhase(root, spec('P002')), /reviewed/);
  assert.throws(() => recordResult(root, result()), /working phase/);
  assert.throws(() => reviewPhase(root, review('P001', { findings: [], actions: [] })), /Empty review/);
  assert.throws(() => reviewPhase(root, {}), /mismatch/);
  assert.throws(() => reviewPhase(root, review('P002')), /mismatch/);
  assert.equal(reviewPhase(root, review()).status, 'closed');
  assert.throws(() => startPhase(root, spec()), /Duplicate/);
  assert.equal(startPhase(root, spec('P002')).status, 'working');
  assert.deepEqual(fs.readdirSync(path.join(root, 'research/phases')).sort(), ['P001.json', 'P002.json']);
});

test('failed phase still requires review and overruns remain honest estimates', t => {
  const { root } = fixture(t);
  startPhase(root, spec('P001', 1000)); artifact(root);
  const recorded = recordResult(root, result('P001', { technicalVerdict: 'fail', artisticVerdict: 'incomplete', estimatedWorkTokens: 1100 }));
  assert.equal(recorded.accounting.estimatedWorkOverrun, 150);
  assert.throws(() => startPhase(root, spec('P002')), /reviewed/);
  const closed = reviewPhase(root, review('P001', { estimatedReviewTokens: 80 }));
  assert.equal(closed.status, 'closed');
  assert.equal(closed.accounting.estimatedReviewOverrun, 30);
  assert.equal(closed.accounting.estimatedTotalOverrun, 180);
  assert.equal(closed.accounting.basis, 'estimated');
  assert.equal(closed.accounting.actualTokens, null);
  assert.equal(checkPhase(root).status, 'closed');
});

test('unknown usage is null and explicit no-change finding is a valid review', t => {
  const { root } = fixture(t);
  startPhase(root, spec()); artifact(root);
  recordResult(root, result('P001', { estimatedWorkTokens: null }));
  const closed = reviewPhase(root, review('P001', { findings: ['No change: evidence supports retaining the current gate'], actions: [] }));
  assert.equal(closed.accounting.estimatedTotalTokens, null);
  assert.equal(closed.accounting.estimatedWorkOverrun, null);
});

test('deleted artifact cannot be closed by review', t => {
  const { root } = fixture(t);
  startPhase(root, spec()); artifact(root); recordResult(root, result());
  fs.unlinkSync(path.join(root, 'artifact.txt'));
  assert.throws(() => reviewPhase(root, review()), /missing/);
});

test('explicit failed delivery with failure evidence can review; absent result cannot', t => {
  const { root } = fixture(t);
  startPhase(root, spec());
  assert.throws(() => reviewPhase(root, review()), /recorded result/);
  assert.throws(() => recordResult(root, result('P001', { artifactDelivered: false })), /fail\/incomplete/);
  assert.throws(() => recordResult(root, result('P001', { artifactDelivered: false, technicalVerdict: 'fail', evidence: [] })), /at least one/);
  recordResult(root, result('P001', { artifactDelivered: false, technicalVerdict: 'fail', summary: 'Blocked: construction decision missing; failure report saved' }));
  assert.equal(checkPhase(root).status, 'review_required');
  assert.match(generateBrief(root), /Artifact delivered: false/);
  assert.doesNotMatch(generateBrief(root), /State lastDecision/);
  assert.equal(reviewPhase(root, review()).status, 'closed');
  assert.equal(startPhase(root, spec('P002')).status, 'working');
});

test('invalid inputs fail without advancing state', t => {
  const { root } = fixture(t);
  for (const invalid of [{ id: '../escape' }, { artifactTarget: '../escape' }, { artifactTarget: '/tmp/escape' }, { plannedTokens: 999 }, { plannedTokens: 1000.5 }]) {
    assert.throws(() => startPhase(root, { ...spec(), ...invalid }));
  }
  startPhase(root, spec()); artifact(root);
  for (const invalid of [{ technicalVerdict: 'accepted' }, { artisticVerdict: 'unknown' }, { evidence: ['missing.txt'] }, { evidence: ['../evidence.txt'] }, { estimatedWorkTokens: -1 }, { estimatedWorkTokens: undefined }]) {
    assert.throws(() => recordResult(root, result('P001', invalid)));
  }
  recordResult(root, result());
  for (const invalid of [{ estimatedReviewTokens: 0 }, { findings: ['', ''] }, { findings: ['1', '2', '3', '4'] }, { actions: [{ decision: 'approve', summary: 'bad', evidence: ['evidence.txt'] }] }, { actions: [{ decision: 'retain', summary: 'bad', evidence: ['missing.txt'] }] }]) {
    assert.throws(() => reviewPhase(root, review('P001', invalid)));
  }
  assert.equal(checkPhase(root).status, 'review_required');
});

test('paths through symlinks cannot escape the project', t => {
  const { root } = fixture(t);
  const external = fs.mkdtempSync(path.join(os.tmpdir(), 'wave-outside-'));
  t.after(() => fs.rmSync(external, { recursive: true, force: true }));
  fs.writeFileSync(path.join(external, 'outside.txt'), 'external');
  fs.symlinkSync(external, path.join(root, 'outside'));
  assert.throws(() => startPhase(root, { ...spec(), artifactTarget: 'outside/new.txt' }), /escapes/);
  startPhase(root, spec()); artifact(root);
  assert.throws(() => recordResult(root, result('P001', { evidence: ['outside/outside.txt'] })), /escapes/);
});

test('check detects corrupt pointers and record invariants', t => {
  const { root, read } = fixture(t);
  startPhase(root, spec());
  const state = read('research/agent-state.json');
  fs.writeFileSync(path.join(root, 'research/agent-state.json'), JSON.stringify({ ...state, currentPhaseRecord: 'research/phases/other.json' }));
  assert.throws(() => checkPhase(root), /pointer mismatch/);
  fs.writeFileSync(path.join(root, 'research/agent-state.json'), JSON.stringify(state));
  const phase = read(state.currentPhaseRecord);
  phase.budget.reviewTokens = 50;
  fs.writeFileSync(path.join(root, state.currentPhaseRecord), JSON.stringify(phase));
  assert.throws(() => checkPhase(root), /allocation/);
});

test('brief uses current decisions and bounded lessons without historical log replay', t => {
  const { root } = fixture(t);
  fs.writeFileSync(path.join(root, 'research/agent-iteration-log.md'), 'HISTORICAL_SENTINEL');
  startPhase(root, spec()); artifact(root);
  recordResult(root, result()); reviewPhase(root, review());
  const brief = generateBrief(root);
  assert.match(brief, /Policy v2/);
  assert.match(brief, /P001 \(closed\)/);
  assert.match(brief, /Decision \(retain\): Keep explicit review gate/);
  assert.match(brief, /Next improvement: Apply gate to next phase/);
  assert.match(brief, /delivery: Save first artifact/);
  assert.doesNotMatch(brief, /HISTORICAL_SENTINEL/);
  assert.equal(fs.readFileSync(path.join(root, 'research/agent-brief.md'), 'utf8'), brief);
  fs.writeFileSync(path.join(root, 'research/agent-memory.json'), JSON.stringify({ lessons: Array(13).fill({}) }));
  assert.throws(() => generateBrief(root), /at most 12/);
});


test('every lifecycle mutation refreshes brief and check rejects stale manual context', t => {
 const {root}=fixture(t);
 startPhase(root,spec());
 const brief=()=>fs.readFileSync(path.join(root,'research/agent-brief.md'),'utf8');
 assert.match(brief(),/P001 \(working\)/);
 artifact(root);recordResult(root,result());
 assert.match(brief(),/P001 \(review_required\)/);
 reviewPhase(root,review());
 assert.match(brief(),/P001 \(closed\)/);
 fs.appendFileSync(path.join(root,'research/agent-brief.md'),'stale');
 assert.throws(()=>checkPhase(root),/stale/);
 generateBrief(root);assert.equal(checkPhase(root).status,'closed');
});

test('CLI transitions use the same reviewed ordering and refresh contract', t => {
 const {root}=fixture(t);
 const scripts=path.join(root,'scripts');fs.mkdirSync(scripts);
 const cli=path.join(scripts,'phase.mjs');fs.copyFileSync(new URL('../../scripts/phase.mjs',import.meta.url),cli);
 const invoke=(command,value)=>{
  const input=path.join(root,'input.json');fs.writeFileSync(input,JSON.stringify(value));
  return execFileSync(process.execPath,[cli,command,input],{stdio:'pipe'}).toString();
 };
 invoke('start',spec());
 assert.throws(()=>invoke('start',spec('P002')));
 artifact(root);invoke('result',result());invoke('review',review());
 assert.equal(JSON.parse(execFileSync(process.execPath,[cli,'check'],{stdio:'pipe'})).status,'closed');
 assert.match(fs.readFileSync(path.join(root,'research/agent-brief.md'),'utf8'),/P001 \(closed\)/);
});
