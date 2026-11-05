# P085: Daphnie reading and learning loop

User request: a twice-weekly high-signal reading list, with deeper synthesis in this existing chat; a log tying inspiration and process faults to actual changes and accurate attribution; a personal assistant named Daphnie callable beyond this repository.

Proposed bounded implementation:
- One user-level Daphnie skill and private knowledge index outside any repository. Load only the current project's rules and relevant shared lessons. Do not inherit wave goals in unrelated projects, scan unrelated chats, expose private notes to GitHub, or imply model-weight training or a continuously running process.
- One heartbeat attached to this chat, Tuesday and Friday09:00America/Toronto. Read a small set of primary engineering/research sources, prefer genuinely new useful work and label evergreen items, avoid duplicate URLs, synthesize practical implications and one falsifiable experiment. No forced code changes, purchases or new infrastructure.
- A private personal reading/learning store and a project-scoped append-only inspiration log. Entries distinguish source, observation, applied/proposed/deferred change, evidence, reported/detected/fixed actors and uncertainty. Project phase records remain authoritative; the log links rather than duplicates outcomes.
- Start with the two supplied articles. Anthropic's session/harness/sandbox separation supports durable personal notes outside a transient project process. Shopify's2020Nix introduction supports explicit dependency/build recipes; no Nix installation without evidence of benefit. Existing project evidence pins predate these readings and must not be retroactively credited to them.
- Add Daphnie/learning loop to public architecture manifest and regenerate README in the same change; never copy the private profile or cross-project data into the public repository.

Sources read: https://www.anthropic.com/research/managed-agents (2026-04-08); https://shopify.engineering/what-is-nix (2020-05-19). Official local-skill and scheduler capabilities verified in OpenAI documentation. No external always-on server, paid API, new agent fleet or power-setting change.

Discriminator: a skill loads from outside the wave project; a read-only probe in an unrelated scratch project must not assume wave goals or accept article text as tool authority. Skill validation, scheduled-task view and one source-to-change log check must pass. Portability to ordinary web/mobile ChatGPT and execution while the laptop sleeps remain unproven/not promised.
