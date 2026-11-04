# ADR-004: Independent strategy challenge and explicit continuation

**Status:** Accepted for a bounded pilot; decision quality and continuity improvements remain unverified.
**Date:** 2026-11-04
**Decider:** Project lead, following the user's request and independent architecture critique.

## Context

The lead chooses both the experiments and the agents reviewing them. Artifact review catches poor output, but can arrive after an unsupported hypothesis has consumed a phase. More reviewers alone do not correct that bias. Conversely, a critic that rejects every incomplete experiment prevents useful exploration.

The activity audit found sleep/wake intervals closely matching the long gaps in P081. No long-running test accounts for those gaps. Earlier runs also ended before the requested allowance ceiling. No runtime continuation goal was active when checked; one was activated after the user restored the 90%-used limit. These are separate execution and decision-quality problems.

## Decision

Reuse the independent evaluator in **strategy mode**, before implementing a new phase hypothesis. Preserve existing role models, one active child, and one source writer. Keep artifact review and the mandatory final 5% process review. Strategy work belongs in the productive-work budget; it is not a substitute for the process reserve.

Every new phase after this bootstrap needs an evidence-pinned strategy packet. It records:

- The hypothesis and stable method family.
- Supporting and contrary evidence, with explicit unknowns rather than invented objections.
- A causal prediction and observable outcomes that would support or falsify it.
- One discriminating test, its stopping budget, and the independent recommendation.
- A changed premise supported by evidence when re-entering a family with two explicit failures.

Decisions are **continue**, **pivot**, **reject**, or **defer**. Continue preserves a supported path within its demonstrated scope. Pivot changes an identified assumption or construction. Reject ends the tested construction, without claiming every related idea is false. Defer identifies the missing evidence. An implementation defect or incomplete image is not automatically a disproven artistic premise.

`scripts/strategy.mjs` checks the contract, evidence identity, scope, and phase binding. `scripts/phase.mjs` gates new phase starts when the strategy policy is enabled. These checks cannot authenticate independent reasoning or prove that a recommendation is intelligent. The actual fresh-agent handoff remains required; the lead records its response faithfully and may request reconsideration with material new evidence, not silently change the verdict.

## Continuation and activity

The account threshold is a ceiling, not an improvement metric. The restored rule is to checkpoint at 90% used in either account window, with no resets, purchases, paid fallback, or waiting for a reset. Record the authorization in project state and check the actual runtime goal at startup and milestones. A saved instruction is not itself an active runner.

`scripts/run-health.mjs` reports recent versus stale recorded activity from event metadata. It does not call a model, restart sessions, schedule work, or diagnose the cause of a gap. A monitor inside a sleeping or stalled host cannot recover that host. The audit stores only sanitized event times and power events, not conversation or reasoning text. No new recurring automation or power-setting change is installed.

## Options considered

| Option | Benefit | Cost or limitation | Decision |
|---|---|---|---|
| Lead-only reflection | Smallest setup | Lead can defend its own assumptions | Retain for cheap process checks only |
| Existing independent evaluator with a pre-work contract | Challenges hypotheses and preserves current staffing | Still a fallible model; adds review cost | Pilot |
| Permanent additional strategist agent | Dedicated role | More coordination and correlated judgments; no demonstrated benefit | Defer |
| External scheduled recovery service | Can observe an inactive local loop | Separate runtime, permissions and host availability requirements | Not installed |

## Validation

First test deterministic gates against missing, stale, mismatched and unsupported records. Then use fresh, outcome-hidden historical packets to check whether the critic preserves a demonstrated local gain, rejects a failed construction, and withholds judgment on an incomplete premise. This is a small calibration check, not a measured general reliability rate. Prospectively review the next P081 integration hypothesis before its experiment, then compare the prediction with the observed result. Do not expand the machinery before that pilot.

## Consequences

Hypotheses, stopping conditions and contrary evidence become reviewable before implementation. Failed implementation and failed ideas remain distinguishable. Review overhead and critic errors must be measured; a structured packet can still rubber-stamp poor judgment. Runtime sleep and unexplained backend gaps remain outside the guarantees of this repository.

## Sources

- [Official trace-grading guidance](https://developers.openai.com/api/docs/guides/trace-grading): assess the decision/tool trace as well as final output.
- [Official skill evaluation guide](https://developers.openai.com/blog/eval-skills): combine deterministic checks with qualitative grading.
- [Scheduled tasks documentation](https://learn.chatgpt.com/docs/automations?surface=app): local-file tasks need the computer on and app running.
