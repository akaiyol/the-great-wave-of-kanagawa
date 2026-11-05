# Inspiration and process learning

This log records sources, changes and attribution. Phase records remain authoritative for experimental outcomes. Personal details and cross-project notes stay private; only sanitized project-relevant lessons belong here.

## L001 — Durable knowledge is separate from execution

Source: [Anthropic, Managed Agents](https://www.anthropic.com/research/managed-agents), 2026-04-08; read2026-11-04.

Inspiration: durable session records need not share the lifetime of an execution process.

Change: Daphnie now has a canonical [public skill repository](https://github.com/akaiyol/daphnie) and a separate private Markdown knowledge store. Existing wave evidence pins and phase records predate this reading; they are not retroactively credited to it.

Status: implemented; structural validation passed, behavioral generality unproven. Source authors own the idea; Daphnie selected and implemented the scoped transfer.

## L002 — Make environment assumptions explicit

Source: [Burke Libbey / Shopify, What Is Nix](https://shopify.engineering/what-is-nix), 2020-05-19; supplied evergreen reading, not new news.

Observation: the skill validator required PyYAML, absent from both initial Python environments.

Change: validation used an isolated temporary environment with PyYAML6.0.2; the Daphnie package itself uses standard-library tooling. Nix installation is deferred because no benefit has been demonstrated here.

Attribution: Daphnie caused the dependency-preflight omission and detected/corrected it. This applies an explicit-input principle, not a claim of adopting Nix or cross-machine reproducibility.

## L003 — Check outcomes and diagnostic behaviors

Sources: [Anthropic evals](https://www.anthropic.com/research/demystifying-evals-for-ai-agents), 2026-01-09; [Google harness engineering](https://developers.googleblog.com/en/the-anatomy-of-harness-engineering-how-to-evaluate-iterate-and-guard-ai-coding-agents/), 2026-09-09.

Change: Daphnie's operating contract treats useful outcomes as primary and behavioral checks as diagnostic safeguards. The first probe targets project-context separation and private capture, not a forced sequence of tools. Passing structural checks does not establish judgment quality.

Status: implemented in instructions; one behavioral probe is being checked, not a general reliability claim. Daphnie synthesized the transfer; source authors retain credit.

## L004 — Own faults without stealing credit

The user reported stalled continuation. Daphnie diagnosed sleep-related activity gaps and acknowledged earlier premature endings; an explicit runtime goal and activity diagnostic followed in P082. Neither proves operation while a local host sleeps.

Independent reviewers rejected unsupported numerical acceptance quotas and caught completion-before-process-review in the diagram during P083. Daphnie corrected the definitions and graph. The reviewers, not Daphnie alone, receive detection credit.

Repeated review setup exceeded Daphnie's estimates. The operating core now requires proportional effort and distinguishes resource ceilings from spending targets. Efficiency remains unproven; P084 recorded the overrun rather than claiming a saving.

Evidence: [P082](phases/P082.json), [P083](phases/P083.json), [P084](phases/P084.json). Status: corrections applied; prospective effectiveness still needs evidence.

## L005 — Personality is not project state

Source: the owner's2026-11-04 correction.

Change: Daphnie's stable personality and decision principles live in CORE.md; operating procedures, goals, preferences and remembered facts are separate context. Reviewed knowledge feeds context, not automatic personality rewrites. The public and wave architecture diagrams reflect that distinction.

Attribution: owner identified the distinction; Daphnie implemented it. Status: applied.

## L006 — Classify source boundaries before choosing topology

Source: canonical museum scan and the independent P089 reviewer, who identified the missing region-connectivity analysis. [P090 observations](woodblock/source-regions.json) support a local distinction between filled water, continuous foam, open ink marks and sky-connected gaps.

Change: next construction must treat those boundary types separately. Daphnie had not enforced the existing warning that ink marks are not all water cavities; she owns that implementation fault. Reviewer receives detection credit. Status: local source interpretation verified; procedural benefit remains a trial. See [review](output/agent-phase-2026-11-04/P090/visual-review.json).

## L007 — Connected geometry still needs anatomical correspondence

Source: canonical scan; independent P097–P100 reviews. P097/P098 retained small local fork and ink gains, and P099 retained a whole-view water-layer gain. P100 failed: fitting a generated parent to two boundary endpoints made an oversized pendant glyph rather than integrated froth.

Change: before another attachment, establish the source relationship from upstream foam sheet through parent bridge to descending fork, including projected scale. Preserve the scoped gains separately. No parameter rescue or new gate. Daphnie owns the endpoint-fit assumption; the independent reviewer identified the integration failure.

Process: native visual rejection avoided broad checks on P100. Fresh-review startup exceeded its estimate in P099; use compact warm review for bounded variants and reserve fresh review for milestones. Efficiency improvement remains unproven. Evidence: [P099](phases/P099.json), [P100](phases/P100.json).
