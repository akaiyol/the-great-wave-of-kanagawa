# The ocean — procedural art and agentic systems

<!-- goals:start -->
Both project goals have equal priority.

- **ART: Procedural Great Wave ocean.** Create a visually recognizable Great Wave ocean in the canonical Hokusai woodblock language, using LingDong-style mathematical construction and continuous generation.
- **SYSTEM: Efficient evaluated agentic development.** Develop a small agentic system that reaches the artwork goal through critical thinking, external learning and fast, high-quality experiments with few resources.

[Full goals and acceptance criteria](GOALS.md). Progress status does not establish visual acceptance.
<!-- goals:end -->

## Agent architecture

The lead owns delivery, decisions and documentation. Strategy and visual review use the existing independent evaluator; a worker handles defined patches and a researcher resolves exact blockers. One child runs at a time.

<!-- architecture:start -->
<!-- Reviewed architecture inputs: b8275d101d63bd8d27b596a2768814927cd7b75bba1c6d5d29d876a694a40415 -->
```mermaid
flowchart TD
  n_Goals["Two equal goals: ART + SYSTEM"]
  n_Lead["Lead: propose and own result"]
  n_Research["Optional researcher: exact blocker"]
  n_Strategy["Independent evaluator: challenge hypothesis"]
  n_Build["Lead / optional worker: build"]
  n_Artifact["Artifact + technical checks"]
  n_Visual["Independent evaluator: visual review"]
  n_Record["Decision + phase evidence"]
  n_Process["Process review: final 5%"]
  n_Result["Both goals verified"]
  n_Goals --> n_Lead
  n_Lead -->|"Exact blocker"| n_Research
  n_Research --> n_Lead
  n_Lead --> n_Strategy
  n_Strategy -->|"Continue or pivot"| n_Build
  n_Strategy -->|"Reject or defer"| n_Lead
  n_Build --> n_Artifact
  n_Artifact --> n_Visual
  n_Visual --> n_Record
  n_Record --> n_Process
  n_Process -->|"Lessons and next test"| n_Lead
  n_Process -->|"Acceptance evidence"| n_Result
```
<!-- architecture:end -->

Before building a new hypothesis, an independent strategy review checks supporting and contrary evidence, predicts an observable result, and sets one bounded test. It can retain a sound path, pivot, reject a construction, or defer judgment when evidence is missing. A deterministic gate checks the record and evidence; it cannot guarantee good judgment.

Every phase reserves **5% of its planned token budget** for reviewing process and logs before another phase starts. A short brief, evidence-linked lessons and structured phase records carry findings forward. Technical correctness and artistic quality are evaluated separately. Exact compute telemetry is unavailable here, so usage estimates remain explicit.

Today, this learning is **lead-managed** through recorded findings and updates to tasks and workflow rules. Reliable autonomous self-improvement is still the goal. See the [agent workflow](agents/wave-completion.md), [current brief](research/agent-brief.md) and [phase records](research/phases/).

## Inspiration

Hokusai’s *The Great Wave* sets the visual direction: a curling silhouette, connected branching foam, flowing indigo contours and carefully shaped negative space. The [Metropolitan Museum scan](references/great-wave-off-kanagawa-met-DP130155.jpg) is the canonical reference for an endlessly explorable ocean in this woodblock language.

[LingDong-’s Shan, Shui](https://github.com/LingDong-/shan-shui-inf) inspires the construction process. It generates an infinitely scrolling Chinese landscape in JavaScript and SVG. A planner places mountains and other objects using noise and spacing rules. Each object is then built from geometry: mountains from nested contours, trees from branching structures, followed by variable-width strokes and texture that follows the surfaces. New regions are generated as the viewer scrolls.

The key idea is **composition → geometry → contours → detail**. Randomness adds variation within that structure. This project applies the same hierarchy to wave profiles, foam branches and water contours, giving the agents a demanding visual task with observable results to evaluate and improve. See the [source study](research/shan-shui-code-notes.md).

## Run locally

No build or package installation is required:

```sh
python3 -m http.server 4187 --bind 127.0.0.1
```

Open the [generated wave gallery](http://127.0.0.1:4187/research/woodblock/generated-gallery.html).
