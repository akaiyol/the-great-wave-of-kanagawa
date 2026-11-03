# Project instructions

Repository: https://github.com/akaiyol/the-great-wave-of-kanagawa

## Canonical visual reference

- The source of truth for this project's visual work is Katsushika Hokusai's original woodblock print, *Under the Wave off Kanagawa*, also known as *The Great Wave*, ca. 1830–32.
- Use the unmodified museum scan at `references/great-wave-off-kanagawa-met-DP130155.jpg`. Inspect it before making visual design or rendering decisions.
- This scan depicts The Metropolitan Museum of Art's impression, accession JP1847. It is a reproduction of the original artwork, not a modern reinterpretation. Different surviving impressions can vary; this specific scan is the project's canonical reference.
- Follow the reference for composition, wave silhouette, curling crest, foam shapes, water contours, negative space, proportions, and palette unless the user explicitly requests a departure.
- Do not replace the reference with an AI-generated image, stylized recreation, or another impression. Keep the original asset unchanged; save derived assets separately.
- Source and procedural-generation research links are recorded in `references/README.md`.

## Woodblock direction — 2026-10-28

- The user replaced Braille art with the original print's woodblock visual language and requested background clouds. Braille instructions, sampling gates and past artistic verdicts are superseded.
- Primary artistic criterion: the artwork must immediately evoke the canonical Great Wave reference through its overall silhouette, foam anatomy, water contours, palette and composition. Generic woodblock styling or blue waves alone are insufficient. Assess the image without titles or explanatory copy; independent review is evidence, not proof of recognition by untested users.
- Build complete colored water bodies, curling silhouettes, branching ivory foam, indigo contours and flowing blue bands. Use the canonical scan for shape, palette, hierarchy and restrained pale clouds. Texture follows successful geometry; it cannot conceal weak forms.
- Retain the standalone desktop experience, side-oblique viewpoint, slow horizontal travel, pause/manual controls, reduced-motion support and deterministic return travel.
- First establish one convincing still composition at actual desktop display sizes. Then develop distinct wave constructions, continuous scenery and endless travel. Do not tune procedural variety before the still establishes the style.
- The user clarified on 2026-10-30 that new waves must be procedurally constructed, not a standard template or finite painted sprite catalogue. ADR-001 is superseded by research/decisions/ADR-002-generated-wave-geometry.md. Current painted app is a visual/interaction checkpoint only. Generate silhouette, crest topology, foam branches and surface contours; random placement/scale of finished images is insufficient. Revisited locations reproduce existing geometry; new locations must pass exact-duplicate and perceptual-repetition checks. Report tested uniqueness scope honestly.
- Clouds are required. Boats and Fuji remain undecided; they do not block wave, water, sky and cloud work. Do not assume either inclusion or permanent exclusion.
- Follow `research/woodblock-plan.md` and `research/validation-loop.md`. Older Braille studies are historical evidence only; retrieve a specific finding when relevant rather than loading their entire workflow.
- Preserve the unchanged canonical scan and its manifest pin. Never regenerate the pin from a validation runner.

## Agentic system and mandatory phase review

- Main purpose: an agentic system that improves through evaluations and feedback; Great Wave artwork is its test case. Follow `agents/wave-completion.md` policy v2.
- Startup reads: `research/agent-brief.md`, `research/agent-state.json`, current linked phase, then relevant IDs in `research/agent-memory.json`. Do not replay historical logs by default.
- Use `scripts/phase.mjs` for phase start, result and mandatory review. Reserve the final **5% of every planned phase token budget** for assessing process and logs; productive work uses 95%. Review before closing or starting the next phase, including rejected/incomplete attempts, without another user prompt. Actual token telemetry is unavailable unless explicitly provided; label estimates and overruns honestly.
- Default architecture: lead-builder plus independent evaluator. Worker is optional for defined patches, researcher for one exact blocker. At most **one child active**, one source writer, no recursive delegation. Role instructions in `.codex/agents/` use policy v2; preserve existing role models. Fresh agents must confirm phase ID and policy version.
- Record new results/reviews once in `research/phases/<id>.json`; generate the brief and keep a bounded lesson memory. The action log remains historical evidence. Every lesson needs stable failure ID, evidence and a changed-premise condition for retry.
- Routine design/implementation is delegated. Do not ask iteration-level artistic approval; distinguish technical/process checks, independent visual review and user artistic acceptance. Keep the existing ChatGPT plan; no purchases, resets or paid fallback. Checkpoint at <=10% remaining in either account window.

## Communication

- Write in a professional, neutral, clear, and efficient tone.
- Keep responses concise but complete, use precise terms, and define assumptions when relevant.
- Avoid repetition, filler, emojis, unsolicited examples, and descriptions of internal processes.
- Ask for clarification when required. When multiple materially different approaches exist, ask the user which path to take before implementing one.
- Prioritize coherent, well-supported reasoning and practical viability.
