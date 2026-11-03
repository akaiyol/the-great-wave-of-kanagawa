# Shan Shui: code review

Reviewed 2026-10-07 for an endlessly scrolling Braille Great Wave field.

## Source and scope

Original: [LingDong-/shan-shui-inf](https://github.com/LingDong-/shan-shui-inf).
Reviewed commit: `9f754d2b2e73495db7883d4d4055a7b0903b0454`.
The local `vendor/shan-shui-inf/index.html` is an unmodified, checksum-verified snapshot; `LICENSE` is retained alongside it. SHA-256: `858792db2659e7d4c6604606d4ff2175f137f07061f8af51644f06ab0788215f`.

The application is a self-contained HTML file with inline JavaScript, generated SVG scenery, and a generated Canvas paper texture. No external script imports were found. It creates static scenery and moves the view through it. There is no fluid solver, learned model, or temporal evolution of mountains/water.

## Important mechanisms

| Component | Local source lines | What matters for the wave project |
|---|---:|---|
| `Prng`, query seed | 1–86 | A seeded sequence makes a generated scene reproducible. It replaces global `Math.random`, so all components share one stream. Keep reproducibility, but use independent seeds per world region and feature. |
| `Noise` | 88–204 | Four octaves by default, halving amplitude, cosine interpolation of a pseudorandom table. Smooth correlated variation makes nearby parts related. Use it to perturb established foam geometry, not to discover the crest shape. |
| `PolyTools` | 206–383 | Polygon subdivision/ear selection and triangle refinement support irregular shaded surfaces. Not necessary for the first binary foam renderer; Canvas/SVG paths can rasterize closed regions directly. |
| `bezmh`, `poly` | 445–510 | Weighted quadratic curve segments smooth control points; `poly` turns point arrays into SVG strings. Separate geometry from output so the same shape can be inspected as a vector mask and sampled into Braille. |
| `stroke` | 516–576 | Builds two offset boundaries around a centerline. Width varies along the line and with noise; the boundaries are joined into a filled ribbon. This is more relevant than the mountain height formula: a crest or foam tendril needs width, taper, and connected roots. |
| `blob`, `loopNoise` | 404–415, 578–625 | Makes closed organic marks; `loopNoise` removes the endpoint mismatch before normalizing a noise loop. Good for bounded droplets or holes after their placement is constrained. A blob generator alone will not produce coherent foam. |
| `texture` | 650–741 | Interpolates paths between neighboring surface contour rows, then adds localized perturbations. The marks follow the object instead of being scattered uniformly over the image. Transfer this idea to foam bands and black channels. |
| Tree family | 743–1725 | Trunks branch into smaller structures, with eight different construction recipes. `tree06` inserts child branch contours into the parent contour; `tree08` recursively branches strokes. Useful structural precedent for crest fingers at several scales, but a literal tree-to-wave substitution would retain the wrong silhouette. |
| `Mount.mountain` | 1804–2081 | Ten rows of fifty points: a cosine envelope multiplied by noise, scaled and offset into nested contours. Large shape is specified first; smaller variation comes later. |
| `vegetate` | 1838 onward | Separates candidate placement, local growth rules, and a second neighborhood check. Transfer this to foam: candidate roots on a crest, limits on spacing/width/direction, then reject collisions that close important black hollows. |
| Flat/distant mountains, rocks | 2083–2523 | Different object classes use different silhouettes and texture strategies. Distant mountains use triangulated, noise-shaded regions. A wave field similarly needs foreground, secondary and distant families, not one resized stamp. |
| `Arch`, `Man` | 2525–3665 | Buildings combine reusable geometry; people use a joint hierarchy, angle accumulation, local-to-world transforms, and curve-expanded clothing. The useful lesson is connected components and local coordinate systems. These motifs themselves are out of scope. |
| `water` | 3667–3704 | Small static sine/noise ripples. It cannot provide Hokusai's overhanging crest, claw-like foam, or breaking behavior. |
| `mountplanner` | 3706–3815 | Places scenery from noise maxima and spacing rules; `planmtx` tracks occupied terrain. This controls composition before detailed rendering. For waves, plan crest height, spacing and open-water intervals before adding texture. |
| `MEM`, chunk functions | 3817–3986 | Extends the world in 512-unit regions, caches generated SVG objects, orders them by vertical position and selects nearby content for display. Transfer generation-ahead and occlusion, but replace the unbounded cache and anchor-only culling. |
| UI and background | 3990–end | `viewBox` controls the camera; white object fills occlude earlier objects, while multiply blending integrates ink into generated paper. For Braille, invisible black water bodies must still occlude distant foam. The paper texture must be omitted. |

Pinned source: [index.html](https://github.com/LingDong-/shan-shui-inf/blob/9f754d2b2e73495db7883d4d4055a7b0903b0454/index.html). Line references refer to the saved snapshot, not a reformatted web extraction.

## Most interesting transferable idea

The image's structure comes from a hierarchy of explicit rules: composition → object silhouette → internal contour network → attached details → rendering. Noise adds variation inside this structure. It does not replace the structure.

For our project, that hierarchy becomes: wave-field layout → overhanging water silhouette → connected foam cap → attached uneven fingers and black channels → sparse detached spray → Braille sampling. Water geometry remains useful even when its visible color is black.

## Details to change rather than copy

- **Randomness is globally coupled.** Adding a random detail changes later draws; exploration order can affect what is generated. Also, squaring roughly trillion-scale PRNG state exceeds JavaScript's exact integer range. Use a small explicit 32-bit generator with seeds derived from world-region and feature IDs; do not overwrite global `Math.random`.
- **Stored world size grows.** `chunkrender` filters visible objects but never evicts `MEM.chunks`; `planmtx` also retains explored coverage. An infinite visual must have bounded working memory and deterministic regeneration of evicted regions.
- **The fast camera path is disabled.** `needupdate()` immediately returns `true`. `xcroll()` therefore calls `update()`, which replaces `BG.innerHTML` with a fresh SVG. Keep visible cached tiles and translate them each animation frame instead.
- **Autoscroll is stepped.** `autoxcroll()` schedules a jump every 2,000 ms. `present()` separately scrolls the document with 1 ms timers until its stop condition. Neither is a timestamp-based smooth camera loop.
- **Occlusion is not optional.** White mountain fills hide older geometry. Converting all fills to transparent would expose unwanted background detail. The wave equivalent is a black silhouette that hides more distant white foam.
- **Invalid geometry is hidden.** `chunkloader` replaces `NaN` text with `-1000`; that masks bad geometry rather than correcting it. Validate finite coordinates and reject malformed paths.
- **Some geometry is heuristic.** Angle averaging in `stroke`, slope-based line intersection, and forced-convex triangulation are not robust general geometry tools. Use supported path rasterization for the first study.
- **Provenance needs component-level attention if copying.** The root license is [MIT](https://github.com/LingDong-/shan-shui-inf/blob/9f754d2b2e73495db7883d4d4055a7b0903b0454/LICENSE), but the embedded noise code credits p5.js, whose published [license is LGPL 2.1](https://p5js.org/copyright/). This review does not resolve the exact historical snippet's licensing. The new feasibility renderer is independently written and does not copy that code.

## Executed upstream test

`tests/upstream-test.cjs` executes the downloaded generation functions in an isolated Node VM with a fixed seed (`721`), a 1,200-unit view, and nine camera positions from 0 to 8,192. It omits browser DOM parsing, layout, painting and the UI startup/paper generation.

- Two fresh contexts with the same seed produced identical initial SVG hashes.
- Retained objects grew from **113 to 315**.
- Retained SVG strings grew from **13,869,103 to 37,674,355 characters**. These are string lengths, not measured heap bytes.
- Generation/selection took about **2.85 s** initially and **48–1,176 ms** at subsequent sampled positions in this VM run. These measurements are not the demo's browser frame rate, and are not directly comparable with the much simpler new shape test.

Evidence: `output/upstream-results.json`. This confirms the storage-growth concern and supports reusing the method rather than porting the entire implementation.
