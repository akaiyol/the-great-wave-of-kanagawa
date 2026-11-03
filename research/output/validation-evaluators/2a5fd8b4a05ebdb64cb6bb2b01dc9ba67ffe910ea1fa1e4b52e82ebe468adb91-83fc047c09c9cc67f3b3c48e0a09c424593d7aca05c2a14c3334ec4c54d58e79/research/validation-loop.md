# Ocean validation loop

**Created:** 2026-10-11  
**Order:** Expected output → original form → visual quality.  
**Interface:** [Validation workspace](validation.html).

## Run the loop

1. Run `node scripts/validate.mjs` from the repository root. This executes model tests and writes a receipt for the current app source and pinned reference.
2. Serve the repository locally and open `research/validation.html`. Choose **Run validation**. The browser stage checks receipt freshness, reference integrity, rendering behavior, and thirty composition views.
3. Inspect the canonical crop beside raw generated foam and its sampled dots. Review the curl, breaker, and band families using the fixed seeds 721, 13891, and 0.
4. Review consecutive ocean views for perceived repetition, ocean continuity, hierarchy, and readability. Enter a reviewer identity, verdicts, and observed evidence.
5. Record the next art iteration and export the receipt. Change one substantive art issue, then repeat the same fixtures before adding new seeds.

The app fingerprint covers `index.html` and the source modules/styles. The runner copies those exact bytes into a fingerprint-named snapshot directory. Browser checks, form comparisons, and composition views dynamically import that versioned engine; they do not keep using generator modules from an earlier page session. Both the snapshot and current source must match the model receipt. The evaluator has its own fingerprint covering the runner, model tests, browser checks, fixture contract, rubric document, comparison page, and evaluator role instructions. Its modules load from an app/evaluator-versioned snapshot. Reviews are keyed by app, reference, evaluator, and observed render-protocol fingerprints (viewport, DPR, browser user agent, panel/gallery sizes, dot pitch); changed inputs reset saved verdicts. If evaluation inputs change while the page is open, regenerate the model receipt and reload the page. An incomplete run clears the current receipt instead of displaying a stale result. The canonical image is checked against the independently stored [reference manifest](../references/manifest.json); the validation runner cannot silently repin it.

The manifest pins the inspected project asset for subsequent integrity checks. It is not a historical re-download or an external authentication of the museum file.

## Stage 1: Expected output

Automatic checks cover:

- Current source matching the model-test receipt and the canonical image matching its pin.
- Model behavior, including deterministic world queries, finite geometry, bounds, camera state, and diagnostic connectivity.
- Independent tile rendering matching combined rendering across three seeds and negative/positive intervals.
- Foreground water occluding background foam.
- Regeneration after eviction and bounded retained tile/object neighborhoods over eighty travel positions.
- Dot centers matching authored mask samples, white-only visible dot pixels, and no dots in the declared upper 96-unit sky strip for the sampled tiles.
- All three construction families and nonempty output in ten consecutive views for each of three seeds.

The foam-mask check establishes that the renderer follows the authored geometry. It cannot establish that the authored geometry correctly represents Hokusai's foam. The sky-strip check is a specific test region, not a semantic proof for every pixel of every possible scene.

Model reduced-motion and hidden-time tests are not substitutes for OS preference switching or browser visibility integration checks. Cache counts are not measured process memory. The browser timing sample covers 120 frames in one local browser and does not establish universal performance.

## Stage 2: Original form

The unchanged Met scan is the visual authority. Its fixed composition, paper color, boats, and Fuji are not the target of a pixel-similarity score for the generated ocean. There is no approved full semantic foam mask against which to compute a meaningful segmentation score.

Review these properties independently:

| Criterion | Evidence required |
|---|---|
| Curl and overhang | The curl turns over into an open cavity; it is not merely a shallow surface ripple |
| Foam mass and asymmetry | The cap has varied area and thickness, with a reference-derived transition into the fingers rather than a uniform ribbon |
| Connected unequal fingers | Lobes and branches share roots, have unequal sizes and directions, and avoid becoming repeated geometric hooks |
| Black hollows | Unequal negative channels remain open and organize the foam network; they are not repeated loop-shaped holes |
| Taper and sampled detail | The same important roots, tips, and hollows remain readable before and after sampling at the actual output scale |

The comparison workspace fits each feature uniformly into its panel. It does not warp the generator into the reference crop or pretend that the crop is a segmented foam mask.

The diagnostics report branch-root widths relative to the four-unit dot pitch and occupied-grid connectivity. For ribbon families, root width is measured between the two edges at a branch's start. The new curl reports its explicitly authored lobe-mouth widths. Both are nominal widths, not the remaining attachment width after unions or carving. Widths below one or two pitches identify sampling risks; neither is an approved acceptance threshold. Connectivity uses eight-neighbor adjacency on occupied mask samples, excludes detached spray, and reports components with at least three samples. Its largest-component fraction includes all occupied foam samples. These measurements do not measure resemblance or beauty.

## Stage 3: Visual quality

| Criterion | Evidence required |
|---|---|
| Continuous ocean reading | Foam groupings and negative water space establish a coherent ocean rather than unrelated floating arches |
| Perceived variety | Structure and composition vary across consecutive views; distinct seeds or family counts alone are insufficient |
| Depth and hierarchy | Scale, overlap, and open intervals establish depth without a persistent stack of similar rows |
| Dot readability | The main forms are readable at intended desktop sizes; dots remain stable and do not obscure the form |

No quantitative beauty score or overall average is assigned. A pass requires an identified reviewer and evidence for every criterion. A **Needs work** verdict in form prevents an overall pass even when every technical check passes. Quality findings may still be recorded to guide the next iteration.

Codex may record a tool-assisted visual review when requested. Such a verdict is review evidence, not user approval of the final artistic direction.

## Evidence and review discipline

- Use the same seeds, world intervals, viewport sizes, and comparison protocol before and after an art change.
- Save raw-form, sampled-form, and composition captures. Record the app fingerprint with the report.
- Keep objective diagnostics separate from reviewer judgments. Preserve a technically sound renderer while changing failing geometry.
- Expand fixture coverage only after the failing representative cases improve; do not search for a flattering seed and discard the original failure.
- Revisit any previously accepted visual criterion affected by the change. If the review rubric changes, reassess its verdicts rather than carrying them forward as approval.

See [the current validation report](validation-report.md) for the executed result and prioritized art improvements.

## Autonomous workflow hardening — 2026-10-25

The six curl fixture identities and four channel probes per fixture are explicit in `tests/evaluation-contract.mjs`. Missing or duplicate fixtures, missing/nonfinite channels, incomplete offsets, and changed probe counts stop validation as incomplete. Structural redesign may change coverage, but requires a separately versioned coverage-contract revision and fresh baseline review. Successful coverage confirms evidence exists; it does not make an openness or visual-fidelity pass.

The project agent is described in [harness research](agent-harness-research.md) and [lead instructions](../agents/wave-completion.md). Independent reviewer instructions and human calibration improve review discipline; the UI does not authenticate reviewer identity or certify artistic acceptance. Capture hashes and focused scripted exports remain follow-up work.
