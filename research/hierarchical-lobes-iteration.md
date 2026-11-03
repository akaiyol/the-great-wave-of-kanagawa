# Grouped crest iteration — 2026-10-12

Status: technical checks pass; original form needs work. Quality review remains pending behind the form gate. This is a draft, not user visual acceptance.

Source fingerprint: `89a016470f82c27d4b33ff8b30cb230a0abdc48e5ab58c5b6f6dbee866f3827f`.
Receipt: [reviewed results](output/validation-hierarchical-lobes.json).

## Change

The connected contour now has five uneven primary foam groups rather than thirteen narrow tongues. Larger groups support a shorter side branch and a curled primary tip. Wider coves provide space for black water between the groups. Seeded variation remains deterministic; the sampler and dot pitch are unchanged.

The first attempted nine-group revision increased mouth-probe failures and was discarded. The retained five-group construction improves channel survival, but the similar hooks and straight cove walls still resemble a regular fringe. It is reference-informed geometry, not a traced foam mask.

## Verification

- Seven model tests pass; canonical reference integrity passes.
- Browser expected-output checks pass, including nine seam comparisons with zero differing dots, occlusion, regeneration, retained cache bounds, and white-only output.
- Six fixed curl fixtures cover three seeds and foreground/middle layers, with sixteen grid offsets each: 96 phases.
- All 384 head probes and 384 mouth probes connect to exterior black water. The previous thirteen-group version tested 1152 probes of each type, with 126 head and 11 mouth failures. Channel count changed, so raw failure counts are not a like-for-like improvement measure.
- Five fixtures have at most one foam component of at least three samples; seed 721 foreground has two at some offsets. Largest-component fractions range from 99.76% to 99.94% at each fixture's worst offset. Tiny fragments remain included in those fractions. Connectivity is incomplete.
- Raw and sampled foreground panels for seeds 721 and 0 were inspected. [Seed 721](output/hierarchical-lobes-form.png), [seed 0](output/hierarchical-lobes-seed0.png).

Probe openness does not prove channel width, vector simplicity, connected branch roots, or resemblance to the original. The quality stage was not advanced past the failed original-form gate.

## Remaining art work

1. Replace repeated hook recipes with asymmetric groups derived more closely from the print's branching hierarchy; curve and vary the negative coves.
2. Locate and remove the remaining detached no-spray fragment without filling black hollows.
3. Inspect middle-layer branch detail at actual display scale before adding finer subdivisions.
4. After crest form passes, revise the breaker and foam-band families, then ocean composition and spacing.

The unchanged outer arch is still too smooth. More random variation or renderer tuning will not resolve that structural problem.
