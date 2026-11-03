# The ocean — after Hokusai

Direction updated 2026-10-28: a woodblock seascape following the original print, with background clouds. The running app remains the legacy Braille prototype until the rebuild lands.

Active: [woodblock plan](research/woodblock-plan.md), [agent workflow](agents/wave-completion.md), [checkpoint](research/agent-state.json). Commands and implementation descriptions below concern the legacy prototype.

## Current woodblock studies

- [Current registered-color still](research/woodblock/registered-still.html): complete static composition with source-derived crest, authored water and clouds; desktop rendering checked, full artistic acceptance pending.

- [First Canvas composition](research/woodblock-still.html): recognizable in informed independent review; foam anatomy and water contours remain unaccepted.
- [Source contour control](research/woodblock/crest-control.html): independently verified fixed color reconstruction, not procedural geometry or a semantic foam mask.
- [Action log](research/agent-iteration-log.md): findings, rejected approaches and next improvements.

The main `index.html` remains the legacy prototype while the new visual baseline is established.

## Run locally

No package installation or build step is required. From the repository root:

```sh
python3 -m http.server 4174 --bind 127.0.0.1
```

Open [the artwork](http://127.0.0.1:4174/). If that port is occupied, use another port. A static web host can serve the same files; this project has not been deployed.

## Controls

- Pause / Play or Space controls automatic travel.
- Arrow keys, scrolling, dragging, and the left/right buttons explore manually and pause travel.
- Home returns to the starting view.
- New ocean chooses a new seed and puts it in the URL for reproducibility.
- H or ? opens the controls. Reduced motion starts paused.

## Structure

- `src/scene.mjs`: seeded regional planning, distinct wave families, placement and depth.
- `src/geometry.mjs`: water silhouettes, connected foam ribbons and branches, negative channels, and spray.
- `src/render.mjs`: object-local masks, world-space sampling, drawn dots, and bounded tile/object caches.
- `src/camera.mjs`, `src/main.mjs`: camera state and desktop interaction.
- `references/`: unchanged canonical Met scan and provenance.
- `research/`: source review, visual calibration, implementation checks, and composition studies.

The implementation is independently authored. No Shan Shui code or external runtime dependency is included in the app. The downloaded upstream snapshot remains under `research/vendor/` for research only.

## Legacy verification

```sh
node --test tests/*.test.mjs
```

Open [renderer checks](http://127.0.0.1:4174/research/ocean-checks.html) and choose **Run checks**. Inspect [ten consecutive views](http://127.0.0.1:4174/research/ocean-composition.html) across several seeds.

For the full expected-output → original-form → quality loop, run `node scripts/validate.mjs`, then open [the validation workspace](http://127.0.0.1:4174/research/validation.html). See [the protocol](research/validation-loop.md) and [current findings](research/validation-report.md).

## Status

This is the first end-to-end visual prototype, not an approved reproduction or production release. Several construction families and a continuous scene planner are implemented. Their resemblance to Hokusai, the balance of wave groupings, and final dot density still need visual review. Current generated geometry is an interpretation; it is not a completed trace of the print.

See [implementation findings](research/ocean-implementation-notes.md) for verification results and remaining gaps, and [the plan](research/ocean-research-and-implementation-plan.md) for the agreed direction.
