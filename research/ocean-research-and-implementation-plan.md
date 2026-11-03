# Procedural Braille ocean: research and implementation plan

**Date:** 2026-10-11  
**Status:** The user authorized an end-to-end prototype on 2026-10-11. Prototype implementation is available at `../index.html`; visual acceptance and production verification remain open.
**Goal:** An endlessly scrolling, varied ocean inspired by Hokusai, with white foam rendered as Braille dots and water and sky represented by black negative space.

**Progress:** On 2026-10-11, the user selected a side-oblique viewpoint, drawn dots in the Braille layout, standalone viewport-filling artwork, slow automatic horizontal travel with pause and manual control, and desktop browsers only for the initial version. [Reference study and decision log](reference-study-notes.md) records these decisions, camera requirements, the interior foam calibration asset, and outstanding work. Full-crest reference fidelity remains unresolved.

**Implementation:** See [prototype findings](ocean-implementation-notes.md). Three construction families, a seeded scene planner, water occlusion, drawn-dot tiles, bounded caches, and desktop controls are implemented. This does not satisfy the visual approval gates below; those remain production acceptance criteria.

**Validation:** The [expected-output → original-form → quality loop](validation-loop.md) has been created and run. [Current results](validation-report.md): expected output passes; form and quality need work. The next art milestone is one reference-faithful crest with connected fingers and unequal hollows, checked before and after dot sampling.

## 1. Established direction and evidence

- The canonical visual reference is the unchanged [Met museum scan](../references/great-wave-off-kanagawa-met-DP130155.jpg). It governs the wave and foam vocabulary. The user's request for a vast ocean permits departure from the print's single fixed composition.
- Variation must change wave structure and scene composition. Repeating one large wave with different dimensions, spacing, or noise is insufficient.
- Scrolling reveals static generated scenery. Physical breaking and reforming of waves is outside the current scope.
- Shan Shui is the procedural reference: scene planning, distinct object generators, constrained shape variation, attached detail, and depth ordering. Its mountain geometry is not a wave generator.
- The existing prototype establishes basic Braille encoding, deterministic regeneration, bounded tile caching, and a passing seam comparison for the tested region. It does not establish accepted wave shapes, ocean variety, production performance, or mobile suitability.

Detailed source analysis and measurements remain in [Shan Shui code notes](shan-shui-code-notes.md) and [wave feasibility](wave-feasibility.md). This document defines the next work rather than duplicating those reports.

## 2. Decisions needed before production implementation

Record the selected value and supporting study beside each decision. Recommendations below remain proposals.

| Decision | Why it matters | Proposed direction / evidence needed |
|---|---|---|
| Procedural method | Determines the geometry model and authoring effort | Independently authored, reference-based curves and connected foam structures, organized into several wave families. Confirm after the variation study. |
| Viewpoint and depth | Determines scale, overlap, and what makes the scene feel vast | Side-oblique selected. Test foreground, middle distance, and distant waves. Establish whether a visible horizon is needed. |
| Wave vocabulary | Determines whether variety is structural | Define distinct construction rules for large curling crests, lower breaking crests, and distant foam bands. Final families and their frequency depend on visual review. |
| Direction and regional coherence | Independent random headings can make the ocean incoherent | Establish a prevailing wave direction, with gradual regional changes in size, spacing, and breaking intensity. Decide whether opposing crests belong in the vocabulary. |
| Foam coverage | Determines the balance of white dots and black water | Identify which connected caps, fingers, surface foam, and detached spray are retained. Do not classify pale paper or all pale water as foam. |
| Braille treatment | Controls detail survival and portability | Drawn dots in the eight-dot layout selected. Establish cell dimensions, dot diameter, spacing, and smallest readable structures. |
| Scroll interaction | Determines camera behavior and input requirements | Slow automatic horizontal travel with pause and manual control selected. Test exact speed, reverse travel, and behavior after manual input. Reduced motion starts paused. |
| Product placement and devices | Determines practical dimensions and resource budgets | Standalone viewport-filling artwork and desktop browsers only initially selected. Establish supported desktop browsers, smallest window size, and representative desktop hardware. Phone support is deferred. |
| Composition exclusions | Prevents unrelated scene elements becoming assumptions | Proposed initial scope is ocean and foam only. Confirm whether boats, Fuji, lettering, or other motifs should be excluded. |

These decisions can be resolved through the studies below. The initial study should present a recommended composition for review; production should not silently lock in unresolved interaction or rendering choices.

## 3. What to research and verify

### A. Reference geometry and foam identity

Inspect the canonical scan and annotate the crest envelope, shared finger roots, branching levels, black hollows, detached spray, and supporting foam. Separate foam geometry from the water body used for occlusion.

**Deliverable:** A clean, editable reference foam mask and separate water silhouette, shown beside the original and their Braille conversion at intended display sizes.

**Acceptance:** The outer curl and connected fingers remain readable; essential hollows remain open; sky and paper produce no dots. Review actual rendered output rather than enlarged vector paths alone. A faithful crest is a calibration asset, not the repeating unit of the ocean.

### B. Structural variation

Determine which relationships remain fixed and which can vary. Fixed relationships include connected finger roots and protected hollows. Variable relationships include crest reach, curvature, branching structure, finger spacing, foam-band width, and spray distribution.

Define parameter ranges in geometry and dot units. Establish minimum feature sizes experimentally at the selected Braille density. Noise may perturb accepted structures; it must not decide connectivity.

**Deliverable:** A contact sheet across multiple seeds and distinct wave families, with matching vector masks and Braille output. Include invalid or rejected cases and the rule responsible.

**Acceptance:** Families differ in silhouette and structure, not just scale or reflection. Variants retain a coherent foam cap and recognizable Hokusai-derived forms. Features remain readable after sampling. Visual review is required; parameter diversity alone is insufficient.

