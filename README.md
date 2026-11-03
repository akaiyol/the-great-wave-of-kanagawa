# The ocean — after Hokusai

An experiment in generating an endless ocean that immediately evokes Hokusai’s *The Great Wave*. The goal is varied wave anatomy, defined foam and flowing water contours, with deterministic generation so revisiting a location reproduces the same scene.

## Inspiration

- **Visual language:** Hokusai’s original woodblock print, using the [Metropolitan Museum scan](references/great-wave-off-kanagawa-met-DP130155.jpg) as the canonical reference for shape, palette and composition.
- **Generative approach:** [LingDong-’s Shan, Shui](https://github.com/LingDong-/shan-shui-inf)—construct objects from rules, then render their contours and details. Here, those objects are waves and branching foam.

## Pivots

1. **Braille foam → woodblock color:** moved from dot sampling to complete water surfaces, ivory foam, indigo contours and pale clouds.
2. **Painted sprites → generated geometry:** reusable finished waves looked too repetitive. The active generator now constructs wave profiles and branch relationships from seeds.
3. **Detail tuning → anatomy first:** geometry and visual review now precede texture, scenery and endless travel.

## Current progress

The [procedural gallery](research/woodblock/generated-gallery.html) generates reproducible collections with varying crest topology and wave profiles. Fifteen geometry/model tests pass; a new foam attachment also passed local visual review across six seeds.

The artwork remains unfinished. Foam is too sparse, water bands too uniform, and the latest two-group experiment produces an overly pointed branch. Broader wave families and a continuous procedural ocean are still ahead. The root page retains an earlier painted prototype.

## Agent architecture

A lead coordinates three bounded roles:

- **Worker:** implements geometry and rendering within assigned files.
- **Evaluator:** independently compares rendered results with the reference.
- **Researcher:** resolves a specific blocking question when needed.

At most two agents run under the lead, with one source writer. Small executable controls come before expansion. Source snapshots, render captures and an [action log](research/agent-iteration-log.md) connect each result to a decision; technical checks and artistic acceptance remain separate. See the [agent workflow](agents/wave-completion.md).

## Run locally

No build or package installation is required:

```sh
python3 -m http.server 4187 --bind 127.0.0.1
```

Open the [generated wave gallery](http://127.0.0.1:4187/research/woodblock/generated-gallery.html).
