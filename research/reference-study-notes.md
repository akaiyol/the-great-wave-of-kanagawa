# Reference study and decision log

**Date:** 2026-10-11  
**Status:** Reference analysis in progress. No clean mask or generated wave family is accepted yet.

**Implementation update:** The user authorized an end-to-end prototype on 2026-10-11. [Implementation findings](ocean-implementation-notes.md) and [the fullscreen app](../index.html) record the new work. The reference-fidelity findings and visual acceptance gaps below still apply.

## Selected direction

The user selected:

- A side-oblique viewpoint following the print's curling wave profiles.
- Drawn dots in the eight-dot Braille layout; Unicode remains a research comparison only.
- Standalone artwork filling the viewport.
- Slow automatic horizontal travel, with pause and manual control.
- Desktop browsers only for the initial version.

Preserve that viewpoint while exploring foreground, middle-distance, and distant structures. A visible horizon, exact travel speed, supported desktop browser versions, and rendering budgets remain undecided. Phone support is deferred.

### Camera and interaction requirements

- Use a viewport-filling artwork surface with a small accessible control area. Avoid document overflow that produces a second, unrelated scrolling surface.
- Advance the camera using elapsed time; wave geometry remains static. Generate scenery ahead of travel and preserve it when reversing direction.
- Provide an explicit pause/play control and manual horizontal exploration through keyboard, pointer/trackpad, and touch.
- Start paused when reduced motion is requested. Manual exploration remains available; automatic movement requires an explicit play action in that case.
- Freeze advancement while the page is hidden and resume without a camera jump.
- Keep camera position stable when pausing. Resize may change the visible extent and sampling density but must not randomize the world.

**Proposals to test in the scrolling study:** Pause automatic travel when manual exploration begins, and require Play to resume. Start speed evaluation at one viewport width per 90 seconds, with a 60–120-second comparison range. These are test settings, not approved final interaction details or speed.

The user requires a vast ocean with structural and compositional variety. A repeated large crest with altered dimensions is excluded as the production approach.

## Visual findings

The canonical [Met scan](../references/great-wave-off-kanagawa-met-DP130155.jpg) was inspected directly. The [interactive reference study](reference-study.html) marks three useful regions and shows reference crops, candidate masks, and their Braille sampling.

An editable [interior foam calibration fragment](geometry/reference-foam-interior.svg), with [source coordinates and geometry](geometry/reference-foam-interior.json), now retains the scan's internal branching channels. The fragment occupies reference coordinates x=270–360, y=90–160 in the normalized 1000 × 672 frame, inside the main cap. It was derived from the manually selected interior using luminance >184 at four samples per reference unit, then vectorized as horizontal filled runs. The original scan remains unchanged.

This is a useful sampling baseline because the crop is inside the foam cap rather than across the pale-sky boundary. It is not a complete semantic segmentation, an accepted full-crest trace, or a parameterized curve generator. Run-based vectorization preserves sampled contours but requires further contour authoring before it can support controlled procedural variation. It must not be tiled as the ocean's repeating motif.

| Structure | Observation | Requirement |
|---|---|---|
| Large crest | A broad connected foam mass turns into a dense, uneven network of fingers | Preserve the transition from cap to branching edge; do not replace it with regularly spaced teeth |
| Finger roots and hollows | Foam bridges and dark openings define the recognizable structure | Author positive foam and protected negative regions together |
| Lower breaking foam | Lower crests have different proportions and irregular groupings | Develop a separate construction rule rather than scaling the large crest |
| Surface bands | Supporting foam follows long water contours with intermittent scallops | Use connected contour-following bands with minimum sampled widths |
| Spray | Detached marks support the crest at a smaller scale | Add only after the connected foam geometry works |

## Rejected shortcuts

1. **Smooth cap with a few attached fingers.** The rendered comparison loses too much of the reference's branching hierarchy. Increasing Braille density cannot recover details absent from the geometry. The editable paths are retained as a negative control, not as the basis of production wave families.
2. **Brightness flood fill from foam seeds.** The crest selection visibly leaks into pale paper. Semantic foam seeds alone do not separate foam from sky where the image boundary is permeable. This reinforces the earlier threshold finding; do not continue tuning brightness as a substitute for an authored foam mask.

The study exposes both methods so the failure can be compared with the source. Neither result satisfies the plan's reference-fidelity gate. The lower and band fragments are also simplified drafts and have not been accepted.

## Next geometry work