### C. Ocean composition

Study the scene planner independently from fine foam detail. Plan wave groups, depth, overlap, open-water intervals, and gradual regional changes before generating individual shapes. Avoid a fixed spacing grid or one dominant crest in every viewport.

Black water cannot communicate depth through color. Verify whether scale, occlusion, placement, and foam density provide enough depth cues without adding dots to dark water. Excessively sparse scenes may read as disconnected white marks; excessive overlap may merge into a white mass.

**Deliverable:** A wide static composition spanning at least ten intended viewport widths, reviewed both as an overview and as consecutive viewport crops. Use several seeds, including sparse and dense settings.

**Acceptance:** The scene reads as a continuous ocean; wave groupings and empty intervals vary; no obvious repeating cadence dominates; depth remains legible; cropping does not repeatedly remove the only recognizable crest. The user accepts the degree of variety and the ocean's visual character.

### D. Infinite generation and rendering

Verify region-independent seeds, stable feature ownership, and consistent neighbor queries. A feature belongs to one region but may overlap several rendering tiles. Each tile must include every feature whose full bounds intersect it, including foam, spray, and occluding water.

Bound maximum feature extent or provide a bounded spatial query so neighbor lookup and memory remain finite. Derive depth order from stable feature data, with a deterministic tie-breaker. Sampling must remain anchored to a shared world dot grid.

**Deliverable:** Expanded checks covering multiple seeds, region and tile boundaries, overlapping waves, forward/reverse exploration, cache eviction, and resize.

**Acceptance:** Independent tiles match a combined rendering at the cell level; exploration order does not change geometry; returning to evicted regions reproduces them; foreground water hides distant foam; memory plateaus for a fixed viewport during long travel. Existing prototype results must be rerun against the new geometry.

### E. Display and resource feasibility

Measure the selected drawn-dot treatment on target desktop browsers and representative desktop hardware. Check aspect ratio, smallest surviving fingers and hollows, device-pixel ratio, and window resize behavior. If density changes, regenerate from the same scene definition rather than stretching an old raster. Phone support and physical-phone measurements are deferred.

**Deliverable:** Representative captures and measurements for detailed scenes, including generation latency, frame intervals, stalls, cache size, and observed memory behavior during sustained scrolling.

**Acceptance:** Set desktop hardware and browser budgets before evaluating results. Target a 60 Hz camera where practical; a 60 Hz frame is approximately 16.7 ms, shared with other browser work. Tile generation must not cause recurring visible stalls. Confirm pause, reduced motion, hidden-tab behavior, keyboard and pointer/trackpad input, and an accessible description for the decorative dot artwork.

## 4. What to build before the production application

Keep these artifacts under `research/`. They are development studies, not production UI.

| Order | Artifact | Resolves | Dependency |
|---|---|---|---|
| 1 | Reference annotation and clean mask study | Foam identity, fidelity, and minimum readable detail | Canonical scan |
| 2 | Wave-family geometry study and contact sheet | Structural variety and viable parameter ranges | Reference vocabulary and provisional dot density |
| 3 | Wide ocean composition study | Viewpoint, regional variation, spacing, depth, and ocean continuity | Several viable wave families |
| 4 | Rendering and continuity stress study | Glyph/dot choice, seams, occlusion, regeneration, and device feasibility | Accepted candidate geometry and composition |
| 5 | Decision record and production specification | Final scope, interaction, display sizes, budgets, and acceptance criteria | Reviewed study results |

Use a rough layout study early if viewpoint is uncertain. Finish the precise foam assets only after confirming that the composition can convey the intended ocean. Do not spend time polishing the current repeated-wave prototype as the final visual direction.

## 5. Proposed production structure

After the studies pass, implement separate responsibilities:

1. **Scene planner:** World regions, wave groups, depth, open-water intervals, and correlated regional conditions.
2. **Wave generators:** Stable feature IDs and seeds; distinct family geometry; foam masks, water silhouettes, bounds, and rejection rules.
3. **Scene compositor:** Stable depth ordering, black-water occlusion, and feature selection by full bounds.
4. **Braille sampler and renderer:** Shared world grid, selected display metrics, local rasterization, and cached output.
5. **World cache and camera:** Generation ahead, bounded eviction, deterministic revisits, smooth movement, and resize handling.
6. **Application integration:** Agreed container, input, pause, reduced motion, and accessible description.

Keep geometry independent of the renderer so reference fidelity and composition can be inspected without Braille sampling. Avoid copying Shan Shui's globally coupled random stream, unbounded storage, or full SVG rebuilding during camera movement. If upstream code or a font is incorporated, verify that component's license and retain required notices; algorithmic inspiration alone does not require porting its implementation.

## 6. Production entry criteria

Production acceptance requires the following evidence. The authorized prototype may proceed while these checks remain open:

- [ ] The procedural approach, viewpoint, wave vocabulary, and composition scope are selected.
- [ ] The reference foam treatment is accepted at actual display resolution.
- [ ] Multiple wave families demonstrate structural variation without broken connectivity or collapsed hollows.
- [ ] The wide composition is accepted as a varied ocean, rather than a sequence of repeated large waves.
- [ ] The renderer, density, interaction, supported devices, and performance budgets are recorded.
- [ ] Detailed study geometry passes seam, occlusion, exploration-order, and regeneration checks.
- [ ] Representative device measurements support the selected rendering approach.

Start production with one complete vertical slice: planner → several wave families → compositor → Braille tiles → scrolling viewport. Verify it before adding more detail or integrating it into the final website.

**Immediate next milestone:** Review the fullscreen prototype and the ten-view composition study. Refine its foam branches and wave families against the original scan before treating the visuals as accepted.
