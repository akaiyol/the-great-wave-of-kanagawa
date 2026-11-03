# Ocean validation result and next art iteration

**Reviewed:** 2026-10-11  
**Reviewer:** Codex, tool-assisted visual inspection. These are review judgments, not user approval.  
**App fingerprint:** `143e344cc05ee07fff7be89bd90b54110932d195b3d9734539b009e16736299b`  
**Receipt:** [validation-result.json](output/validation-before-crest.json)  
**Workspace:** [Run or inspect the validation loop](validation.html).

## Result

| Stage | Verdict | Meaning |
|---|---|---|
| Expected output | Pass | The tested renderer, world generation, and camera models satisfy the current technical contract |
| Original form | Needs work | Generated foam still differs materially from the canonical crest and finger structure |
| Visual quality | Needs work | Composition varies, but repeated arches and layered rows weaken the intended vast-ocean reading |

**Overall:** Revise the original form before accepting the artwork. No overall score averages these stages together.

## What the executed checks establish

- Six model tests pass, including the occupied-grid diagnostic's connectivity definition.
- Nine independent-versus-combined tile comparisons produce zero differing dots.
- Foreground water hides 466 tested background foam samples with zero occlusion errors.
- Eighty sampled travel positions retain at most six tiles and 36 feature sprites; regeneration and raster-bucket invariance pass.
- The sampled dot centers match the authored mask; visible tile pixels are white; the tested upper sky strip contains no dots.
- Thirty consecutive-view fixtures across seeds 721, 13891, and 0 contain output and all three families.

At 1280 × 720 CSS pixels and DPR 2 in one local Chrome-based browser, the 120-frame sample records a median interval of 16.7 ms and p95 of 17.2 ms. Tile creation has a median of 2.9 ms and p95 of 5.9 ms. These are observations, not a universal frame-rate or sustained-memory guarantee.

The current canonical image matches its new integrity pin. The pin protects subsequent runs; it is not a historical authentication of the initial download.

## Original-form findings

See the [reference / raw form / sampled form comparison](output/validation-original-form.png).

| Criterion | Verdict | Observation |
|---|---|---|
| Basic curl and overhang | Pass | The curl turns downward into an open cavity; this is only a basic structural pass |
| Foam mass and asymmetry | Needs work | A narrow smooth ribbon replaces the reference's broader asymmetric cap and irregular foam mass |
| Connected unequal fingers | Needs work | Repeated hooked, angular, or loop-like ribbon branches replace the reference's unequal claw-like lobes and richer shared roots |
| Black hollows | Needs work | A dominant cavity and repetitive loop-shaped holes replace the reference's more varied elongated negative channels |
| Taper and sampled detail | Needs work | The large structure survives, but thin branches are vulnerable at the current dot pitch |

The central mismatch is visible in the **raw geometry before sampling**. Increasing resolution alone cannot create the missing foam mass, lobe shapes, or branching hierarchy.

Nine representative feature diagnostics were collected across the three families and three seeds. In curl `2:0:0`, seed 721, 30 of 41 branch roots are narrower than two dot pitches, including two narrower than one. In breaker `1:0:3`, seed 0, seven of eighteen are narrower than one pitch; its occupied grid contains three components with at least three samples, with 96.9% of occupied samples in the largest component.

These widths identify risk rather than proving that every narrow root disconnects. The large curl's principal component remains intact. Detached spray is excluded; small extra components may reflect sampling or fine texture. Minimum acceptable root and hollow widths still need a dedicated display study.

## Quality findings

The [seed 721](output/validation-quality-721.png), [seed 13891](output/validation-quality-13891.png), and [seed 0](output/validation-quality-0.png) sheets contain ten consecutive views each. These thumbnails support composition review; fine-dot readability is judged in the fullscreen output and isolated feature panels.

- **Ocean continuity — needs work.** Many forms appear as separate floating arches. Foam groupings and overlap need to communicate shared water planes while leaving the water black.
- **Perceived variety — needs work.** Sparse and dense arrangements do vary, but the arch envelope and repeated hook vocabulary persist. Distinct feature IDs and seeds do not establish sufficient artistic variety.
- **Depth and hierarchy — needs work.** Size and occlusion provide basic depth. Persistent placement ranges still often resemble stacked rows, and similar large curls sometimes align vertically.
- **Primary dot readability — pass.** Major silhouettes and individual dots are readable in the fullscreen prototype. Fine branch fidelity remains a separate failed criterion.

## Prioritized art work

### 1. Establish one reference-faithful crest

Author a clean editable foam cap together with its negative channels, rooted fingers, and separate water silhouette directly against the canonical scan. Preserve the cap's changing thickness and the transition from broad mass to dense, unequal lobes.

**Exit condition:** The raw mask and sampled output both retain the recognizable crest, shared roots, and open hollows at the chosen desktop display sizes. Review this single form before using it to generate more variants.

### 2. Replace the repeated hook construction

Use connected, tapered, unequal foam lobes with deliberately authored inner and outer contours. The current generic ribbon-and-hook recipe creates visibly repetitive loops and angular joins. Establish variable branching depth and orientation within the accepted reference vocabulary.

Measure root and hollow survival on the occupied grid, including different feature positions relative to the sampling grid. Turn the accepted minimum widths into generation constraints. Keep the fixed seed-0 breaker as a detail-loss regression fixture.

**Exit condition:** Seeded variants retain the accepted foam character and important connectivity without relying on dot sampling to hide poor raw contours.

### 3. Rebuild family distinctions and ocean composition

Develop the curling crest, lower breaking foam, and surface bands from distinct accepted forms. Supporting bands should follow plausible foam flow and uneven groupings rather than functioning as generic shallow bows.

Then refine clustering, overlapping planes, and open-water intervals. Reduce repeated stacks of similar arches while keeping a consistent side-oblique viewpoint and prevailing wave direction. Establish continuity using foam and occlusion; dark water must remain negative space.

**Exit condition:** The same thirty-view fixtures show recognizably different wave structures and a coherent ocean across sparse and dense regions. Both perceived variety and ocean continuity receive an evidence-based visual pass.

### 4. Tune the sampled treatment

After raw forms pass, review dot spacing, minimum feature sizes, and spray at actual desktop sizes. Use density changes to preserve accepted details. Keep the passing world generation, occlusion, and cache mechanisms stable unless a new measurement demonstrates a problem.

**Immediate next milestone:** One reference-faithful editable foam crest with its water silhouette and a before/after dot comparison. That is the highest-value art improvement supported by this validation run.
