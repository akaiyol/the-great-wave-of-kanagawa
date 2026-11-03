# ADR-002: Generate wave geometry, not painted stamps

**Status:** In progress — topology/profile gallery verified in bounded fixtures; source appearance and procedural world unaccepted
**Date:** 2026-10-30

## Requirement

Return to the generative construction principle in LingDong-/shan-shui-inf: construct objects from rules, then render them. Preserve the canonical Hokusai woodblock appearance, defined opaque contours, clouds and approved interaction behavior.

## Replace

The four finished wave sprites, tiled quiet-water material, fixed landing composition and random placement of completed images cannot be the final generator. Stop expanding this asset catalogue. Current local app remains a checkpoint, not a compliant implementation.

## Build

1. A world planner selects unequal wave groups, open-water intervals, depth and interactions before rendering.
2. Independent per-object random streams construct water profiles and topology: crest count, overhang, root positions, connected unequal foam branches, negative channels and contour networks. Noise perturbs constrained geometry; it does not substitute for anatomy.
3. Different construction rules produce materially different curl, spilling-breaker, grouped-breaker and low-swell structures. No single normalized silhouette with scale/color changes.
4. Internal ink bands follow each generated water surface. Paper texture may be reused; finished wave anatomy and water panoramas may not.
5. Deterministic regeneration reproduces the same object when revisiting its world location. Camera, pause, reduced motion, culling and bounded working memory remain.

## Uniqueness criteria

- Newly encountered objects must not reuse a completed shape or repeat a periodic water strip.
- Record normalized structural descriptors and geometry fingerprints in validation fixtures; exact duplicate geometry fails.
- Visually near-identical silhouettes or branch layouts also fail even when fingerprints differ.
- Verify consecutive views and held-out seeds against the source at display scale. Report the tested range; do not claim an untested infinite mathematical or perceptual uniqueness guarantee.
- Returning to an existing location is expected to reproduce it, not invent a new scene.

## First implementation gate

One source-informed whole-wave construction with demonstrably different topology across a small seed set, rendered opaquely in woodblock colors. Compare silhouette, connected foam, hollows and contour flow before reconnecting an endless world. Do not reuse the rejected smooth-ribbon substitute or add texture to conceal failed anatomy.

## Source

https://github.com/LingDong-/shan-shui-inf — local pinned source and component notes in research/shan-shui-code-notes.md. Study the composition/object/contour/detail hierarchy; do not port global randomness, unbounded caches or its mountain shapes as wave templates.

## Checkpoint W060

W059 provides interactive collections on W057: six rooted topology/profile samples, twelve model tests over primary/held-out/0–31 fixtures, seven browser behavior groups and24exactly distinct checked geometry samples. This is one curl family, not unrestricted/perceptual uniqueness. W060 is a separate centerline-grown fork control, independently retained for one-group integration; not a whole crest. Source appearance remains unfinished.
