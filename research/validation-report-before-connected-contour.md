# Crest improvement and validation

**Reviewed:** 2026-10-11. Codex, tool-assisted visual inspection; not user approval.  
**App fingerprint:** `488cc2ce1eee6334d0c2bc8695607983c34cbd7b79cb816bd3de38eaf9cd7586`  
**Receipt:** [Current result](output/validation-result.json). [Previous report](validation-report-before-crest.md).  
**Preview:** [Artwork](../index.html), [validation workspace](validation.html).

## Result

| Stage | Verdict |
|---|---|
| Expected output | Pass |
| Original form | Needs work |
| Visual quality | Needs work |

This iteration replaces the curl's narrow ribbon and repeated offset hooks with an editable broad foam cap, unequal closed Bézier lobes, and rounded cap channels. It is a reference-informed interpretation, not a literal trace or an approved semantic foam mask. The unchanged canonical scan remains the authority.

The source is [crest.mjs](../src/crest.mjs); [crest-construction.svg](geometry/crest-construction.svg) is an editable baseline export with separate water, foam-cap, and lobe groups. The foam sampler now carves cap channels before adding its lobes, using the same production helper in the comparison panels. Carving channels through the completed network severed neighboring branches in an intermediate experiment; that version was revised before this result.

## Verified behavior

- Six model tests pass, including deterministic queries, finite coordinates, and conservative geometry bounds.
- Nine seam comparisons have zero differing dots. Foreground water correctly occludes 1258 tested background dots, with zero errors.
- Eighty travel positions retain at most six tiles and 36 object sprites. Regeneration, raster-bucket consistency, white-only pixels, sampled dot centers, and the declared sky-strip checks pass.
- Thirty composition fixtures cover the original three seeds and all three families.
- Explicit desktop frames at 1280 × 720, 1920 × 1080, and 960 × 600 fit without document overflow and preserve the paused camera position. Evidence: [desktop checks](output/crest-desktop-checks.json), [desktop render](output/crest-desktop.png).

The timing run used a 749 × 930 CSS-pixel browser viewport, DPR 1.80. Its 120-frame p95 interval was 17.6 ms; tile creation p95 was 9.4 ms. The separate iframe checks establish desktop layout, not sustained performance at every size or across browser engines.

## Form comparison

| Fixed foreground curl | Roots below two dot pitches | Largest sampled component |
|---|---:|---:|
| Seed 721, `2:0:0` | 0/39 | 99.83% |
| Seed 13891, `2:2:0` | 0/30 | 100.00% |
| Seed 0, `2:4:0` | 0/32 | 100.00% |

For seed 721, the old construction had 30 of 41 roots below two pitches; the new construction has zero of 39. These are different constructions, and nominal mouth width is not proof of actual attachment. The largest-component fraction changes from about 99.95% to 99.83%, with two components of at least three samples now present. Width improved, but connectivity has not received an acceptance pass.

Inspect [seed 721](output/crest-721.png), [13891](output/crest-13891.png), and [0](output/crest-0.png) before/after-sampling captures. The broad foam mass and unequal lobe sizes are clearer. The upper ridge remains too smooth, several fingers are blunt, and lobe overlays close some channel mouths into isolated holes. Fine side branches still lose character after sampling.

Composition sheets for [721](output/crest-quality-721.png), [13891](output/crest-quality-13891.png), and [0](output/crest-quality-0.png) continue to show repeated foreground profiles, floating arches, and stacked depth ranges. The lower breaker and surface-band generators retain their previous geometry. The root prototype is updated; the vast-ocean composition is still unfinished.

## Next art work

1. Author the finger boundaries and channel mouths together. Preserve open elongated coves and shared roots, and break the smooth ridge into unequal foam clusters. Do not add more random detail to the current profile.
2. Check actual attachment and hollow survival across all sixteen offsets within the four-unit sampling pitch. Establish accepted minimum widths from these results; this phase study has not yet been run.
3. Once the curl passes raw and sampled review, replace the lower-breaker hooks and shallow foam bows with distinct reference-derived constructions.
4. Refine overlapping surface groupings and open-water intervals. Composition changes should follow accepted forms rather than compensate for their weaknesses.

The original-form gate remains failed. The next milestone is a crest whose cap, finger hierarchy, and open coves pass together; increasing the number of seeds or adjusting dot density cannot establish that result.
