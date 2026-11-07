# P111 — Reset-aware continuation repair

SYSTEM repair requested by owner after missed continuation. ART geometry and acceptance criteria remain unchanged.

Observed heartbeat payload 2026-11-07T21:36:13.387Z checked exhausted short window; reset was reported as 21:38:29Z. The configured five-hour recurrence did not schedule a reset retry. Fixed recurrence and allowance reset are independent clocks. Daphnie owns this configuration fault; user identified the failure. Heartbeat delivery occurred; allowance reset itself was not broken.

Keep nominal five-hour heartbeat. At pre-exhaustion checkpoint, or an exhausted check, arrange one finite retry for the latest blocking reset plus90seconds rounded up to a minute. Use date-qualified RFC5545 recurrence in explicitly documented host timezone America/Toronto, ending after its target. Inspect saved configuration. Retry rechecks actual allowance and active-run status, removes itself, then continues or re-arms once using fresh allowance. Stale/unknown resets must not cause an immediate retry loop. Deduplicate retries and distinguish prompt overlap avoidance from an enforced lock. Do not spend allowance simply to consume it.

Test pure planning on observed early check, both windows, DST/date rollover, stale/unknown resets and active work. A short live finite retry canary tests delivery/timezone separately; saved configuration is not delivery proof. No infrastructure installation or perpetual short-interval polling. If host rejects finite scheduling, report the limitation rather than claiming success. Budget8000 estimated including400 review; diagnosis before phase is charged as setup. Source models and ART unchanged.
