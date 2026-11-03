# Connected contour experiment — 2026-10-12

Status: implemented draft; original form and quality remain unaccepted.

The new curl in `src/crest.mjs` couples the ridge, fingers, and open negative coves into one closed outline. The renderer no longer needs the special cap-only subtraction pass. Constraining cove depth against the outer ridge preserves an experimental eight-world-unit bridge; this is a construction constraint, not an accepted universal detail threshold.

`research/tests/crest-phase-checks.mjs` samples six fixed curl fixtures (foreground and middle layers, seeds 721, 13891, and 0) at all sixteen integer offsets in the four-unit dot pitch. White foam uses eight-neighbor connectivity; black water uses four-neighbor connectivity. Cove head and mouth probes must connect to exterior black space. The new model test verifies that water cannot escape through a diagonal-only opening.

Seven model tests pass. Browser contract results and phase diagnostics are saved separately in `output/validation-connected-contour-draft.json`; always inspect that file's source fingerprint before applying its results to current code. The prior accepted-as-technical-only receipt remains archived as `output/validation-before-connected-contour.json`.

The phase study reveals remaining closed or blocked cove probes and occasional extra sampled foam components. The constrained fingers also read as an overly regular fringe. A single contour is not proof of a simple, connected, reference-faithful shape. This experiment must not receive an original-form pass based on nominal root widths or renderer correctness.

Next: refine the reference-derived lobe hierarchy and resolve the failing cove probes together. Recheck the same six fixtures and offsets; retain the failed cases. Breaker, band, and ocean composition work remains outstanding.
