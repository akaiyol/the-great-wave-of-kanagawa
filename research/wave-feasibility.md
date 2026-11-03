# Braille Great Wave: feasibility and proposed direction

**Status:** Proposed; production approach and visual treatment await user selection.
**Completed:** 2026-10-11. Source review and initial experiments began 2026-10-07.
**Scope:** An endlessly scrolling field of Great Wave–inspired waves. White foam becomes Braille dots; sky and darker water remain black.

**Next-stage plan:** [Ocean research and implementation plan](ocean-research-and-implementation-plan.md) incorporates the clarified requirement for a vast, varied ocean and defines the decisions, studies, and verification required before production. Its milestones supersede the suggested sequence below.

**Later update, 2026-10-11:** The user selected drawn dots, desktop-only support, viewport-filling artwork, and slow automatic horizontal travel with manual control, then authorized the first end-to-end prototype. See [implementation findings](ocean-implementation-notes.md). The glyph-based measurements below remain historical feasibility evidence; they do not validate the new renderer.

## Assessment

The scrolling and Braille rendering are technically feasible with standard browser Canvas and JavaScript. The unresolved work is artistic: identifying the right foam shapes and constructing varied waves that retain Hokusai's connected crest, unequal fingers and open black hollows.

Shan Shui supplies useful procedural-art principles, especially its hierarchy of composition, silhouette, attached detail and rendering. Its water function draws static ripples and supplies no Great Wave geometry. Reusing its whole application would also bring unnecessary SVG string rebuilding and unbounded storage. See [the source review](shan-shui-code-notes.md).

## What was tested

The [interactive study](feasibility.html) contains three isolated experiments: brightness-based reference conversion, a coarse manually gated crest conversion, and a seeded scrolling field built from deliberately simple wave geometry. It uses actual Unicode Braille glyphs both in a text element and in cached Canvas tiles. The prototype is a technical test, not an accepted visual design.

| Check | Result | Evidence and limit |
|---|---|---|
| Braille bit mapping | All 256 patterns pass, including eight individual dot positions | Node and browser tests; encoding correctness does not validate font appearance |
| Reference segmentation | Brightness threshold incorrectly selects 99.997% of a manually selected sky rectangle | Confirms that pale paper must be excluded semantically; the coarse hand-marked region is not an exact foam trace |
| Adjacent tiles | Zero differing cells when two independent tiles are compared with one combined raster of the same region | Corrected desktop and narrow-browser runs; the test covers this specific pair, not every possible wave |
| Regeneration | Same wave regenerates identically | Browser repeat and Node cache eviction/revisit checks |
| Bounded storage | Node cache remains at five tiles over 2,001 positions | Browser cache peak was six tiles during the sampled desktop/narrow runs; working memory scales with viewport, not travel distance |
| Encoding cost | About 0.044, 0.106 and 0.237 ms per encode/string operation at 80×27, 160×54 and 240×81 cells | Node mean over 200 iterations after warmup; excludes geometry, layout and painting |
| Tile creation | Desktop median 2.7 ms, p95 3.3 ms; narrow-browser median 2.9 ms, p95 3.7 ms | 24 simple 120×40-cell tiles; more detailed production shapes will cost more |
| Camera rendering | Desktop median frame interval 16.7 ms, p95 17.2 ms | 120 frames; a maximum interval of 83.3 ms occurred, so this is not a sustained 60 fps guarantee |
| Narrow layout | No horizontal document overflow at measured width 433 CSS pixels | Desktop browser with a narrow viewport, not a physical phone; small dots lose detail |

Saved measurements: `output/core-results.json`, `output/browser-desktop.json`, `output/browser-narrow.json`. Browser results were refreshed on 2026-10-11 in the local Chrome-based in-app browser. The requested narrow viewport override was 390×844, but the browser reported 433×938 CSS pixels with DPR approximately 0.9; the report uses the actual measured dimensions.

The estimated six-tile RGBA storage is about 22 MiB for the prototype's 1200×800 cached images. This excludes temporary masks, backing-store duplication, browser overhead and GPU allocations; it is not a measured total-memory figure. Production should reduce raster tile dimensions and cache only the visible neighborhood.

## Technical findings

### Foam needs an explicit mask

The museum scan contains pale sky, aged paper and highlights as well as foam. A global light/dark conversion cannot distinguish their meanings. The hand-marked crest region demonstrates exclusion of most sky, but still contains imperfect boundaries and selected pale water. It is unsuitable as a production asset.

Build a clean reference-based foam mask first. Keep a separate water silhouette for occlusion: black foreground water must hide white foam from waves behind it even though the water itself remains visually black.

### Braille is a sampling grid

An eight-dot cell represents two columns and four rows. The tested mapping is:

