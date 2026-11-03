# The ocean — after Hokusai

Procedural wave research inspired by Shan, Shui’s rule-based construction and guided visually by Hokusai’s canonical Great Wave print.

## Active study

Open [the generated wave gallery](http://127.0.0.1:4187/research/woodblock/generated-gallery.html). **New waves** constructs fresh collections. Each wave has generated branch topology and profile geometry; no finished wave images enter this generator. Collection URLs, detail links and Back reproduce the geometry.

This is one curl family and an unfinished shape study. Foam, printed style, broader construction families and continuous ocean scenery still need work. The root index.html remains the earlier painted checkpoint and does not satisfy the procedural requirement.

## Run

From the repository root, run `python3 -m http.server 4187 --bind 127.0.0.1` and open the gallery link above. No build or package installation is required. Nothing has been deployed.

## Code and evidence

- src/procedural/rolled-front.mjs: shared flow, generated root/child graph, seeded profile field and qualified branch-spine ink.
- src/procedural/rolled-front.test.mjs: structural, deterministic, profile and ink checks; run `node --test src/procedural/rolled-front.test.mjs`.
- src/procedural/geometry.mjs: shared curve, ribbon and polygon operations.
- src/procedural/branch-patch.mjs and research/woodblock/branch-control.html: isolated centerline-grown fork control.
- src/procedural/integrated-crest.mjs and research/woodblock/integrated-crest.html: one-group attachment study across six seeds; `?seed=721&groups=2` opens the unaccepted two-group experiment.
- research/output/procedural-wave-2026-10-30/: exact source snapshots, captures and bounded results.
- research/agent-iteration-log.md and research/agent-state.json: decisions, failures and next action.
- research/decisions/ADR-002-generated-wave-geometry.md: active direction; painted-sprite ADR-001 is superseded.

Fifteen model/shared-geometry tests and seven gallery browser behavior groups pass. The browser run checked 24 different seed/base geometries without exact repeats; this is not an infinite or perceptual uniqueness guarantee. Independent review passed the local one-group attachment across six seeds. The two-group experiment remains unaccepted because its upper fork resembles a projecting prong. Main artwork is unchanged and no procedural artistic acceptance is established.

## Reference

references/great-wave-off-kanagawa-met-DP130155.jpg is the unchanged canonical Met JP1847 scan. Its pin remains in references/manifest.json. Source provenance and Shan, Shui links are in references/README.md. Historical painted assets and Braille studies remain evidence, not current generation inputs.