- Trace a representative connected crest fragment, including its smaller branches and black hollows, using editable closed contours. Exclude pale sky explicitly.
- Author a separate water silhouette for occlusion. It must hide background foam without producing dots itself.
- Compare the contours with the source before sampling, then inspect at several actual display widths. Record the smallest surviving root width and hollow width in dot units.
- Establish which details may be simplified at smaller sizes without converting the crest into a smooth band.
- Only then develop distinct wave-family construction rules. This study does not yet establish procedural variety or ocean composition.

## Tool and verification scope

The study supports four reference regions, four column counts, Unicode glyphs and explicitly drawn Braille-layout dots, source overlays, editable SVG path data, local draft persistence, and export of geometry as SVG or JSON. Exports remain separate from the canonical image. The export controls apply to path geometry, not the rejected brightness selection.

Displayed panel width changes the apparent dot size; column count alone is not a production font-size decision. The explicit-dot renderer uses the same sampled occupancy as Unicode, so their visual difference can be reviewed without changing the geometry.

Browser checks and captures are recorded under `output/reference-study-*`. These are UI and sampling checks, not evidence of accepted mask fidelity, mobile hardware performance, or clean production geometry.

Region and density controls were exercised at 48 and 160 columns for the three broader fragments. Invalid JSON was rejected without replacing geometry. A narrow desktop viewport reported 433 × 938 CSS pixels despite a requested 390 × 844 override; document width was 433 with stacked comparison panels. That check does not represent a physical phone. The reference-derived interior fragment was inspected separately beside the source using the selected drawn-dot treatment.

## Remaining decisions

| Decision | State |
|---|---|
| Side-oblique viewpoint | Selected by user |
| Unicode characters versus drawn Braille-layout dots | Drawn dots selected by user |
| Reference foam contours and level of simplification | Requires a clean trace and visual review |
| Wave families, relative frequency, horizon, and regional conditions | Requires wave-family and ocean composition studies |
| Product placement | Standalone artwork filling the viewport, selected by user |
| Travel mode | Slow automatic horizontal travel with pause and manual control, selected by user |
| Exact speed and behavior after manual exploration | Proposed settings above; requires a scrolling study |
| Target device class | Desktop browsers only initially, selected by user |
| Desktop browsers, smallest window size, and budgets | Open; establish during desktop display verification |

### Initial desktop verification proposal

Use 1280 × 720 and 1920 × 1080 CSS-pixel viewports for the first visual comparisons, then resize the same scene to a narrower desktop window. These dimensions are study settings, not minimum supported dimensions. Check device-pixel ratios 1 and 2 where available. Identify the actual desktop hardware and browser versions in each measurement; browser availability and cross-browser results remain unverified.

Test keyboard and pointer/trackpad exploration, pause/play, reduced motion, hidden-tab behavior, window resize, deterministic return travel, and bounded memory. Physical-phone measurements and touch-specific acceptance checks are deferred until mobile support is requested.

See the [research and implementation plan](ocean-research-and-implementation-plan.md) for the full production entry criteria.

## 2026-10-26: anatomy and scale checks

The user accepted the existing interior fragment's drawn-dot translation as sufficient detail at 360 × 280 pixels. This is a positive detail reference, not acceptance of a full generated crest. The generated A/B comparison remains negative; B is closer. Labels and exact image hashes are catalogued in [evaluation calibration](evaluation-calibration.json).

The source contains large dark-water hollows and thin dark contour/ink marks within pale foam. Both become black negative space, but only the principal water coves are required to connect to exterior water; treating every interior ink mark as an open water channel would change the reference anatomy.

An approximate uniform fit of the 405 × 265 reference crop to current foam bounds yields this interior fragment at about 108 × 84 foreground pixels and 60 × 44 middle-layer pixels, versus the accepted 360 × 280 control. The fit includes conservative bounds/control points and is not a semantic alignment. Its renders show why the accepted large control cannot certify small-wave detail. The agent selected larger detailed foreground studies with simpler distant forms, preserving current dots. See [scale study](reference-scale-study.html).

### Fringe overlay review — 2026-10-26

The `reference-fringe-v2` authored approximation was rejected for production after direct source-overlay inspection. Its diagonal parent omits much of the source network; three dominant curls repeat a loop construction and do not align closely enough with printed boundaries. Keep it as a documented failed study, not a trace or procedural source motif. Evidence: `output/autonomous-2026-10-26/fringe-study-review.json` and `fringe-overlay.png`. The existing workbench now exposes this study and explicit sampling dimensions; native study pitch is five CSS pixels and is not the production four-world-unit grid.
