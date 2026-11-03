# First ocean implementation

**Date:** 2026-10-11  
**Status:** Working end-to-end prototype; visual fidelity and production readiness remain unapproved.

**Validation update, 2026-10-11:** The new [three-stage validation loop](validation-loop.md) was executed. Expected output passes; original form and visual quality need work. [The report](validation-report.md) prioritizes a reference-faithful cap and finger network before further sampling or composition tuning.

## Delivered behavior

The [fullscreen artwork](../index.html) creates a continuous horizontal ocean with three wave construction families. Foam is represented by drawn white dots at the two-column, four-row Braille positions. Water and sky stay black. It uses no image-generation model, fluid solver, font rendering, or external JavaScript dependency.

Automatic travel starts at one viewport width per 90 seconds. Pause/play, keyboard arrows, scrolling, dragging, and discrete left/right controls are available. Manual exploration pauses automatic travel; Play resumes it. Home returns to the starting view. New ocean generates a new seed and records it in the URL. Reduced motion starts paused; hidden pages stop camera advancement, and the controls dialog pauses travel temporarily.

## Generator and scene planning

- **Curl:** A rising foam cap turns into a descending overhang, with unequal hooked tendrils, smaller attached branches, protected negative channels, and localized spray.
- **Breaker:** A lower crest supports falling, branching foam with different height, thickness, and attachment rules.
- **Band:** A shallow contour-following foam ribbon with smaller attached scallops provides supporting and distant structure.

The planner creates three depth ranges. A smoothly varying regional field changes activity and foreground frequency. Group centers, feature offsets, dimensions, depth, family choices, and branch structures use stable independent seeds. Neighbor comparisons suppress crowded candidates consistently across region boundaries. Distant regions contain more bands; large curls occur more often in the foreground.

World regions are 960 units wide. Rendering tiles are separately sized at 512 units; a feature can overlap several tiles and belongs to one world region. Queries use conservative full bounds, including spray and water silhouettes. Regions and feature bounds do not depend on camera exploration order.

## Rendering

Geometry is independently authored in `src/geometry.mjs`, separate from the planner and the Canvas renderer. The original museum scan remains unchanged. These generated shapes are interpretations, not a completed trace of Hokusai's contours.

Each feature is rasterized in a fixed local frame on the shared four-unit world dot grid. The renderer composites those sprites in stable depth order; black water covers white foam behind it. It samples the composited result and draws white circles at selected dot positions. Each logical Braille cell contains two columns and four rows. Dot diameter is 2.3 world units; apparent size depends on viewport height.

The camera translates cached dot tiles smoothly. Raster detail uses one of two resolution buckets according to viewport scale and pixel ratio; changing buckets regenerates the raster, not the world geometry. Tiles and feature sprites outside the current viewport neighborhood are evicted. The app does not retain the entire explored world.

## Verification

### Model checks

`node --test tests/*.test.mjs` passes five tests covering:

- Query-order independence and matching feature sets across adjacent intervals, including negative positions and four seeds.
- Finite geometry, conservative bounds, and deterministic construction across many regions.
- Presence of all three families and unequal foreground intervals across a wide region.
- Reduced-motion initialization and explicit playback.
- Manual pause and hidden-time behavior without catch-up jumps.

### Browser checks

Use [renderer checks](ocean-checks.html), [desktop layout checks](desktop-layout.html), and [the composition contact sheet](ocean-composition.html). Saved results are in `output/ocean-browser-results.json` and `output/ocean-ui-results.json`.

- Nine independent-versus-combined tile comparisons across three seeds pass with zero differing dots.
- Foreground black water hides all tested background foam samples in the occlusion fixture.
- Across 80 forward/reverse travel positions, retained cache counts stay bounded; returning to an evicted region reproduces its dot samples.
- Switching raster buckets preserves sampled geometry.
- Manual travel changes camera position; Home returns to exactly zero. The controls dialog freezes camera movement, and new seeds match the URL.
- Explicit iframe viewports measure 1280 × 720, 1920 × 1080, and 960 × 600 CSS pixels. The artwork fits each frame without document overflow and preserves camera position through resize. These are desktop layout checks, not different physical displays.
- The composition sheet covers ten consecutive 1536-unit views and three seeds. For seed 721, the 15,360-unit region intersects 19 curls, 34 breakers, and 62 bands, counting each shared feature once. Counts establish generated variety, not artistic acceptance.

The browser performance study samples 120 frames using a canvas matched to the browser viewport. Exact timings and dimensions are saved with the browser identification. Results are from one local Chrome-based desktop browser at DPR 2; they do not establish other browser engines, physical DPR 1 displays, long-duration process-memory behavior, or a universal frame-rate guarantee. Retained-cache counts are not measured process memory.

## Remaining work

1. Review the generated foam against the canonical print at actual display size. Branches, scallops, and hollows remain simplified; no full-crest reference mask has been accepted.
2. Refine the family vocabulary and scene balance. Some views still group similar crests; investigate their visual repetition using the ten-view sheet rather than relying on seed counts.
3. Establish minimum readable root and hollow sizes, accepted dot density, and final travel speed.
4. Verify the selected desktop browser engines, OS reduced-motion changes, display-density changes, and sustained memory/frame behavior on representative hardware.

The prototype is ready for visual review. These remaining gaps should guide the next iteration rather than be treated as already solved by the mechanical checks.


## Crest iteration — 2026-10-11

The curl now uses `src/crest.mjs`: an editable broad cap, closed asymmetric lobes, and cap-only negative channels before finger union. The shared production `drawFoam` helper also draws validation comparisons. Breaker, band, scene placement, and travel rules remain unchanged. Six model tests and the browser contract pass; original form and overall quality still need work. See [the current validation report](validation-report.md) for captured evidence and remaining failures.
