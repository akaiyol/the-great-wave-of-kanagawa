# P126 — Detail depends on geometry at different levels

Source: Lingdong Huang, [{Shan, Shui}](https://github.com/LingDong-/shan-shui-inf/blob/9f754d2b2e73495db7883d4d4055a7b0903b0454/index.html), original pinned implementation (evergreen, not a current-release survey). Snapshot retrieved2026-10-07, inspected2026-11-09. Original publication date not established here. No upstream code copied into a renderer.

`tree06` passes generated branch edges into `barkify` (local lines1392–1399). For edge samples L_i,R_i and normalized lateral position p, its mark origin is N_i=(1-p)L_i+pR_i and its angle averages the two edge tangents (1115–1144). Bark length/loop/noise define a separate motif; width depends on p, not the actual edge separation. With p and random draws fixed, changing edges can move/rotate that motif without changing its intrinsic anatomy. This cannot by itself fix P125 repeated paired glyphs.

The separate `texture` function constructs each stroke point from corresponding contour-row samples before perturbation (653–721): Q_j=p E_floor(layer),j+(1-p)E_ceil(layer),j+noise_j. This pointwise dependence is stronger than transporting a complete glyph. It is a mechanism precedent, not a foam grammar or appearance result. The original averaging/interpolation is not a general robust geometry implementation.

## Exact transfer limit

P098 defines fixed hood/counter curves around I. Neither it nor the named parent edges defines corresponding surface intervals for the pair. The read-only researcher found no supported two-interval mapping; A-outer begins to the right of much of the pair, so assigning it by name is insufficient. Existing local placement is not edge correspondence.

A possible adaptation would place both related curves through one actual geometry-dependent surface map. That map is unresolved. No arbitrary interval assignment or toy branch test is substituted. The proposed actual-fork dependency test was **not run** because its correspondence prerequisite failed.

A future test must hold root pose, mark parameters and random draws fixed while changing only branch shape; point changes alone must be separated from rigid glyph transport. Even genuine deformation would establish dependence, not Hokusai-like anatomy or a convincing composition. No new renderer is approved.
