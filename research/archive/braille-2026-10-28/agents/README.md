# Codex wave agents

[Lead workflow](wave-completion.md) owns delegation, experiment records and the two-edit stopping rule. The lead handles small serial changes; workers implement bounded tasks, researchers resolve distinct gaps, and independent reviewers assess promising promotions. Two children are a ceiling, with one source writer.

Models are defined in `.codex/agents/`; defaults are in `.codex/config.toml`. Evaluator changes invalidate previous review identity. Instructions do not establish runtime savings or enforce a hard token cap.

[Checkpoint](../research/agent-state.json) · [Retrospective](../research/iteration-retrospective-2026-10-26.md) · [Routing evidence](../research/output/agent-routing-smoke.json)
