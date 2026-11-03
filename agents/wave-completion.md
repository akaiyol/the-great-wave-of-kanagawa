# Phase workflow — policy v2

## Startup and purpose

The main project goal is an agentic system that improves through evaluations and feedback; procedural Great Wave artwork is its test case. Read AGENTS.md, `research/agent-brief.md`, `research/agent-state.json` and the linked current phase. Load durable lessons by failure ID; retrieve historical evidence only when needed.

## Team

Lead owns scope, uncertain geometry, source integration, browser capture and decisions. Use one independent evaluator for plausible artifact reviews and the end-of-phase process review. Worker is optional for defined patches; researcher is optional for one exact blocker. At most one child active, one source writer, no recursive delegation. Existing role models stay unchanged. Use fresh minimal contexts and require policy v2 plus phase ID in the first handoff.

For a delegation: provide one failure ID, concrete hypothesis/construction, owned files, first artifact path, rejection condition and budget. Preserve others' edits. If the first artifact cannot be built, report the missing decision immediately. Narrow once; after another no-artifact result stop delegation and take serial ownership. Do not repeatedly poll unchanged work. Lead supplies captures unless explicitly assigned elsewhere.

## Phase lifecycle and 5% reserve

Use `node scripts/phase.mjs` to start a phase from a JSON specification, record its result, submit process review and regenerate the startup brief. See the CLI help. One executable hypothesis or bounded architecture change is a phase; do not redefine phase boundaries merely to avoid review.

At start set a planned token budget. Allocate 95% to implementation, artifact evaluation and checks; reserve the final 5% for process/log assessment. Stop new artifact work when the work allocation is reached; review the actual result, even if incomplete or rejected. Exact host/per-agent token usage is not exposed: estimates are estimates, actual values remain null unless telemetry supplies them. Tool counts, wall time and shared account usage are not exact compute. The tool enforces phase ordering/review completion, not an exact runtime token cap.

Before closing EVERY phase, without another user prompt, review: artifact delivery, repeated failure IDs, scope/evidence mismatch, wasted tests/calls, log consistency and changes worth retaining. Record at most three findings, retain/change/drop actions, evidence and the next concrete improvement. No geometry tuning inside the review reserve. Evaluator process mode provides independent critique at architecture changes, surprising failures and milestones; lead performs the same required review on cheap intermediate phases. Use only a compact phase record and matching lesson IDs initially; reserve source rereads for concrete discrepancies. Include expected context/setup cost in the review plan and record overruns. No-change is valid. If reserve is exhausted, record incomplete review and do not start another phase.

A phase cannot close or advance without its structured process review. Apply supported lessons to bounded `research/agent-memory.json`; archive superseded lessons through phase history. No automatic relaxation of acceptance criteria, reference pin, model/provider or permissions. Update workflow/role instructions only for evidence-backed process corrections; test fresh runtime adoption.

## Evidence and visual gates

Inspect the unchanged canonical scan before visual design. Work from convincing still to varied constructions, continuous scenery, then travel/release checks. Body and foam share the exposed boundary; local branch overlap or simple components do not prove an exterior union or open sky route. No fading joins. Compare native whole context before details and material texture. Passing numbers cannot override failing source anatomy or style. User artistic acceptance remains separate.

First capture one discriminating view. Run affected checks; reuse broad exact-regression evidence while owning source is unchanged. Bind source/reference hashes and viewport/DPR to captures; receipt excludes itself. Never regenerate reference pin or weaken fixtures for a pass. Record missing evidence explicitly. After two attempts preserve a failure signature, change representation/scale/interpretation; candidate renaming does not reset the count. Prior rejected method requires an explicit changed premise.

## Records and continuation

`research/phases/<id>.json` is authoritative for new phase results and reviews. `agent-state.json` holds current pointers; `agent-brief.md` is generated for startup. `agent-memory.json` holds at most 12 active, scoped lessons with evidence and re-entry conditions. Historical action log is an index/archive, not a second changing account. Do not duplicate phase outcomes across prose logs and checkpoints.

Check account allowance at startup/milestones; at <=10% remaining in either window checkpoint and stop new delegation. Never purchase/reset credits or switch to paid fallback. The per-phase 5% reserve does not replace that account limit. Continue authorized work after each completed review. Stop for user request, allowance/external blocker or verified criteria; do not use recurring artistic-approval questions as the loop gate. Boats/Fuji remain undecided but do not block current geometry.
