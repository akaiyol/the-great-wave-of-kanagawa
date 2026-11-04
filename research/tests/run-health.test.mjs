import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { analyzeActivity, readActivityEvents } from '../../scripts/run-health.mjs';
const now = Date.parse('2026-11-04T22:00:00Z');
test('recorded recency differs from stale, invalid and absent activity', () => {
  assert.equal(analyzeActivity([{ timestamp: now - 1, kind: 'event_msg:agent_message' }], { now }).status, 'recent');
  const stale = analyzeActivity([{ timestamp: now - 600001, kind: 'response_item:message' }], { now });
  assert.equal(stale.status, 'no_recent_recorded_activity');
  assert.equal(stale.ageMs, 600001);
  assert.equal(analyzeActivity([], { now }).status, 'unknown');
  const invalid = analyzeActivity([{ timestamp: 'invalid', kind: 'event_msg:agent_message' }, { timestamp: now + 1, kind: 'message' }], { now });
  assert.equal(invalid.status, 'unknown'); assert.equal(invalid.invalidEvents, 2);
  assert.equal(analyzeActivity([{ timestamp: now, kind: 'message' }], { now: 'invalid' }).status, 'unknown');
});
test('gaps use sorted timestamps and bound details without asserting cause', () => {
  const events = Array.from({ length: 30 }, (_, i) => ({ timestamp: now - i * 700000, kind: 'message' })).reverse();
  const report = analyzeActivity(events, { now });
  assert.equal(report.status, 'recent'); assert.equal(report.gapCount, 29); assert.equal(report.gaps.length, 20);
  assert.equal(report.gaps.at(-1).durationMs, 700000);
  assert.equal('cause' in report, false); assert.equal('modelRunning' in report, false);
});
test('CLI and reader discard transcript, tool arguments, phase metadata and usage noise', async t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'wave-health-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const filename = path.join(root, 'session.jsonl');
  const rows = [
    { type: 'phase', timestamp: new Date(now).toISOString(), status: 'working' },
    { type: 'event_msg', timestamp: new Date(now).toISOString(), payload: { type: 'token_count', info: 'SECRET_TRANSCRIPT' } },
    { type: 'event_msg', timestamp: new Date(now).toISOString(), payload: { type: 'item_completed' } },
    { type: 'response_item', timestamp: new Date(now - 900000).toISOString(), payload: { type: 'function_call', arguments: 'SECRET_TRANSCRIPT' } },
  ];
  fs.writeFileSync(filename, rows.map(JSON.stringify).join('\n') + '\ninvalid\n');
  const { events, invalidLines } = await readActivityEvents(filename);
  assert.equal(invalidLines, 1);
  assert.equal(events.length, 1);
  assert.equal(analyzeActivity(events, { now }).status, 'no_recent_recorded_activity');
  const output = execFileSync(process.execPath, ['scripts/run-health.mjs', '--events', filename], { encoding: 'utf8' });
  assert.doesNotMatch(output, /SECRET_TRANSCRIPT|arguments|working/);
  assert.match(output, /cannot run\/restart while sleeping; goal state checked separately/);
});
