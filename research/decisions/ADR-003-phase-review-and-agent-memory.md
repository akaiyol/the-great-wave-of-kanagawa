# ADR-003: Artifact-first phases with mandatory process review

**Status:** Accepted; lifecycle and fresh-role adoption exercised in P066–P068
**Date:** 2026-11-02
**Decider:** Project lead, under user authorization to reconfigure and reserve 5% per phase

## Context

The project's main purpose is an agentic system that improves through evaluation. Wave art is the demanding test case. W062–W065 show local geometry passes without whole-artwork acceptance, delayed handoffs despite completed diagnostics, and two worker attempts without an artifact. The lead then produced the bounded control directly. W063 broad regressions cost 418.9 seconds; repeating them after unrelated edits is wasteful. Narrative history mixes hypotheses, scope, results and next actions, forcing reconstruction at startup.

## Decision

Use a lead-builder and independent evaluator as the default pair. Invoke the worker only for defined patches and the researcher only for an exact blocking question. One child at a time and one source writer. Keep existing role models. Uncertain geometry begins as a lead-built executable slice; do not multiply specialists to compensate for a missing construction decision.

Each phase has a bounded hypothesis, baseline, failure IDs, artifact, evidence and decision. Reserve 5% of its planned token budget for process/log review; productive work uses the other 95%. Exact per-agent compute telemetry is not exposed here: record estimates explicitly and leave actual usage null. Account-wide allowance changes are not phase token measurements. The reserve is a planning allocation; the phase tool enforces review completion and phase ordering, not an exact runtime token cap.

Review is mandatory before closing a phase or starting another, even for rejected results. The lead applies supported retain/change/drop decisions to durable lessons. Evaluator process mode checks the phase without a permanent extra meta-agent. No background scheduler or model-weight training is introduced.

## Options considered

| Option | Complexity/cost | Assessment |
|---|---|---|
| More persistent specialist agents | High coordination and context cost | Reject: existing failure was missing artifact delivery, not insufficient roles. |
| Lead only | Low coordination cost | Retain for uncertain construction; insufficient independent evaluation on its own. |
| Lead-builder + reviewer, optional specialists | Moderate, bounded | Select: preserves independent critique and reduces handoffs. |

## Logs and retrieval

- `agent-state.json`: current pointers and next action only.
- `agent-brief.md`: generated short startup context from current phase and durable lessons.
- `agent-memory.json`: bounded, evidence-linked lessons with stable failure IDs and re-entry conditions.
- `phases/<id>.json`: structured authoritative record for each new phase; process review lives with its result.
- Existing action log and source/capture snapshots: historical evidence, retrieved by link rather than loaded wholesale.

One record per phase avoids an unbounded JSONL stream that still needs replay. Do not maintain a second prose account of every new result. Scripts generate the brief; no vector database, dashboard or external service is needed at this scale.

## Consequences and checks

Smaller startup context and queryable outcomes become possible. Lead-managed estimates and reviews can still be inaccurate; reserve percentage is not a measured-compute guarantee. Repeated failure detection must use stable IDs, not renamed candidate numbers. A lesson remains scoped to its evidence and may be revised by a changed premise. Artistic promotion stays separate from technical and process success.

Implementation must demonstrate: an unreviewed phase blocks the next one; the budget splits 95/5; missing review fields fail; generated briefs expose current failure/next action; a fresh role reads policy v2; then a real wave iteration closes with a process review.

Official role configuration reference: [OpenAI subagents](https://learn.chatgpt.com/docs/agent-configuration/subagents).

## Exercised results

P066 produced fresh policy-v2 worker/evaluator handoffs, nine lifecycle tests and a real CLI rejection of unreviewed advancement. Its independent process audit found stale briefs and estimated an 8,000-token reserve overrun; both findings remain recorded. P066b added automatic refresh, staleness detection and CLI subprocess coverage: 11 tests pass. P067 was rejected cheaply from a native render; P068 retained a scoped local visual gain after independent review. All four phase records include process review. Exact runtime compute enforcement and fully autonomous review quality remain unproven.
