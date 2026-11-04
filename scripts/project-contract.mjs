#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fail = message => { throw new Error(message); };
const text = (value, name) => { if (typeof value !== 'string' || !value.trim()) fail(`${name} must be nonempty text`); };
function file(root, relative, exists = true) {
  if (typeof relative !== 'string' || path.isAbsolute(relative) || relative.includes('\\') || relative.includes('\0') || relative.split('/').some(p => !p || p === '.' || p === '..')) fail('Invalid contract path');
  let target = fs.realpathSync(root);
  for (const part of relative.split('/')) {
    target = path.join(target, part);
    try { if (fs.lstatSync(target).isSymbolicLink()) fail('Contract symlink rejected'); } catch (e) { if (e.code !== 'ENOENT') throw e; }
  }
  if (exists && (!fs.existsSync(target) || !fs.statSync(target).isFile())) fail(`Missing contract file: ${relative}`);
  return target;
}
const raw = (root, p) => fs.readFileSync(file(root, p), 'utf8');
const read = (root, p) => JSON.parse(raw(root, p));
const sha = (root, p) => createHash('sha256').update(fs.readFileSync(file(root, p))).digest('hex');
function load(root) {
  const state = read(root, 'research/agent-state.json');
  const goals = read(root, 'research/project-goals.json');
  if (sha(root, 'research/project-goals.json') !== state.projectContract?.goalsSha256) fail('Canonical goals pin mismatch');
  if (!Array.isArray(goals.goals) || goals.goals.length !== 2 || new Set(goals.goals.map(g => g.id)).size !== 2 || !goals.goals.every(g => ['ART', 'SYSTEM'].includes(g.id) && g.priority === 'equal')) fail('Require equal ART and SYSTEM goals');
  const ids = new Set();
  for (const goal of goals.goals) {
    for (const key of ['name', 'objective', 'finalOutput']) text(goal[key], key);
    if (!Array.isArray(goal.criteria) || !goal.criteria.length) fail('Goal criteria required');
    for (const criterion of goal.criteria) {
      if (!/^[AS][1-9][0-9]*$/.test(criterion.id) || ids.has(criterion.id) || criterion.id[0] !== (goal.id === 'ART' ? 'A' : 'S')) fail('Invalid or duplicate criterion ID');
      ids.add(criterion.id);
      for (const key of ['name', 'requirement', 'evidence']) text(criterion[key], key);
    }
  }
  const progress = read(root, 'research/goal-progress.json').criteria;
  if (!progress || typeof progress !== 'object' || Array.isArray(progress) || Object.keys(progress).length !== ids.size || Object.keys(progress).some(id => !ids.has(id))) fail('Progress criterion IDs mismatch');
  for (const id of ids) {
    const entry = progress[id];
    if (!entry || !['unmet', 'partial', 'met', 'unknown'].includes(entry.status) || !Array.isArray(entry.evidence)) fail(`Invalid progress: ${id}`);
    if (entry.status === 'met' && !entry.evidence.length) fail(`Met criterion requires evidence: ${id}`);
    for (const p of entry.evidence) file(root, p);
  }
  return { state, goals, progress };
}
function architecture(root) {
  const manifest = read(root, 'research/agent-architecture.json');
  if (!manifest.sourcePins || typeof manifest.sourcePins !== 'object' || Array.isArray(manifest.sourcePins) || !Object.keys(manifest.sourcePins).length) fail('Architecture sourcePins required');
  for (const [p, pin] of Object.entries(manifest.sourcePins)) if (!/^[a-f0-9]{64}$/.test(pin) || sha(root, p) !== pin) fail(`Architecture source pin mismatch: ${p}`);
  const ids = new Set();
  const label = value => { if (typeof value !== 'string' || !/^[A-Za-z0-9 .,:;+/%()_-]+$/.test(value)) fail('Unsafe Mermaid label'); return `"${value}"`; };
  if (!Array.isArray(manifest.nodes) || !manifest.nodes.length || !Array.isArray(manifest.edges)) fail('Architecture nodes/edges required');
  const lines = ['```mermaid', 'flowchart TD'];
  for (const node of manifest.nodes) {
    if (!/^[A-Za-z][A-Za-z0-9_]{0,79}$/.test(node.id) || ids.has(node.id)) fail('Invalid or duplicate architecture node');
    ids.add(node.id); lines.push(`  n_${node.id}[${label(node.label)}]`);
  }
  for (const edge of manifest.edges) {
    if (!ids.has(edge.from) || !ids.has(edge.to)) fail('Unknown architecture edge node');
    lines.push(`  n_${edge.from} -->${edge.label === undefined ? '' : `|${label(edge.label)}|`} n_${edge.to}`);
  }
  lines.push('```');
  const stamp = createHash('sha256').update(JSON.stringify(Object.entries(manifest.sourcePins).sort(([a],[b])=>a.localeCompare(b)))).digest('hex');
  return `<!-- Reviewed architecture inputs: ${stamp} -->\n${lines.join('\n')}`;
}
const flat = s => String(s).replace(/[\r\n]+/g, ' ');
function goalDocument(goals) {
  const lines = ['# Project goals', '', goals.authority, '', goals.completionRule];
  for (const goal of goals.goals) {
    lines.push('', `## ${goal.id}: ${goal.name}`, '', `Priority: ${goal.priority}.`, '', goal.objective, '', `Final output: ${goal.finalOutput}`);
    for (const c of goal.criteria) lines.push('', `### ${c.id}: ${c.name}`, '', c.requirement, '', `Required evidence: ${c.evidence}`);
  }
  lines.push('', '## Method and reference', '', `[Method inspiration](${goals.methodInspiration.url}): ${goals.methodInspiration.mechanism}`, '', `Canonical reference: ${goals.canonicalReference}`, '', '## Provisional evaluation plan', '', goals.provisionalEvaluationPlan.status, '', `ART: ${goals.provisionalEvaluationPlan.art}`, '', `SYSTEM: ${goals.provisionalEvaluationPlan.system}`, '', '## Non-goals', '', ...goals.nonGoals.map(value => `- ${value}`));
  return lines.join('\n') + '\n';
}
function replaceBlock(source, name, content) {
  const start = `<!-- ${name}:start -->`, end = `<!-- ${name}:end -->`;
  if (source.split(start).length !== 2 || source.split(end).length !== 2 || source.indexOf(start) >= source.indexOf(end)) fail(`README ${name} markers invalid`);
  const a = source.indexOf(start) + start.length, b = source.indexOf(end);
  return source.slice(0, a) + '\n' + content + '\n' + source.slice(b);
}
export function projectGoalBrief(root) {
  const { goals, progress } = load(root);
  return goals.goals.map(g => `Goal ${g.id} (equal): ${flat(g.name)}. Outstanding criteria: ${g.criteria.filter(c => progress[c.id].status !== 'met').map(c => `${c.id} (${progress[c.id].status})`).join(', ') || 'none recorded; acceptance requires evidence'}.`);
}
export function assertProjectPhase(root, spec) {
  const state = read(root, 'research/agent-state.json');
  if (state.projectContract?.enabled !== true) return;
  checkProjectContract(root);
  if (!Array.isArray(spec.goalIds) || !spec.goalIds.length || new Set(spec.goalIds).size !== spec.goalIds.length || spec.goalIds.some(id => !['ART', 'SYSTEM'].includes(id))) fail('goalIds must name ART and/or SYSTEM');
  text(spec.otherGoalProtection, 'otherGoalProtection');
}
function generated(root) {
  const { goals } = load(root);
  const diagram = architecture(root);
  const summary = ['Both project goals have equal priority.', '', ...goals.goals.map(g => `- **${g.id}: ${flat(g.name)}.** ${flat(g.objective)}`), '', '[Full goals and acceptance criteria](GOALS.md). Progress status does not establish visual acceptance.'].join('\n');
  return { goals: goalDocument(goals), readme: replaceBlock(replaceBlock(raw(root, 'README.md'), 'goals', summary), 'architecture', diagram) };
}
export function checkProjectContract(root) {
  const expected = generated(root);
  if (raw(root, 'GOALS.md') !== expected.goals) fail('GOALS.md drift; run project-contract sync');
  if (raw(root, 'README.md') !== expected.readme) fail('README generated block drift; run project-contract sync');
  return { ok: true, goals: ['ART', 'SYSTEM'] };
}
export function syncProjectContract(root) {
  const expected = generated(root); // Validate all pins and inputs before either write.
  const target = file(root, 'GOALS.md', false), readme = file(root, 'README.md');
  fs.writeFileSync(target, expected.goals); fs.writeFileSync(readme, expected.readme);
  return checkProjectContract(root);
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, ...extra] = process.argv.slice(2);
    if (extra.length || !['sync', 'check'].includes(command)) fail('Usage: node scripts/project-contract.mjs sync|check');
    console.log(JSON.stringify((command === 'sync' ? syncProjectContract : checkProjectContract)(ROOT)));
  } catch (error) { process.stderr.write(`${error.message}\n`); process.exitCode = 1; }
}
