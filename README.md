# The ocean — an agentic systems experiment

The main purpose of this project is to build an agentic system with evaluation and feedback loops built in, so it can learn from its results and improve how it works. Generating an ocean inspired by Hokusai’s *The Great Wave* is the test case: a concrete visual problem that exposes weak reasoning, repeated failures and gaps between passing tests and convincing output.

## Agent architecture

The lead builds uncertain constructions and coordinates an independent **evaluator**. A **worker** handles defined patches; a **researcher** resolves specific blockers. One child runs at a time, with one source writer.

```mermaid
flowchart TD
    Goal[Goal and canonical reference] --> Lead[Lead: scope and construct]
    Lead --> Artifact[Small executable artifact]
    Lead -->|Defined patch| Worker[Optional worker]
    Worker --> Artifact
    Lead -->|Blocking question| Researcher[Researcher: investigate]
    Researcher -->|Findings| Lead
    Artifact --> Checks[Technical checks and render captures]
    Checks --> Evaluator[Evaluator: independent visual review]
    Evaluator --> Decision{Lead: assess evidence}
    Decision -->|Retain or reject| Record[Action log and checkpoint]
    Record --> Review[Process review: reserved 5%]
    Review -->|Update lessons and next task| Lead
    Review -->|Milestone criteria met| Result[Validated checkpoint]
```

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
