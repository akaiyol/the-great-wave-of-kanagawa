#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = message => { throw new Error(message); };
const text = (value, key) => { if (typeof value !== 'string' || !value.trim()) fail(`${key} must be nonempty text`); };
const object = (value, key) => { if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${key} must be an object`); };

// All strategy paths are project-relative; even an internal symlink is rejected.
function projectFile(root, relative, existing = true) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative) || relative.includes('\\') || relative.includes('\0')
    || relative.split('/').some(part => !part || part === '.' || part === '..')) fail('Invalid project evidence path');
  let target = fs.realpathSync(root);
  for (const part of relative.split('/')) {
    target = path.join(target, part);
    try { if (fs.lstatSync(target).isSymbolicLink()) fail(`Symlink path rejected: ${relative}`); }
    catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  if (existing && (!fs.existsSync(target) || !fs.statSync(target).isFile())) fail(`Evidence file missing: ${relative}`);
  return target;
}
const read = (root, relative) => JSON.parse(fs.readFileSync(projectFile(root, relative), 'utf8'));
const hash = (root, relative) => createHash('sha256').update(fs.readFileSync(projectFile(root, relative))).digest('hex');
function validatePacket(root, packet, pinned) {
  object(packet, 'strategy packet');
  if (typeof packet.id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(packet.id)) fail('Invalid strategy id');
  for (const key of ['targetPhase', 'family', 'hypothesis', 'reason']) text(packet[key], key);
  object(packet.reviewer, 'reviewer'); text(packet.reviewer.agentId, 'reviewer.agentId');
  if (packet.reviewer.role !== 'wave_evaluator') fail('reviewer.role must be wave_evaluator');
  if (!['continue', 'pivot', 'reject', 'defer'].includes(packet.recommendation)) fail('Unknown recommendation');
  for (const key of ['supportingEvidence', 'contraryEvidence']) {
    if (!Array.isArray(packet[key]) || !packet[key].length) fail(`${key} requires evidence`);
    for (const item of packet[key]) {
      object(item, key); text(item.claim, `${key}.claim`); projectFile(root, item.path);
      if (pinned && item.sha256 !== hash(root, item.path)) fail(`Stale evidence hash: ${item.path}`);
    }
  }
  if (!Array.isArray(packet.unknowns)) fail('unknowns must be an array');
  for (const value of packet.unknowns) text(value, 'unknown');
  object(packet.prediction, 'prediction');
  for (const key of ['ifTrue', 'ifFalse']) text(packet.prediction[key], `prediction.${key}`);
  object(packet.test, 'test');
  for (const key of ['action', 'success', 'failure']) text(packet.test[key], `test.${key}`);
  if (!Number.isSafeInteger(packet.test.maxWorkTokens) || packet.test.maxWorkTokens <= 0) fail('test.maxWorkTokens must be a positive integer');
  if (packet.changedPremise !== undefined) {
    object(packet.changedPremise, 'changedPremise'); text(packet.changedPremise.summary, 'changedPremise.summary');
    if (!Array.isArray(packet.changedPremise.evidence) || !packet.changedPremise.evidence.length) fail('changedPremise requires evidence paths');
    for (const item of packet.changedPremise.evidence) {
      if (pinned) {
        object(item, 'changedPremise evidence');
        if (item.sha256 !== hash(root, item.path)) fail(`Stale evidence hash: ${item.path}`);
      } else projectFile(root, item);
    }
  }
  return packet;
}
export function recordStrategy(root, input) {
  const packet = structuredClone(input);
  validatePacket(root, packet, false);
  for (const key of ['supportingEvidence', 'contraryEvidence']) {
    packet[key] = packet[key].map(item => ({ path: item.path, claim: item.claim, sha256: hash(root, item.path) }));
  }
  if (packet.changedPremise) packet.changedPremise.evidence = packet.changedPremise.evidence.map(relative => ({ path: relative, sha256: hash(root, relative) }));
  const relative = `research/strategies/${packet.id}.json`;
  const target = projectFile(root, relative, false);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  // Exclusive creation: the CLI never replaces an existing decision.
  fs.writeFileSync(target, JSON.stringify(packet, null, 2) + '\n', { flag: 'wx' });
  return { path: relative, packet };
}
export function assertStrategyAllows(root, spec) {
  const state = read(root, 'research/agent-state.json');
  if (state.strategyPolicy?.enabled !== true) return null;
  text(spec.family, 'family'); text(spec.strategyReview, 'strategyReview');
  if (!/^research\/strategies\/[A-Za-z0-9][A-Za-z0-9_-]{0,79}\.json$/.test(spec.strategyReview)) fail('strategyReview must name a research/strategies packet');
  const packet = validatePacket(root, read(root, spec.strategyReview), true);
  if (spec.strategyReview !== `research/strategies/${packet.id}.json`) fail('Strategy packet ID/path mismatch');
  for (const [key, expected] of [['targetPhase', spec.id], ['family', spec.family], ['hypothesis', spec.hypothesis]]) {
    if (packet[key] !== expected) fail(`Strategy ${key} mismatch`);
  }
  if (!['continue', 'pivot'].includes(packet.recommendation)) fail(`Strategy recommendation blocks phase: ${packet.recommendation}`);
  if (!Number.isSafeInteger(spec.plannedTokens) || packet.test.maxWorkTokens > spec.plannedTokens - Math.ceil(spec.plannedTokens * .05)) fail('Strategy test exceeds phase work budget');
  const directory = projectFile(root, 'research/phases', false);
  const previous = fs.existsSync(directory) ? fs.readdirSync(directory).filter(name => /^[A-Za-z0-9_-]+\.json$/.test(name))
    .map(name => read(root, `research/phases/${name}`)).filter(record => record.status === 'closed' && record.family === spec.family)
    .sort((a, b) => String(b.closedAt ?? b.id).localeCompare(String(a.closedAt ?? a.id))).slice(0, 2) : [];
  if (previous.length === 2 && previous.every(record => record.result?.artisticVerdict === 'fail' || record.result?.technicalVerdict === 'fail') && !packet.changedPremise) {
    fail('Two closed family failures require changedPremise evidence');
  }
  return packet;
}

const HELP = 'Usage: node scripts/strategy.mjs record <packet.json>\nRecords an immutable evidence-pinned strategy packet. Reviewer metadata is self-reported and cannot authenticate independence.\n';
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, input, ...extra] = process.argv.slice(2);
    if (!command || ['--help', '-h', 'help'].includes(command)) process.stdout.write(HELP);
    else {
      if (command !== 'record' || !input || extra.length) fail('Invalid arguments; use --help');
      const result = recordStrategy(ROOT, JSON.parse(fs.readFileSync(input, 'utf8')));
      process.stdout.write(JSON.stringify({ path: result.path }) + '\n');
    }
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