```text
dot 1 / bit 0    dot 4 / bit 3
dot 2 / bit 1    dot 5 / bit 4
dot 3 / bit 2    dot 6 / bit 5
dot 7 / bit 6    dot 8 / bit 7
```

Pack the selected dots into an eight-bit value and add it to U+2800. Unicode's [Braille Patterns chart](https://www.unicode.org/charts/PDF/U2800.pdf) defines the characters. This is visual dot art, not a linguistic Braille transcription; provide an accessible text description instead of exposing thousands of characters to a screen reader.

The cell's displayed dimensions must be measured rather than assumed. In the tested fallback font at 14 px, a Braille glyph advances 9.57 px while ASCII M advances 8.43 px. A font that appears monospaced for ASCII can still use a different fallback for Braille. Choose and verify a distributable font before production; match cell spacing and mask aspect ratio to its actual metrics.

### Fix the grid to the world

Resampling a mask on a screen-fixed grid as the camera moves changes dot occupancy and causes crawling edges. Generate each object's mask in a fixed local frame, composite masks at integer positions on a shared world dot grid, then cache the resulting Braille tile. Move the cached tile smoothly with the camera.

The original tile tests differed by 8 cells; a direct shared-grid raster still differed by 19 cells because Canvas rasterization changed with translation/clipping. The final object-local raster and integer compositing produced zero differences in the tested comparison. This is why deterministic parameters alone were insufficient.

### Use explicit curves for the overhang

A single-valued height profile cannot represent an overhanging crest. For a static scrolling composition, closed Bézier paths or a connected ribbon network provide the required freedom without a fluid solver. Give fingers shared roots on the foam cap and preserve black channels between them. Use constrained variation in control points, widths and branching; free noise will not enforce these relationships.

Canvas supports [pixel readback](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/getImageData), so geometry can be sampled once per new tile rather than every frame. Use [timestamp-based animation frames](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame) for camera motion. The study starts paused and suspends camera advancement while hidden; the final experience should also respect reduced-motion preferences and support pause.

## Options considered

| Approach | Fidelity | Variation | Main cost | Assessment |
|---|---|---|---|---|
| Repeat a traced foam image | Strong match within the repeated image | Low | Obvious repetition and joins | Useful as a reference baseline |
| Reference-based connected curves with constrained procedural variation | Controllable; requires visual validation | High enough for a scrolling field | Authoring silhouettes, topology and composition rules | Recommended |
| Fluid simulation with derived foam | Physically motivated motion possible; matching a specific print remains difficult | High | Solver, surface reconstruction, foam coherence and performance | Outside the selected scrolling scope |

## Proposed decision

Use a reference-based procedural generator: author connected foam curves from the canonical print, then vary them within explicit shape and spacing constraints. Keep the renderer independent of the generator. Generate and cache tiles ahead of the camera, evict distant tiles, and regenerate them deterministically from region and feature seeds.

This preserves recognizable structure while allowing an expanding scene. The cost is deliberate shape authoring and rejection rules; merely changing the prototype's density or adding more random fingers will not achieve the desired result. The current synthetic cap looks like a generic curling band and repeats one basic silhouette. It has established rendering feasibility only.

## Suggested project sequence

1. **Reference fidelity study.** Trace a clean foam-only crest and nearby supporting foam directly from the museum scan. Show the vector mask beside its Braille rendering at desktop and narrow-screen sizes. Review the outer curl, connected finger roots, black hollows and smallest retained details before introducing generation.
2. **Controlled wave variation.** Parameterize the accepted geometry into a small family of connected crests and secondary waves. Vary proportions, finger levels, spacing and channels. Reject shapes that disconnect roots or close essential hollows. Establish minimum feature sizes in dot units.
3. **Scrolling composition.** Add foreground/background occlusion, uneven wave spacing and open-water intervals. Keep feature seeds independent, neighboring-region generation consistent, and the cache bounded. Verify multiple tile boundaries and regeneration after long travel and return.
4. **Production verification.** Inspect the chosen font and dot density on actual target devices; check frame stalls and memory over a longer run, reduced motion, pause, resize, and keyboard/touch input. Optimize only against measured problems.

The next decision is whether to proceed with the recommended reference-based procedural approach. Production implementation has not started.

## Reproduce

From the repository root:

```sh
node research/tests/core-test.mjs
node research/tests/upstream-test.cjs
python3 -m http.server 4174 --bind 127.0.0.1
```

Open `http://127.0.0.1:4174/research/feasibility.html` and select **Run browser checks**. The upstream test executes the saved snapshot's generation functions in a VM; its timings exclude the browser DOM and cannot be compared directly with production frame timings. All experiments remain isolated in `research/`.
