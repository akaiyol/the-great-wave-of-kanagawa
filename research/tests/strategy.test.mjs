import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { recordStrategy, assertStrategyAllows } from '../../scripts/strategy.mjs';
import { startPhase } from '../../scripts/phase.mjs';
function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wave-strategy-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, 'research/phases'), { recursive: true });
  const put = (file, value) => fs.writeFileSync(path.join(root, file), typeof value === 'string' ? value : JSON.stringify(value));
  put('research/agent-state.json', { strategyPolicy: { enabled: true } });
  put('research/agent-memory.json', { lessons: [] });
  put('evidence.txt', 'Retained local gain; whole recognition unknown.');
  const packet = { id: 'S1', targetPhase: 'P1', family: 'foam', hypothesis: 'Bounded anatomical gain', reviewer: { agentId: 'reviewer-1', role: 'wave_evaluator' }, recommendation: 'continue', reason: 'Test local gain; do not claim recognition', supportingEvidence: [{ path: 'evidence.txt', claim: 'Local gain retained' }], contraryEvidence: [{ path: 'evidence.txt', claim: 'Whole recognition remains unknown' }], unknowns: ['Whole recognition'], prediction: { ifTrue: 'Local gain repeats', ifFalse: 'Local gain fails' }, test: { action: 'Inspect bounded fixture', success: 'Gain retained', failure: 'Gain absent', maxWorkTokens: 900 } };
  const spec = { id: 'P1', family: 'foam', hypothesis: packet.hypothesis, strategyReview: 'research/strategies/S1.json', plannedTokens: 1000, objective: 'Test local gain', failureIds: [], baseline: 'Incomplete recognition', artifactTarget: 'new.txt' };
  return { root, put, packet, spec };
}
test('retained local gain permits a bounded phase and persists its review reference', t => {
  const { root, packet, spec } = fixture(t);
  recordStrategy(root, packet);
  assert.equal(assertStrategyAllows(root, spec).recommendation, 'continue');
  const phase = startPhase(root, spec);
  assert.equal(phase.strategyReview, spec.strategyReview);
  assert.match(fs.readFileSync(path.join(root, 'research/agent-brief.md'), 'utf8'), /Strategy: research\/strategies\/S1.json/);
  assert.throws(() => recordStrategy(root, packet), /EEXIST/);
});
test('missing or unsupported packet and unsafe evidence paths fail', t => {
  const { root, packet, spec } = fixture(t);
  assert.throws(() => assertStrategyAllows(root, spec), /missing/);
  for (const patch of [{ reviewer: {} }, { recommendation: 'approve' }, { supportingEvidence: [] }, { contraryEvidence: [] }, { unknowns: null }, { test: { ...packet.test, maxWorkTokens: 0 } }, { contraryEvidence: [{ path: 'absent.txt', claim: 'Missing' }] }, { contraryEvidence: [{ path: '../escape', claim: 'Escape' }] }]) {
    assert.throws(() => recordStrategy(root, { ...packet, ...patch }));
  }
  fs.symlinkSync(path.join(root, 'evidence.txt'), path.join(root, 'link.txt'));
  assert.throws(() => recordStrategy(root, { ...packet, contraryEvidence: [{ path: 'link.txt', claim: 'Link' }] }), /Symlink/);
});
test('stale hashes, wrong target/hypothesis/family and excessive work block', t => {
  const { root, packet, spec, put } = fixture(t);
  recordStrategy(root, packet);
  for (const patch of [{ id: 'P2' }, { hypothesis: 'Different' }, { family: 'Other' }, { plannedTokens: 500 }, { strategyReview: 'evidence.txt' }]) assert.throws(() => assertStrategyAllows(root, { ...spec, ...patch }));
  put('evidence.txt', 'Changed');
  assert.throws(() => assertStrategyAllows(root, spec), /Stale evidence/);
});
test('reject/defer block actual phase start before any writes', t => {
  const { root, packet, spec } = fixture(t);
  for (const recommendation of ['reject', 'defer']) {
    const id = recommendation;
    recordStrategy(root, { ...packet, id, recommendation });
    const before = fs.readFileSync(path.join(root, 'research/agent-state.json'), 'utf8');
    assert.throws(() => startPhase(root, { ...spec, strategyReview: `research/strategies/${id}.json` }), /blocks phase/);
    assert.equal(fs.readFileSync(path.join(root, 'research/agent-state.json'), 'utf8'), before);
    assert.deepEqual(fs.readdirSync(path.join(root, 'research/phases')), []);
    assert.equal(fs.existsSync(path.join(root, 'research/agent-brief.md')), false);
  }
});
test('two failures require pinned changed premise; incomplete is not falsification', t => {
  const { root, packet, spec, put } = fixture(t);
  const prior = (id, verdict) => put(`research/phases/${id}.json`, { id, family: 'foam', status: 'closed', result: { technicalVerdict: verdict, artisticVerdict: 'incomplete' } });
  prior('P0a', 'fail'); prior('P0b', 'fail'); recordStrategy(root, packet);
  assert.throws(() => assertStrategyAllows(root, spec), /changedPremise/);
  recordStrategy(root, { ...packet, id: 'S2', recommendation: 'pivot', changedPremise: { summary: 'New evidence changes construction', evidence: ['evidence.txt'] } });
  assert.equal(assertStrategyAllows(root, { ...spec, strategyReview: 'research/strategies/S2.json' }).recommendation, 'pivot');
  prior('P0b', 'incomplete');
  assert.equal(assertStrategyAllows(root, spec).recommendation, 'continue');
});
