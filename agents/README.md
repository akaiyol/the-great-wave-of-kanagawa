# Wave agents

The [lead workflow](wave-completion.md) governs the woodblock rebuild.

| Role | Responsibility | Use |
|---|---|---|
| Lead | Art direction, integration, milestone decisions | Always |
| wave_worker | Complete colored geometry and rendering within owned files | Bounded implementation |
| wave_evaluator | Independent reference and display-scale review | Promising milestones |
| wave_researcher | Resolve one blocking question | Only when needed |

Retain existing models in `.codex/agents/` and concurrency defaults in `.codex/config.toml`. At most two children, one source writer, no recursive delegation. More roles are not required.

[Action log](../research/agent-iteration-log.md) · [Active plan](../research/woodblock-plan.md) · [Checkpoint](../research/agent-state.json) · [Review protocol](../research/validation-loop.md)

The [Braille archive](../research/archive/braille-2026-10-28/) preserves superseded instructions and checkpoint for provenance. It is not startup context. Role file edits require a fresh agent invocation to assess behavior; file validation alone does not prove runtime adoption.
