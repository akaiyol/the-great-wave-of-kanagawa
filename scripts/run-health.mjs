#!/usr/bin/env node
import fs from 'node:fs';
import readline from 'node:readline';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const time = value => {
  const result = typeof value === 'number' ? value : typeof value === 'string' && value.trim() ? Date.parse(value) : NaN;
  return Number.isFinite(result) && Math.abs(result) <= 8640000000000000 ? result : NaN;
};
const noise = kind => /(?:token[_-]?(?:usage|count)|item[_-]?completed)/i.test(kind);
export function analyzeActivity(events, { now, staleAfterMs = 600000 } = {}) {
  const current = time(now);
  if (!Array.isArray(events)) throw new Error('events must be an array');
  if (!Number.isFinite(staleAfterMs) || staleAfterMs < 0) throw new Error('staleAfterMs must be nonnegative');
  let invalidEvents = 0;
  const timestamps = [];
  for (const event of events) {
    if (!event || typeof event.kind !== 'string' || noise(event.kind)) continue;
    const timestamp = time(event.timestamp);
    if (!Number.isFinite(timestamp) || !Number.isFinite(current) || timestamp > current) { invalidEvents++; continue; }
    timestamps.push(timestamp);
  }
  timestamps.sort((a, b) => a - b);
  const gaps = [];
  let gapCount = 0;
  for (let index = 1; index < timestamps.length; index++) {
    const durationMs = timestamps[index] - timestamps[index - 1];
    if (durationMs > staleAfterMs) {
      gapCount++;
      gaps.push({ from: new Date(timestamps[index - 1]).toISOString(), to: new Date(timestamps[index]).toISOString(), durationMs });
      if (gaps.length > 20) gaps.shift();
    }
  }
  const latest = timestamps.at(-1);
  const ageMs = latest === undefined ? null : current - latest;
  return {
    status: ageMs === null ? 'unknown' : ageMs <= staleAfterMs ? 'recent' : 'no_recent_recorded_activity',
    lastRecordedActivity: latest === undefined ? null : new Date(latest).toISOString(), ageMs,
    staleAfterMs, recordedEvents: timestamps.length, invalidEvents, gapCount, gaps,
  };
}

// Only timestamp and item type leave this reader; text, tool arguments and output are never reported.
export async function readActivityEvents(filename) {
  const events = [];
  const lines = readline.createInterface({ input: fs.createReadStream(filename), crlfDelay: Infinity });
  let invalidLines = 0;
  for await (const line of lines) {
    if (!line.trim()) continue;
    let row;
    try { row = JSON.parse(line); } catch { invalidLines++; continue; }
    if (!['response_item', 'event_msg'].includes(row?.type)) continue;
    const subtype = row.payload?.type;
    if (typeof subtype !== 'string' || !/^[a-zA-Z0-9_-]{1,80}$/.test(subtype) || noise(subtype)) continue;
    events.push({ timestamp: row.timestamp, kind: `${row.type}:${subtype}` });
  }
  return { events, invalidLines };
}
const CAVEAT = 'Diagnostic only; cannot run/restart while sleeping; goal state checked separately. Recorded activity does not establish a cause or whether a model is running.';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [option, filename, ...extra] = process.argv.slice(2);
    if (!option || ['--help', '-h'].includes(option)) process.stdout.write(`Usage: node scripts/run-health.mjs --events <session.jsonl>\n${CAVEAT}\n`);
    else {
      if (option !== '--events' || !filename || extra.length) throw new Error('Invalid arguments; use --help');
      const { events, invalidLines } = await readActivityEvents(filename);
      process.stdout.write(JSON.stringify({ ...analyzeActivity(events, { now: Date.now() }), invalidLines, caveat: CAVEAT }, null, 2) + '\n');
    }
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
