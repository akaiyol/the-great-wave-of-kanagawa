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

## L008 — Source research can rule out a convenient repair

P101's source-context study preserves visible sheet continuity and nested grouping, but does not establish a unique upstream tangent or replacement transform. The independent evaluator confirmed that limitation. P102 then rejected a coarse nonconcentric cap: changing macro curves alone did not establish a source-related gain. These findings do not invalidate all nonconcentric constructions.

Change: archive the pointed cap without branch/detail rescue; the next hypothesis must address foam and water boundaries jointly. Daphnie owns the coarse-construction assumption and an unchecked screenshot-size mismatch. The independent evaluator detected the capture fault; geometry stayed frozen while Daphnie corrected and verified the capture. Evidence: [P101](phases/P101.json), [P102](phases/P102.json).

## L009 — Boundary coverage is not an exterior union

P103's independent evaluator rejected crossing connector lines and repeated frills; shared root references had not established a valid exposed boundary. Daphnie owns that assembly assumption. The evaluator also correctly deferred the initial underdefined water/support proposal before construction. Evidence: [P103](phases/P103.json), [S103](strategies/S103.json).

Proposed next mechanism: drawing all outlines before all opaque fills may hide internal overlap seams. W3C's [SVG2 painting specification](https://www.w3.org/TR/SVG2/painting.html#PaintOrder), accessed2026-11-06, explains paint operations; Daphnie proposed the cross-component transfer. [P104](proposals/P104-union-paint.md) is independently reviewed but untested. It does not establish geometric union, support validity or better artwork. No P103 repair is authorized by this proposal.

## L010 — Configured continuation is not observed delivery

Owner requested five-hour allowance checks on2026-11-07. Host scheduling is configured; [P105](phases/P105.json) verifies saved configuration and the synchronized README diagram, not future wake or a concurrency lock. The independent reviewer caught a stale90% policy paragraph and an overstated runtime claim; Daphnie owns both faults and applied the corrections.

L009's proposed ordered-pass mechanism now has a limited rendered result in [P104](phases/P104.json): two opaque overlapping rectangles, not geometricunion or wave acceptance. Daphnie's transfer from SVG painting order remains unproven on curved foam.

## L011 — A source ambiguity is not a construction fact

[P106](phases/P106.json) showed that opaque overlap can hide generated fork anatomy as well as seams. Daphnie's support-envelope assumption caused that occlusion; the independent evaluator identified the visible failure, and the lead's narrow geometry probe localized it.

[P107](phases/P107.json) did not settle the neighboring source grouping. The researcher and evaluator kept it inconclusive. Daphnie owns an initially non-discriminating question: both interior ink and exposed edges already occur in the confirmed P093 parent. The next diagnostic uses only previously confirmed interior-contour roles, not the unresolved upper labels.

## L012 — Match one actual relationship, not just a category

The independent evaluator acknowledged that recent preflights weighted executable boundedness more than prospective artistic value. Daphnie owns the proposed recipes. [P110](phases/P110.json) instead matched the canonical water/foam/sky relationship: S had been incorrectly filled in the prior model. A planned profile over the reference led to a locally retained, checked interface gain. This provisionally supports source-matched task selection; it does not establish efficiency or whole-art success.

Daphnie also corrected an extra W probe that tested outside the declared source route, with identical rendered geometry, and fixed an incremental publication that briefly omitted matching state/control pointers. Initial evidence and limitations remain in the phase.

## L013 — A usage reset is not a scheduler tick

The owner identified the missed continuation. Daphnie configured a fixed five-hour heartbeat that checked127seconds before the reported reset and returned without scheduling recovery. The heartbeat fired; the allowance later became available. Fault ID: `runtime.reset-clock-mismatch`. [P111](phases/P111.json) adds a pure reset planner, a finite retry branch and proactive pre-exhaustion arming; the primary cadence remains unchanged.

