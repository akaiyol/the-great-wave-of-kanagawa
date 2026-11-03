# Research: visual evaluation that can guide wave geometry

2026-10-26. Continued research following the agent retrospective. No production geometry, renderer, evaluator rubric or fixed fixture was changed.

## Findings from primary sources

**Reference-guided, criterion-specific judgment is more useful than open-ended preference.** OpenAI's [evaluation guidance](https://developers.openai.com/api/docs/guides/evaluation-best-practices) discusses pairwise and reference-guided grading, clear criteria, human calibration and position bias. Application: ask whether the specified shared root, unequal primaries and secondary branch survive, separately from which image looks better. Use a reversed-order check when a marginal or consequential comparison needs confirmation; do not multiply reviewers for every edit. A recommendation to use a stronger judge does not establish that changing our model would improve this task. Existing routing stays unchanged.

**Precise visual topology needs more than a model's description.** Rahmanzadehgervi et al., [Vision language models are blind](https://arxiv.org/abs/2407.06581), report failures on simple spatial tasks such as intersections and overlapping primitives. This study concerns earlier models and synthetic tasks; its numerical results do not measure our current evaluator. It supports a precaution: retain scripted occupancy/connectivity checks and ask the visual reviewer for source correspondence and readability. Neither a technical pass nor a fluent visual description establishes the other.

**Interaction logs should expose observable failures while keeping routine context compact.** Anthropic's [Writing effective tools for agents](https://www.anthropic.com/research/writing-tools-for-agents) recommends reviewing transcripts/tool behavior, examining redundant calls, and returning relevant concise information. Application: log assignments, returned findings, checks and decisions with evidence links. Do not rely exclusively on an agent's retrospective summary. This new log is a decision record, not an automatic complete tool transcript or token meter. More tracing infrastructure is not required for the next experiment.

## Local diagnostic

The existing accepted reference-detail sample, `output/autonomous-2026-10-26/reference-calibration/calibration-sampled.png`, is 360 × 280 pixels. Reading its four-pixel grid centers and applying eight-neighbor adjacency gives 4,827 occupied centers in one component (largest fraction 1.0). The recorded protocol and image hash are in the original calibration receipt.

This checks the existing exported sample at one origin. It does not establish sixteen-phase robustness, full-crest connectivity, minimum branch width or artistic acceptance. Cropping can itself sever connections that exist outside a region. The result provides no reason to weaken the production connectivity gate, nor proves that gate represents every source fragment correctly.

## Concrete source-control study

After inspecting the unchanged Met scan, a source-only crop was prepared at `[300,105,110,90]` in the normalized 1000 × 672 frame: [branch-control-source-study.svg](geometry/branch-control-source-study.svg). It embeds the original scan without changing its bytes and displays at four pixels per reference unit. It is not a trace, mask or accepted positive control.

The crop includes branching foam against dark water, together with internal ink marks and some pale specks. Its parent foam crosses the crop boundary. Compared with the rejected three-loop fringe approximation, it provides a direct source view rather than another independently invented silhouette. No precise landmark coordinates or semantic boundaries have yet been certified.

Before generating another crest variant:

1. Identify one complete local branching group within this context, with a documented root cut where it joins foam outside the crop. Mark the shared root, two unequal primary paths, secondary attachment, turning tip and principal black opening. Exclude detached specks from that group's identity.
2. Inspect an editable contour overlay on the actual source. Distinguish water, internal ink and pale foam. Do not select the surrounding pale region by global brightness. If the boundaries do not correspond, reject the authored control before procedural generation.
3. Sample that same control at the intended foreground scale using the unchanged dot pitch. Inspect native output, with an enlarged view only as a diagnostic. Record world/reference scale and any clipped connections. The current large accepted interior sample does not transfer acceptance to this group or smaller middle waves.
4. Calibrate the reviewer with the source-supported control and a derived negative example missing a specified child or opening. Keep the source unchanged. Require evidence tied to the annotation; investigate inconsistent or order-sensitive judgments before trusting marginal preferences.
5. Compare retained candidate 12 and archived 13 against the same named criterion. An extra curl or a preference without a recognizable shared-root hierarchy does not complete the milestone. Preserve the six fixtures and all phase/probe coverage.

