# Project instructions

Repository: https://github.com/akaiyol/the-great-wave-of-kanagawa

## Canonical visual reference

- The source of truth for this project's visual work is Katsushika Hokusai's original woodblock print, *Under the Wave off Kanagawa*, also known as *The Great Wave*, ca. 1830–32.
- Use the unmodified museum scan at `references/great-wave-off-kanagawa-met-DP130155.jpg`. Inspect it before making visual design or rendering decisions.
- This scan depicts The Metropolitan Museum of Art's impression, accession JP1847. It is a reproduction of the original artwork, not a modern reinterpretation. Different surviving impressions can vary; this specific scan is the project's canonical reference.
- Follow the reference for composition, wave silhouette, curling crest, foam shapes, water contours, negative space, proportions, and palette unless the user explicitly requests a departure.
- Do not replace the reference with an AI-generated image, stylized recreation, or another impression. Keep the original asset unchanged; save derived assets separately.
- Source and procedural-generation research links are recorded in `references/README.md`.

## Braille wave direction — 2026-10-07

- The requested experience is an endlessly scrolling field of Great Wave–inspired waves. Scrolling reveals generated compositions; a physically simulated breaking/reforming wave is not the current scope.
- Render white foam using Braille dots. Sky, darker water, and other darker regions remain black negative space. Pale paper in the scan is not foam and must not become dots.
- Keep the crest, its connected fingers, and the black hollows recognizable at the actual displayed Braille resolution. Noise is secondary to coherent geometry.
- Read `research/shan-shui-code-notes.md` and `research/wave-feasibility.md` before implementation. The research prototype tests mechanics; its wave shapes and coarse reference mask are not artistically approved.
- The user authorized the first end-to-end prototype on 2026-10-11. Its entry point is `index.html`, with independent implementation under `src/`. Research stays under `research/`; generated geometry and overall composition still await visual acceptance.
- The ocean must vary in wave structure, grouping, spacing, and depth; repeating one large wave with minor parameter changes is insufficient. Read `research/ocean-research-and-implementation-plan.md` for the current prerequisites and production entry criteria.
- The user selected a side-oblique viewpoint following the print's curling wave profiles on 2026-10-11. See `research/reference-study-notes.md` for current study findings and decision status.
- The user selected explicitly drawn dots in the eight-dot Braille layout rather than Unicode glyphs. Font-based rendering remains a research comparison only.
- The artwork is standalone and fills the viewport. Travel is slow, automatic, and horizontal, with pause and manual control. Respect reduced motion by starting paused; manual exploration must remain available.
- The initial version targets desktop browsers only. Mobile layout and physical-phone performance are outside the initial acceptance scope; retain resize and device-pixel-ratio checks for desktop windows and displays.
- For visual iterations, use `research/validation-loop.md`: validate expected output, then original form, then quality. Technical success must not override a failing visual review. Keep the fixed failing fixtures and compare raw geometry with sampled output before adjusting renderer settings. Reference integrity is pinned in `references/manifest.json`; the validation runner must not regenerate that pin.

## Autonomous completion workflow

- Follow `agents/wave-completion.md` and checkpoint `research/agent-state.json`. Harness findings are in `research/agent-harness-research.md`; retrieve details only as needed.
- Role models/instructions live in `.codex/agents/`, with defaults in `.codex/config.toml`. Keep the lead chat-selected, at most two children concurrent, and one source writer. Use the existing ChatGPT plan; no paid fallback, credit purchases or resets.
- The user delegated routine design and implementation choices on 2026-10-26. Make evidence-based decisions without iteration-level approval questions. Distinguish verified release readiness from user artistic acceptance.

## Communication

- Write in a professional, neutral, clear, and efficient tone.
- Keep responses concise but complete, use precise terms, and define assumptions when relevant.
- Avoid repetition, filler, emojis, unsolicited examples, and descriptions of internal processes.
- Ask for clarification when required. When multiple materially different approaches exist, ask the user which path to take before implementing one.
- Prioritize coherent, well-supported reasoning and practical viability.
