#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const VERDICTS = ['pass', 'fail', 'incomplete', 'not_applicable'];
const STATE = 'research/agent-state.json';
const fail = message => { throw new Error(message); };
const object = (value, name) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(`${name} must be an object`);
};
const text = (value, name) => {
  if (typeof value !== 'string' || !value.trim()) fail(`${name} must be nonempty text`);
};
const integer = (value, min, name) => {
  if (!Number.isSafeInteger(value) || value < min) fail(`${name} must be an integer >= ${min}`);
};
const idCheck = id => {
  if (typeof id !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,79}$/.test(id)) fail('Invalid phase id');
};
const recordPath = id => { idCheck(id); return `research/phases/${id}.json`; };

// Reject lexical escapes and symlink escapes, including for not-yet-created targets.
function projectPath(root, relative, existing = false) {
  if (typeof relative !== 'string' || !relative || relative.includes('\\') || relative.includes('\0') || path.isAbsolute(relative)
    || relative.split('/').some(part => !part || part === '.' || part === '..')) fail('Invalid project path');
  const base = fs.realpathSync(root);
  const target = path.resolve(base, relative);
  let ancestor = target;
  while (!fs.existsSync(ancestor)) ancestor = path.dirname(ancestor);
  const real = fs.realpathSync(ancestor);
  if (real !== base && !real.startsWith(base + path.sep)) fail('Project path escapes root');
  if (existing && (!fs.existsSync(target) || !fs.statSync(target).isFile())) fail(`Evidence file missing: ${relative}`);
  return target;
}
const read = (root, relative) => JSON.parse(fs.readFileSync(projectPath(root, relative, true), 'utf8'));
function write(root, relative, value, json = true) {
  const target = projectPath(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = `${target}.${randomUUID()}.tmp`;
  try {
    fs.writeFileSync(temporary, json ? JSON.stringify(value, null, 2) + '\n' : value, { flag: 'wx' });
    fs.renameSync(temporary, target);
  } finally {
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
function evidence(root, values, name, required = false) {
  if (!Array.isArray(values) || (required && values.length === 0)) fail(`${name} must be an evidence array${required ? ' with at least one file' : ''}`);
  for (const value of values) projectPath(root, value, true);
}
function validateSpec(root, spec) {
  object(spec, 'spec'); idCheck(spec.id);
  for (const key of ['objective', 'hypothesis', 'baseline']) text(spec[key], key);
  if (!Array.isArray(spec.failureIds)) fail('failureIds must be an array');
  for (const value of spec.failureIds) text(value, 'failure ID');
  projectPath(root, spec.artifactTarget);
  integer(spec.plannedTokens, 1000, 'plannedTokens');
}
function validateResult(root, result, id) {
  object(result, 'result');
  if (result.id !== id) fail('Result phase id mismatch');
  for (const key of ['summary', 'nextAction']) text(result[key], key);
  for (const key of ['technicalVerdict', 'artisticVerdict']) {
    if (!VERDICTS.includes(result[key])) fail(`Unknown ${key}`);
  }
  if (typeof result.artifactDelivered !== 'boolean') fail('artifactDelivered must be boolean');
  if (!result.artifactDelivered && !['fail', 'incomplete'].includes(result.technicalVerdict)) fail('Failed delivery requires fail/incomplete technical verdict');
  evidence(root, result.evidence, 'result evidence', true);
  if (result.estimatedWorkTokens !== null) integer(result.estimatedWorkTokens, 0, 'estimatedWorkTokens');
}
function validateReview(root, review, id) {
  object(review, 'review');
  if (review.id !== id) fail('Review phase id mismatch');
  if (!Array.isArray(review.findings) || review.findings.length > 3) fail('findings must contain at most 3 items');
  for (const finding of review.findings) text(finding, 'finding');
  if (!Array.isArray(review.actions) || review.actions.length > 3) fail('actions must contain at most 3 items');
  if (!review.findings.length && !review.actions.length) fail('Empty review: record a finding or explicit no-change action');
  for (const action of review.actions) {
    object(action, 'action');
    if (!['retain', 'change', 'drop'].includes(action.decision)) fail('Unknown review decision');
    text(action.summary, 'action summary'); evidence(root, action.evidence, 'action evidence', true);
  }
  text(review.nextImprovement, 'nextImprovement');
  integer(review.estimatedReviewTokens, 1, 'estimatedReviewTokens');
}
function accounting(record) {
  const work = record.result?.estimatedWorkTokens ?? null;
  const review = record.review?.estimatedReviewTokens ?? null;
  return {
    basis: 'estimated', actualTokens: null,
    estimatedWorkTokens: work, estimatedReviewTokens: review,
    estimatedTotalTokens: work === null || review === null ? null : work + review,
    estimatedWorkOverrun: work === null ? null : Math.max(0, work - record.budget.workTokens),
    estimatedReviewOverrun: review === null ? null : Math.max(0, review - record.budget.reviewTokens),
    estimatedTotalOverrun: work === null || review === null ? null : Math.max(0, work + review - record.plannedTokens),
  };
}
function validateRecord(root, record) {
  validateSpec(root, record);
  if (!['working', 'review_required', 'closed'].includes(record.status)) fail('Unknown phase status');
  const reviewTokens = Math.ceil(record.plannedTokens * .05);
  if (record.budget?.reviewTokens !== reviewTokens || record.budget?.workTokens !== record.plannedTokens - reviewTokens) fail('Invalid 95/5 budget allocation');
  if (record.status !== 'working') {
    validateResult(root, record.result, record.id);
    if (record.result.artifactDelivered) projectPath(root, record.artifactTarget, true);
  }
  else if (record.result || record.review) fail('Working phase has premature result/review');
  if (record.status === 'closed') validateReview(root, record.review, record.id);
  else if (record.review) fail('Unclosed phase has review');
  if (JSON.stringify(record.accounting) !== JSON.stringify(accounting(record))) fail('Invalid estimate accounting');
  return record;
}
function current(root) {
  const state = read(root, STATE); object(state, 'state');
  if (!state.currentPhase) {
    if (state.currentPhaseRecord) fail('Phase record pointer has no phase ID');
    return { state, record: null };
  }
  if (state.currentPhaseRecord !== recordPath(state.currentPhase)) fail('Current phase pointer mismatch');
  const record = validateRecord(root, read(root, state.currentPhaseRecord));
  if (record.id !== state.currentPhase) fail('Current phase record ID mismatch');
  return { state, record };
}

export function startPhase(root, spec) {
  validateSpec(root, spec);
  const { state, record: previous } = current(root);
  if (previous && previous.status !== 'closed') fail('Current phase must be reviewed before starting another');
  const relative = recordPath(spec.id);
  if (fs.existsSync(projectPath(root, relative))) fail('Duplicate phase ID');
  const reviewTokens = Math.ceil(spec.plannedTokens * .05);
  const record = {
    schemaVersion: 1,
    ...Object.fromEntries(['id', 'objective', 'hypothesis', 'failureIds', 'baseline', 'artifactTarget', 'plannedTokens'].map(key => [key, spec[key]])),
    status: 'working', budget: { workTokens: spec.plannedTokens - reviewTokens, reviewTokens },
    startedAt: new Date().toISOString(), result: null, review: null,
  };
  record.accounting = accounting(record);
  write(root, relative, record);
  write(root, STATE, { ...state, currentPhase: spec.id, currentPhaseRecord: relative });
  generateBrief(root);
  return record;
}
export function recordResult(root, result) {
  const { record } = current(root);
  if (!record || record.status !== 'working') fail('Result requires a working phase');
  validateResult(root, result, record.id);
  if (result.artifactDelivered) projectPath(root, record.artifactTarget, true);
  record.result = result; record.status = 'review_required'; record.resultAt = new Date().toISOString();
  record.accounting = accounting(record); write(root, recordPath(record.id), record);
  generateBrief(root);
  return record;
}
export function reviewPhase(root, review) {
  const { record } = current(root);
  if (!record || record.status !== 'review_required') fail('Review requires a recorded result');
  validateReview(root, review, record.id);
  record.review = review; record.status = 'closed'; record.closedAt = new Date().toISOString();
  record.accounting = accounting(record); write(root, recordPath(record.id), record);
  generateBrief(root);
  return record;
}
export function checkPhase(root) {
  const { record } = current(root);
  if (!record) return { ok: true, currentPhase: null, status: null };
  const expected = buildBrief(root);
  const briefPath = projectPath(root, 'research/agent-brief.md', true);
  if (fs.readFileSync(briefPath, 'utf8') !== expected) fail('Startup brief is stale; run brief');
  return { ok: true, currentPhase: record?.id ?? null, status: record?.status ?? null };
}
const line = value => String(value ?? '').replace(/[\r\n]+/g, ' ').slice(0, 600);
function buildBrief(root) {
  const { state, record } = current(root);
  const memory = read(root, 'research/agent-memory.json');
  if (!Array.isArray(memory.lessons) || memory.lessons.length > 12) fail('Memory must contain at most 12 lessons');
  const lines = ['# Agent brief', '', 'Policy v2. Phase records are authoritative; review is required before advancing.', ''];
  if (record) {
    lines.push(`Current phase: ${record.id} (${record.status}).`, `Record: ${recordPath(record.id)}`,
      `Objective: ${line(record.objective)}`, `Hypothesis: ${line(record.hypothesis)}`,
      `Baseline: ${line(record.baseline)}`, `Artifact: ${record.artifactTarget}`,
      `Budget: ${record.budget.workTokens} work / ${record.budget.reviewTokens} review tokens (planned; usage estimated).`);
    if (record.result) lines.push(`Artifact delivered: ${record.result.artifactDelivered}.`, `Result: ${line(record.result.summary)}`, `Verdicts: technical ${record.result.technicalVerdict}; artistic ${record.result.artisticVerdict}.`, `Next action: ${line(record.result.nextAction)}`);
    if (record.review) {
      for (const action of record.review.actions) lines.push(`Decision (${action.decision}): ${line(action.summary)}`);
      lines.push(`Next improvement: ${line(record.review.nextImprovement)}`);
    }
  } else lines.push('Current phase: none.');
  for (const key of ['lastDecision', 'nextAction', 'retainedCandidate', 'checkpointReason']) {
    if (record?.result && ['lastDecision', 'nextAction'].includes(key)) continue;
    if (state[key]) lines.push(`State ${key}: ${line(state[key])}`);
  }
  lines.push('', 'Scoped lessons:');
  for (const lesson of memory.lessons) {
    if (lesson.status === 'archived') continue;
    lines.push(`- ${line(lesson.id)}: ${line(lesson.lesson)} Re-entry: ${line(lesson.reentryCondition)} Evidence: ${line((lesson.evidence ?? []).slice(0, 3).join(', '))}`);
  }
  const brief = lines.join('\n') + '\n';
  return brief;
}
export function generateBrief(root) {
  const brief = buildBrief(root);
  write(root, 'research/agent-brief.md', brief, false);
  return brief;
}

const HELP = `Usage: node scripts/phase.mjs start <spec.json> | result <result.json> | review <review.json> | brief | check
Spec: id, objective, hypothesis, failureIds[], baseline (text), artifactTarget (relative file), plannedTokens >=1000.
Result: id, summary, artifactDelivered (boolean), technicalVerdict, artisticVerdict, evidence[] (existing files), nextAction, estimatedWorkTokens (integer|null).
Verdicts: ${VERDICTS.join(', ')}. Delivered artifacts must exist; failed delivery requires fail/incomplete plus blocker summary and failure evidence.
Review: id, findings[] (text, max3), actions[] (max3: {decision:retain|change|drop,summary,evidence[]}), nextImprovement, estimatedReviewTokens >0.
Review needs a finding or action. Estimates may exceed reserves; actualTokens stays null. Transitions refresh startup context automatically; brief repairs manual memory/state edits.
`;
if (process.argv[1] && fs.existsSync(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  try {
    const [command, input, ...extra] = process.argv.slice(2);
    if (!command || ['help', '--help', '-h'].includes(command)) process.stdout.write(HELP);
    else {
      const mutations = { start: startPhase, result: recordResult, review: reviewPhase };
      const isMutation = Object.hasOwn(mutations, command);
      if (extra.length || (isMutation ? !input : input)) fail('Invalid arguments; use --help');
      let output;
      if (isMutation) output = mutations[command](ROOT, JSON.parse(fs.readFileSync(input, 'utf8')));
      else if (command === 'brief') output = generateBrief(ROOT);
      else if (command === 'check') output = checkPhase(ROOT);
      else fail('Unknown command; use --help');
      process.stdout.write(typeof output === 'string' ? output : JSON.stringify(output, null, 2) + '\n');
    }
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
