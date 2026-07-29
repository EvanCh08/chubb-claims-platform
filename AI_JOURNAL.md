# AI Working Journal — Chubb Claims Platform (Frontend)

A running log of what I asked the AI, what I accepted, challenged, and overrode, with brief reasoning.

## 29 July
### Setup
- Started a fresh Angular app with `ng new` (CSS).
- Brainstorm the problem statement and decide on the code architecture before start building: one shared core + two lazy-loaded feature modules (ClaimantModule and StaffModule), role separation through route guards, and a shared state in a root-provided ClaimService using a BehaviorSubject. The remaining rationales will be documented as I build through the application.

### Claim Model
Single shared Claim interface (core/models) — one contract both user types use, so the two sides can't drift to different shapes.

- Union types for type ('motor'|'property') and status ('submitted' | 'in_review'| 'settled'|'rejected'), not plain string → typos/invalid states caught at compile time; lifecycle states explicit.
- Optional fields (assignedTo?, decision?, settledAmount?): one model covers
every lifecycle stage. New claim legitimately has none yet → mark it as absent, not an error. This is how partial data is handled cleanly.
- id vs claimantId vs claimantName:
    - id = key for the CLAIM → targets one claim for actions (settle/assign/reject).
    - claimantId = ref to the PERSON → filters a claimant to their own claims. One claimant → many claims, so id ≠ claimantId.
    - claimantName = display only. Never filter on name (names collide/change → could leak claims between people). Always filter on claimantId.
- Kept both claimantId + claimantName: ID reliable for logic, name for the human eyes. Real system: name would live on a user record + be joined, not included onto each claim, this is a shortcut since no user table at this sprint.
- Filtering lives client-side here = DISPLAY filtering, not security (mock backend returns all claims). Real system: backend queries WHERE claimantId=<me>. My client filter stands in for out-of-scope backend logic.
- Deferred: `info_requested` status (brief's "provide more info"). Core lifecycle first; add status + flow together only if time. Left out of model for now → no unused state.
- Deferred: human-facing claim number (e.g. CLM-2026-000123). Real systems split DB id from claimant-friendly number (same machine/human split as id/name). Using single id as both for now; skipped as non-essential for demo.