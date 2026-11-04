# Woodblock rebuild

This plan serves the ART goal alongside the equally important SYSTEM goal. See [GOALS.md](../GOALS.md) for authoritative rendered acceptance guidance and [project-goals.json](project-goals.json) for its source. The lead owns both outcomes.

Direction selected 2026-10-28: original woodblock visual language with background clouds; no Braille. Preserve the canonical museum scan unchanged.

## Primary artistic success criterion

The image must immediately evoke Hokusai’s Great Wave through its overall appearance, without relying on a title, caption or explanation. Reference-specific curling silhouette, branching foam, water contours, palette and composition must work together; generic woodblock styling or blue waves are insufficient.

At each visual milestone, inspect the whole image at display scale before close-up detail. Record whether it clearly evokes the canonical reference and identify concrete supporting or conflicting features. A failure blocks artistic promotion even if individual details or technical checks pass. Independent review supports this judgment; recognition by actual users remains unverified unless observed.

## Retain

Camera and interaction behavior, seeded randomness, reference provenance, bounded-cache principles and deterministic travel. Verify reusable code before integration.

## Replace and remove

Replace foam-only geometry, black occlusion rendering and scattered-feature composition with complete water surfaces, colored paths, indigo contours, branching ivory foam and deliberate overlaps. Existing geometry is not artistically approved.

Remove dot sampling, pitch/phase-offset checks, white-only pixels, empty-sky assertions and sampled-fragment calibration from the new production path. Do not repair these gates for woodblock work. Existing app/tests remain legacy until replacement code lands; audit imports and entry points before removing each unused module. Avoid maintaining two production renderers.

Superseded agent instructions and checkpoint are in archive/braille-2026-10-28/. Historical evidence remains available but is not startup context. Do not carry old candidate IDs, backlog or artistic verdicts into the new milestone.

## Milestones

1. Still composition: one large curl, supporting water and smaller breaking forms, warm sky and pale clouds. Prototype layered vector paths in Canvas 2D. Establish silhouette, foam anatomy, contours and palette at actual display sizes before texture. No endless generator or elaborate harness rebuild before this visual baseline.
2. Wave vocabulary: distinct large curls, lower breakers and long swells with controlled variation and consistent line/color language.
3. Continuous scenery: connected water, depth, quiet intervals, varied wave groups and cloud spacing. Inspect consecutive views and held-out seeds.
4. Travel: reconnect controls and verify seams, deterministic regeneration, bounded caches, desktop resize/DPR, reduced motion and hidden-tab behavior.

Boats and Fuji remain undecided and do not block the first still. Independent review and technical passes do not imply user artistic acceptance.

## First local integration — 2026-10-30

W034 passes sampled independent visual review; W035 integrates the painted primitive compositor at index.html. Ten model tests and nine browser groups pass; all fourteen integrated captures match the reviewed prototype. Four wave constructions plus quiet water form the initial vocabulary. Legacy Braille runtime is archived. Actual OS-hidden-tab behavior, unrestricted procedural quality and user artistic acceptance remain unverified; deployment has not occurred. The original vector proposal was superseded by ADR-001 after rejected geometry/atlas trials.

## Generation correction — 2026-10-30

User rejects a standard template and repeated finished waves. ADR-002 supersedes the painted-primitive architecture. The current root app passes limited appearance/control checks but does not satisfy procedural construction. Retain camera, controls, reference and source-informed style findings; replace the sprite catalogue, periodic water material and fixed opening with generated wave anatomy. Start with a whole-wave seed set demonstrating topology variation before world integration.

## Current procedural checkpoint

Current decisions are in the linked phase under `agent-state.json`; `agent-brief.md` is the generated startup view. New iteration outcomes and required process reviews live in `phases/`, with scoped durable lessons in `agent-memory.json`. Historical action logs remain evidence rather than a second live outcome record.

The earlier painted app remains separate from the procedural study until the replacement meets visual criteria. Source appearance, broader construction families and continuous scenery are still required. See ADR-003 for the agent and logging architecture.
