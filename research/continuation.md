# Allowance-reset continuation

The nominal five-hour heartbeat and the account's reset clock are independent. P111 repairs the observed early-check gap; it does not reset account usage.

## Runtime procedure

1. Read actual usage, UTC time and active-run state. Do not replay historical logs. Run `node scripts/continuation-plan.mjs` with JSON on stdin; inspect its output. Unknown allowances do not authorize work.
2. Available allowance with no active run: continue from the current brief. At the 98%-used checkpoint, use checkpoint mode to arm recovery before access exhaustion. Save incrementally regardless of scheduler state.
3. Exhausted allowance: use the latest blocking window's future reset, plus90seconds rounded up to a minute. Do not wait another five hours merely because a check was early.
4. Use the host automation tool to create one heartbeat named `Wave project — reset retry` in the current chat with the planner's UTC date-qualified recurrence. Keep the primary five-hour heartbeat unchanged. Inspect saved configuration. Reuse an identical pending retry, remove superseded retries, and retain at most one production retry. Do not edit scheduler files directly.
5. Retry prompt: check fresh usage/UTC/active-run state, delete this retry using its supplied automation ID, then follow this procedure. If allowance is available and no run is active, continue the current project phase. If still exhausted, re-arm only from fresh future reset data. If another run is active, leave its work alone; it owns its pre-exhaustion checkpoint. Preserve primary heartbeat. Notify only meaningful results or actionable failures.
6. Stale, missing, invalid or more-than-eight-days-away reset: do not create an immediate retry loop. Keep the primary five-hour check and report the scheduling fault once. Unknown active-run state must not start overlapping artwork. No enforced host lock has been demonstrated.

Finite rules end two minutes after their target; deletion on delivery removes stale configuration. Expiry alone does not prove successful delivery. Creation requires a future occurrence. UTC date fields avoid ambiguous local/DST interpretation; the live P111 canary checks this host's execution separately. A computer/app unavailable at the target can still miss a finite retry; the primary heartbeat is the recovery fallback. No sleeping-host wake guarantee.

Keep scheduling repairs bounded: no new agent fleet, background service, perpetual short polling, purchases or quota resets. Never claim future reliability from saved configuration alone.
