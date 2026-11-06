# P104 — Exposed-boundary rendering mechanism, not art rescue

P103 is archived unchanged. Test a materially different assembly premise on two simple overlapping procedural polygons: render all indigo under-strokes first, then all opaque ivory fills. Interior strokes should be covered by the union of fills while the outside contour remains visible. This changes rendering/assembly representation, not connector parameters or branch density. It cannot establish union topology, source anatomy or support validity.

Primary technical reference: SVG2 painting-order specification https://www.w3.org/TR/SVG2/painting.html#PaintOrder (access2026-11-06). Applying ordered passes across overlapping components is our inference to test, not an SVG claim of geometric boolean union. Do not port this to P103 or claim a fix.

Deliver one small three-panel SVG/HTML comparison: per-component stroke, all-strokes-then-all-fills, fills-only witness. Render and inspect overlap/exterior samples. Prediction: interior seams vanish only in ordered-pass panel while outer ink remains. Failure: seam remains, external stroke lost or transparency needed. Stop, no art build. Budget2500estimated incl125process reserve. ART protected by keeping all wave studies unchanged; SYSTEM gets a bounded falsifiable mechanism test before another representation change.