## Source-anatomy review and change of hypothesis

A bounded fresh-context `wave_researcher` reviewed the wide crop and rejected it as a confirmed single-group positive control: curls interleave and several parent connections cross the frame. It proposed `[320,115,60,55]` as a candidate detail view. The lead inspected that [second source view](geometry/branch-control-detail-study.svg) against the wider context. Pale connections still leave the frame and the prescribed parent/primary/secondary assignments remain insufficiently supported. Neither crop is accepted as the requested annotated control.

This does not prove that the print lacks that branching pattern. It shows that our interpretation has not established it. Counting a fixed number of children before distinguishing pale foam, dark water and internal ink risks optimizing toward another invented motif. A local network's parent orientation is also not automatically determined by the image's top-to-bottom direction.

Two selection studies did not meet the stated control criterion. Stop further nearby crop tweaks under the same assumption. The next discriminating task is semantic annotation over restored source context: mark foam regions, water coves, internal ink and boundary cuts first, then describe only the branch relationships actually supported. Do not weaken fixed production tests or relabel water as foam to manufacture that control.

The protocol above remains a proposal conditional on source-supported landmarks. Its two-primary/secondary inventory is a hypothesis to verify, not ground truth or a required pattern for every ocean wave.

## Next decision and rejection rule

The next research milestone is an inspected semantic annotation and contour overlay in sufficient source context, followed by a supported branch inventory and recorded native scale. It is not another whole-ocean rewrite. If the source-supported structure cannot survive at that scale, revisit the detail scale or simplify the distant vocabulary explicitly. If it survives but generated geometry does not, change the generator's construction. This separates an interpretation error, a sampling limit and a representation failure.

Two edits that repeat the same failure without the declared gain end that hypothesis. Do not reset the counter merely because control points or the number of curls changed. All acceptance here remains separate from the user's final artistic approval.

Progress and interactions are recorded in [the log](agent-iteration-log.md). Exact per-agent token use remains unknown.

## Results of the semantic and scale studies

The sparse [semantic annotation](geometry/source-semantic-annotations-v1.json) now distinguishes supported foam, water, internal ink, paper and an uncertain junction. Independent review supports those local labels, without certifying a whole branching tree. The bounded [water-interface control](geometry/reference-water-interface-v1.json) excludes paper and records artificial parent cuts explicitly. Its simplified primitive follows the source contour rather than a prescribed child count.

The corrected [scale study](output/autonomous-2026-10-26/source-interface-v1-padded/review.json) supports the local curve and hollow at authoring scale. Detail is lost at estimated foreground and middle scales. Those scale estimates are not semantic registration to production geometry. This resolves the immediate interpretation question but exposes a display-allocation limit.

Two production integrations failed cheaply before independent artistic review: candidate14 enclosed a principal water cove; candidate15 preserved the coves but detached a single dot in two of 96 offsets. Neither was promoted. A frozen candidate15 density experiment exactly reproduced the original six PNGs and 96 phase records before testing a finer grid. The finer grid resolved the measured topology failures, but at one raster pixel per world unit its antialiased dots became a dim field. It remains an unqualified research alternative; production dot pitch is unchanged.

Candidate16 instead gives already-selected foreground curls 1.7 times their former width and height. Fixed topology and full scene checks pass. Matched native compositions and an independent review determine whether the extra area produces readable source detail or merely larger repetitive caps. Enlargement is a hypothesis, not evidence of improved art.

These trials support retaining exact-baseline reproduction, semantic source controls and cheap rejection before costly visual review. They do not establish token savings: account allowance is shared and per-agent token measurements are unavailable. The next implementation decision must follow visible gain and composition evidence, not the number of passing checks.
