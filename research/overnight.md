# Automatic overnight work

Owner confirmed daily midnight–08:00 America/Toronto. This window supersedes the primary five-hour cadence and unrestricted retry times in research/continuation.md; its remaining allowance safeguards still apply. Manual owner requests are separate authorization.

- Mark scheduled invocations `automatic:true` when using continuation-plan.mjs; explicit manual work uses false. Unknown origin fails closed. Read fresh Toronto time before automatic work, between phases and at milestones at least every five minutes. Only00:00 inclusive to08:00 exclusive is authorized for automatic work.
- Primary heartbeat checks UTC04:00,05:00,09:00,10:00 daily. This includes Toronto midnight and05:00 in both DST seasons, with extra recovery checks within the night; outside-window checks stay quiet. Do not require exact launch-minute or scheduled-slot metadata. Delayed delivery still uses actual current local time.
- At07:45 stop new delegation/phases and checkpoint. Finish review/save before08:00. Do not begin work that cannot fit; check time before long operations. This is a prompt-level control, not a host-enforced kill switch.
- Preserve actual allowance/active-run checks, one child, one source writer and incremental publication. Unknown active status does not authorize overlap. At98% arm one finite retry only if its buffered target is inside the night window. If the reset/target is daytime, create no daytime retry: next nightly primary resumes from fresh usage. Retry prompts must also use automatic:true and this same window guard.
- Computer and app must remain available; no sleeping-host wake or guaranteed recovery claim. No purchases, quota resets, fallback billing or infrastructure changes. Quiet unchanged/pending; report material results or actionable failure only.

P111 finite canary delivered2026-11-07T23:30:14.678Z for23:30:00Z target. This confirms that instance only. Primary night schedule is configuration-tested; first overnight execution is separate evidence.
