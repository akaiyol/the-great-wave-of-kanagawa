# Wave agents — policy v2

The main experiment is an evaluated agent system; wave art supplies the test case.

| Role | Current responsibility | When used |
|---|---|---|
| Lead | Phase budget, uncertain construction, integration, captures and decisions | Always |
| wave_worker | A defined patch with an executable first handoff | Optional |
| wave_evaluator | Independent artifact review; bounded process review | Milestones/process changes |
| wave_researcher | One exact blocking question | Only when needed |

One child at a time, one source writer, existing role models. No permanent meta-agent. Every phase reserves 5% of planned tokens for process/log review; estimates remain estimates when runtime telemetry is unavailable. `scripts/phase.mjs` blocks advancement until that review is recorded.

Read the [generated brief](../research/agent-brief.md), current phase and relevant [durable lessons](../research/agent-memory.json). New authoritative records are under `research/phases/`; historical [action logs](../research/agent-iteration-log.md) are retrieved by link. [Workflow](wave-completion.md) · [Architecture decision](../research/decisions/ADR-003-phase-review-and-agent-memory.md)

Role-file changes require a fresh invocation to demonstrate runtime adoption. The P066 worker confirmed policy v2; reviewer adoption is checked separately. Validation of files alone is not runtime proof.