The independent evaluator caught a year-less calendar-rule fault; Daphnie added an eight-day reset horizon and regression. Twelve planner checks pass. Saved scheduler configuration does not prove future delivery: the finite canary remains separately tracked. Retry the old skip-only design only if the host supplies a verified reset-triggered wake. Source: [official scheduling documentation](https://learn.chatgpt.com/docs/automations); mechanism transfer is Daphnie's, not an OpenAI reliability guarantee. No art, goal criteria or role models changed.

## L014 — Automatic work needs an explicit local-time boundary

The owner selected daily midnight–08:00 America/Toronto. [P112](phases/P112.json) updates the existing heartbeat and planner; daytime resets defer to the next night. The independent evaluator challenged an exact-minute filter. Daphnie removed slot filtering entirely: delayed wakeups use fresh local time, and DST padding checks are permitted recovery opportunities within the window. Seventeen planner tests pass.

P111's finite canary actually arrived14.678seconds after its target; its receipt is retained and test automation deleted. That observation does not prove nighttime execution, hard-stop enforcement or mutual exclusion. Fault `runtime.window-boundary`: retry older unrestricted automatic timing only with a new explicit owner instruction. No art/goal criteria or agent models changed.

## L015 — Tip positions do not preserve water anatomy

[P113](phases/P113.json) matched several source-related waterhead positions with an interpolated seam, but produced upright prongs and pinched necks. Daphnie owns the approximate profile; the worker implemented it correctly. The independent evaluator rejected the actual shape before affected checks. Failure `geometry.upright-water-prongs`: no nearby knot/width tuning; re-entry requires a changed representation protecting broad water area and descending foam hierarchy with source evidence. P110's local gain remains separate. Same-renderer static SVG comparison caught the failure while browser access was unavailable; no browser or efficiency claim follows.

## L016 — A matching source patch can disappear in the composition

[P114](phases/P114.json) used the evaluator's proposed descending pale-region mechanism. The source overlay matched a finite-area tongue, but its placement against P110 exposed only a thin filament. Daphnie owns that placement; the worker implemented the plan. The independent evaluator rejected it at whole-view scale. Failure `geometry.inlet-reduces-to-filament`: no nearby scaling/width rescue; re-entry requires changed coupled-mass representation or composition. Source calibration must account for the current enclosing water, not just an isolated outline. P110 remains retained; neither rejected experiment is an art gain.

## L017 — Exposure is not preserved anatomy

[P115](phases/P115.json) exposed a previously covered arm by horizontal shear, but made it a thin prong. Daphnie owns the mapping; the worker implemented it correctly, and the independent reviewer rejected it. Area/horizontal-width invariants did not preserve the visible shape. Failure `geometry.shear-exposes-prong`: re-entry requires preserving parent anatomy while changing the enclosing support material, not rescuing shear with width/pose edits. P110 remains retained.

## L018 — Change the occluding material without deforming the parent

[P116](phases/P116.json) kept the complete fork unchanged and opened its shared water/foam support boundary. The evaluator retained a limited shared-junction/subordinate-return gain; the rounded cove remains stylistically unresolved. Daphnie proposed the cove after the failed shear, and the worker implemented it. Actual lower-cove sky access, all four child/sheet overlaps, simple new polygons and frozen W/F/S passed checks. No whole-art or efficiency claim.

Daphnie caught that union membership alone cannot prove attachment and switched to direct child/sheet interior clearances. The independent evaluator identified missing boundary-contact/exit qualifications in the first route checker; Daphnie added partition-point/collinear checks and a strict-air route beyond the main material bound. Stronger checks pass without changing the artwork. Evidence and scope remain in the phase; no general topology or browser proof follows.

## L019 — A local gain does not justify repeating its shape

[P117](phases/P117.json) exposed another unchanged fork, but the independent reviewer rejected repeated rounded cups at whole-view scale. Daphnie owns the proposed opening; the worker implemented it correctly. Preserve P116 only in its tested regional scope. Failure `geometry.repeated-support-cups`: no nearby cove tuning; re-entry requires a materially different crest-wide construction and source evidence. The next question is branching distribution, not tip count.

Daphnie also owns the earlier native Safari fallback that stalled approximately10.7hours until the owner interrupted it, with no artwork progress. This is delivery failure, not evidence of productive compute or an allowance fault. The current static comparison completes without that access path; browser behavior remains unverified.

## L020 — A line on the source is not a material width

[P119](phases/P119.json) produced approximate transects, but the lead overlay and independent evaluator found mismatched heads, endpoints in ivory/blue interiors, and proposed ivory tips in blue. All numeric measurements are rejected; Daphnie owns the assignment and integration. Researcher attribution and the exact proposal remain in evidence. Failure `source.unsupported-width-correspondence`: re-entry requires independently visible material boundaries and same-region correspondence before measuring; no nearby coordinate rescue. Null body widths remain appropriate where regions merge. The source-only failure does not falsify broad connected water areas, and no renderer change follows.

## L021 — Stable color is not stable material identity

[P120](phases/P120.json) used fixed four-neighbor color components to replace guessed source endpoints. The worker implemented the declared rule; the independent reviewer identified attached ink, blue pinholes and crop truncation. Retain only a reproducible broad color-core observation, not segmentation truth or an artwork asset. Failure `source.color-material-conflation`: no threshold tuning; material measurements or renderer transfer require independent role/correspondence evidence. Daphnie owns scope and rejects unsupported promotion. No artwork or efficiency gain is claimed.

## L022 — Check whether the operation can produce its prediction

[P121](phases/P121.json) added positive-width blue lobes but could only remove old ivory. The independent evaluator identified the causal restriction: new ivory was a subset of old ivory, so it could not descend into previously blue water. Daphnie owns this inconsistent recipe and the resulting contour occlusion; the worker implemented it faithfully. Failure `geometry.monotone-material-recipe`: no cap/width rescue; re-entry requires coupled material displacement with explicit witness areas for ivory entering old blue and a changed whole-anatomy prediction. Root attachment alone is not artistic improvement.

## L023 — Reachable material is not adequate anatomy

[P122](phases/P122.json) passed declared two-way material disks and connected ivory-root evidence, but independent whole-view review rejected long slots and capsule fingers. Daphnie owns the candidate; the worker followed it. Keep displacement as a scoped technical result only. Failure `geometry.appendage-without-hierarchy`: no narrow ribbon variants; re-entry requires a crest-wide representation coupling water shoulders, ivory junctions, unequal branches and outer curl, with a different prospective visible prediction. No efficiency or artistic improvement is claimed.

## L024 — Transfer a retained relationship through the same parent

[P124](phases/P124.json) maps the P098 hood/counter/accent through the exact generated-parent identity used by P116 child0. The independent reviewer retained a small visible articulation gain after direct whole-polygon child containment and whole-view review. This credits the earlier P098 mechanism; it is not a new grammar or an independent stamp field. No source mask, new material cuts, browser acceptance or whole-art claim. Daphnie owns the1400estimated test-cap overrun; full worker/startup/capture/review cost must be budgeted before further dispatch. Existing bounded source-role and overhead lessons updated, with no role/workflow or goal changes.

## L025 — Correct placement is not varied anatomy

[P125](phases/P125.json) transferred exact parent-linked pairs to three other existing forks. All containment/integration checks passed; independent whole-view review rejected the repeated eye-like sequence. Daphnie owns the test; the worker implemented it. Failure `source.frame-only-contour-variation`: no field-density/pose/scale rescue; next outerfork and interiorcontours need a concrete joint shape relationship. P124oneparent gain remains.

The worker independently avoided dumping rawpolygon arrays and used runtime comparison. Daphnie added a compact summary at the owning checker afterward. That repair implements existing compact-evidence guidance; it did not cause this worker’s lower estimated cost. Different scopes/context and unknown telemetry prevent an efficiency claim.

## L026 — Frame conditioning and pointwise conditioning differ

[P126](phases/P126.json) read Lingdong Huang’s pinned original implementation: barkify uses actual edges to position/orient a separate motif, while texture constructs individualpoints fromcontourrows. The read-only researcher found no P098pair-to-edge correspondence; the independent reviewer retained the distinction but deferred adaptation. Credit Huang for originalmechanisms; no treeappearance/code or source-derivedwaveasset adopted. Daphnie owns the proposed transfer limits. Failure `source.transport-not-anatomy`: root-localpointchanges from transportedglyphs are not sufficient; actual pairedcurve correspondence/deformation must be explicit. No dependencytest or artgain claimed.

## L027 — A valid ornament region is not necessarily a valid material chart

[P127](phases/P127.json) found every markvertex inside a shoulderquad, but its W–X chord crosses sky outside the actualfoam. The independent reviewer confirmed a positive-clearance counterexample; no worker/prototype was dispatched. Daphnie owns the invalidchart proposal. Failure `geometry.virtual-chart-outside-material`: no corneradjustment or weakenedcontainment; another construction needs a changedrepresentation. The audit also found fixed shouldervertices across seededparents, explaining why changingtipseedparameters did not vary the anatomy beneath the curls. This is code-level evidence, not source-image measurement or general failure of boundaryconditioning.

## L028 — A failed support path is a scoped failure

[P128](phases/P128.json) preserves a model-specific J-facing mouth relation while co-generating shoulder/descendantgeometry. Allthree mark/angle checks passed; Q failed the declared frozen P→A radius3 corridor at clearance2.1884. The independent reviewer confirmed strictstop and no artist verdict; this does not prove globalarmdisconnection. No geometry/threshold altered and noSVGgenerated. Daphnie owns the ambiguous X-vector handoff and its clarificationcost; the worker correctly stopped for that decision. Futurediagnosis needs separately reviewed anatomicalsupport evidence, not a retroactivelyrelaxedcriterion.

## L029 — A technical rescue is not an artistic one

[P129](phases/P129.json) proves one fixed edge-derived radius3connection across the unchanged localforms; P128stillfaileditsoriginalcorridor. The fresh evaluator rejected the images as repeatedeye-likeinserts and identified the wholeblankcap as the dominantbottleneck. Credit the independentreviewer for the task-selection pivot and LingdongHuang’s originalpointwisecontour precedent for inspiration, not thisspecificroute. Daphnie owns the isolatedprimitive detour and reviewreserve underallocation. Active lesson `process.local-proof-drift` replaces an automaticallyenforcedstale-brief reminder, archived in the phase. Nextfocus is one whole-view connectedbranchgroup, not anotherlocalparameterproof.

## L030 — Keep a direction separate from a failed artifact

[P130](phases/P130.json) followed the freshwhole-viewpriority witha sharedrecurvedboundary. Daphnie’s exactrecipeproduced one small self-crossing; the worker followedit. Independentreviewauthorized one unchanged forensicview and sawmodestsource-relatedinterlock, while retaining onlythedirection—not thefailedartwork. A separatelyreviewedintegrityrepair needs a validwholecomparison andmaystillfail artistically. No localparameterredesign or additionalgroups approved. P124remainsretained.

## L031 — A failed raster gate has a narrow meaning

[P131](phases/P131.json) removed the one eligible cycle and passed geometric, serialized partition, probe and frozen-source checks. Seven rendered pixels exceeded the predeclared locality bound. Daphnie retained the failed gate rather than widening it; the independent reviewer distinguished this observation from evidence of broad source changes or capture instability. P124 remains retained. Another repaired-branch claim requires a separately reviewed fixed-input capture discriminator; no second repair is authorized. Daphnie owns the review-reserve estimate overrun; the worker followed the bounded operation.
