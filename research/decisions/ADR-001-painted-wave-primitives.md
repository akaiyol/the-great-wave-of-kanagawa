# ADR-001: Painted wave primitives in a deterministic ocean

**Status:** Superseded — 2026-10-30 user clarification requires generated geometry, not reusable completed wave images  
**Date:** 2026-10-30  
**Deciders:** Lead under delegated implementation authority; artistic acceptance remains the user's

## Context

The goal is a varied endlessly generated desktop ocean that immediately evokes the canonical Great Wave, with clouds. W019–W023 mixed a source-detailed crest with simplified authored surfaces. W024's warped color fields introduced magnification and mesh seams. W025 is a unified generated painted-surface prototype; it is not the reference and proves no procedural behavior.

## Decision

Test multiple transparent painted wave families as visual primitives. Keep seeded world planning, distinct regional groups, depth/occlusion, bounded caches and desktop travel in code. Always compare against the unchanged museum scan. Do not promote one panorama as endless generated scenery.

## Options considered

| Option | Complexity / observed outcome | Runtime / maintenance consequence |
|---|---|---|
| Hand-authored full color paths | Existing attempts repeatedly lacked coherent full-surface anatomy | Editable geometry, but continuing style work remains unproven |
| Warped source-color atlas | W024 visibly distorted features and exposed mesh seams | Detailed inputs; mapping correctness and scale remain costly to validate |
| Painted cutout families + seeded compositor | W025 fixed appearance passes; three alpha families pass actual composite checks; W030 quiet-world continuity fails | Finite asset vocabulary needs perceptual variety review; cache sprite images, preserve alpha |
| One scrolling panorama | Simple but violates structure/grouping variation requirement | Rejected as implementation of the goal |

Costs above are qualitative engineering trade-offs, not measured tokens, prices or performance.

## Consequences

Appearance and scene generation become separate responsibilities. Assets must preserve ivory foam, real transparent sky gaps and complete colored bodies; no pasted rectangles or truncated feet. Need structurally distinct families, quiet intervals and consecutive/held-out scene review. Source images remain immutable. Generated assets and prompts require explicit provenance. This is not a physical breaking-wave simulation.

## Action items

1. [x] Independently review W025's fixed visual feasibility.
2. [x] Validate one transparent main-wave primitive, then distinct breaker and low-swell families.
3. [x] Build a local seeded compositor with retained controls and reduced-motion behavior.
4. [x] Review variety, continuity, occlusion, resize/DPR and cache bounds before replacing legacy production.

## Validation checkpoint — W030

The compositor controls, deterministic return and desktop size checks pass. Adoption remains proposed: quiet intervals reveal a smooth-water mismatch, clipped banks and repeated stamps. W031 tests a continuous painted water foundation before promotion.

## Adoption — W035

W034 passes independent sampled composition review across ten consecutive views, two held-out scenes and two additional desktop layouts. W035 integrates the entry after control/DPR/deterministic-return checks; legacy Braille source is archived. User artistic acceptance, unrestricted procedural quality and deployment remain separate.

## Superseded by explicit generation requirement

The user rejected a standard-template approach. Randomly arranging a finite painted asset bank does not satisfy generated wave anatomy. Retain this implementation only as a visual/interaction checkpoint while replacing its visual generation model. Its sampled appearance checks do not establish procedural success. See ADR-002.
