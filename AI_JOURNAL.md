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

### ClaimService
The single frontend state layer for claims, and the one boundary between components and the (eventual) backend. Root-provided singleton (providedIn: 'root') so there's exactly ONE instance app-wide — every component (claimant view, staff queue, dashboard) reads from the same source of truth. Deliberately NOT provided inside a lazy-loaded feature module, because a service provided in a lazy module gets its own separate instance, which would break the shared state.

- State storage: all claims live in a private BehaviorSubject inside the service. It's private so nothing outside the service can push values into it directly. Components get a read-only view of it through the public claims$ observable — they can READ/subscribe but cannot write (only with BehaviorSubject inside the ClaimService), but the only way to CHANGE the data is by calling the service's methods (addClaim, assignClaim, settleClaim, rejectClaim). This is "controlled mutation": there's exactly one path to .next(), so every state change is predictable and traceable instead of scattered across the app.

- Why BehaviorSubject and not a plain Subject: a BehaviorSubject holds its current value and immediately replays it to any new subscriber. Components subscribe at different times (they're created on navigation, and lazy loading delays it further), almost always AFTER the claims were first loaded. BehaviorSubject means a late-subscribing component still gets the current claims instantly and renders. A plain Subject has no memory — it only emits FUTURE values — so a component that subscribes after load would get nothing until the next change, and the view would load empty.

- Why a service + BehaviorSubject instead of NgRx: NgRx is a heavier Redux-style state library with a lot of boilerplate (actions, reducers, effects). The state here is simple — one list of claims and a few operations on it — so NgRx isn't justified. A service with a BehaviorSubject is the right-sized tool. Would reach for NgRx only if the shared state grew much larger and more complex.

- Immutability: every method builds a NEW array/objects (via map + spread) rather than editing the existing ones in place, then emits it with .next(). e.g. updating a claim = map over the list, replace the one matching claim with a modified copy, pass every other claim through untouched. Mutations are immutable — every change builds a NEW array/objects rather than editing existing ones in place. Two reasons: (1) Angular's change detection compares by reference, so a new array reliably signals a change and re-renders (mutating in place keeps the same reference and can be silently missed); (2) it keeps state predictable — no existing object is edited behind anyone's back, so no hidden mutations. State only changes by building a new version and emitting it via .next().

- getTotalExposure: sums estimatedAmount across all claims that are NOT settled and NOT rejected — i.e. still-open claims. Settled claims have been paid out and rejected claims owe nothing, so both leave the "exposure" bucket. This is the liability-exposure figure the manager dashboard needs.

- Seed data: the service currently seeds a hardcoded array of claims because there's no backend yet — it stands in for what an API would return on load. Brief asks for a mock backend (JSON Server/MSW); the plan is to swap the seed for HTTP calls to a mock later. Because components only ever talk to ClaimService, that swap is isolated to the service — no component changes.

## 30 July
### Auth Service
- This is a service that is built minimal enough to demonstrate role picking (e.g. claimant or staff). It has same pattern as ClaimService (root singleton, private BehaviorSubject currentUser$, mutate via methods). No real auth in scope — login() just sets a role (claimant/staff). Added a synchronous currentUser getter because route guards need to read the role immediately without subscribing.
- Note: on standalone components (no NgModules), "lazy-loaded feature modules" = lazy-loaded routes files via loadChildren pointing at a routes array not a feature module. Same concept (separate bundles + guards + shared core), but different mechanism.
- Route guards (claimantGuard/staffGuard, CanActivateFn): check role before a route loads; wrong role → redirect to login. Enforces separation at the router, not by hiding UI — a claimant typing /staff is bounced back to login and the lazy staff bundle never even downloads. Caveat: frontend guards are UX, not security; real enforcement is backend (out of scope, mocked).
- Each feature has its own routes file (claimant.routes.ts / staff.routes.ts) that exports a Routes array named CLAIMANT_ROUTES / STAFF_ROUTES. The global app.routes.ts lazy-loads these arrays via loadChildren. Inside each, individual pages are lazy-loaded via loadComponent (path '' → the area's home page for now).
- Stripped app.component.html down to just <router-outlet> — AppComponent is the shell; routed pages render into the outlet.
- Tested: login → claimant area; /staff as claimant bounces to login; and vice versa. Role separation working both directions.

### Claimant Product
- Restructured claimant area into a shell (claimant-home: header + nav + nested <router-outlet>) with two child pages, track + report. Nested routing so the shell/nav persists while content swaps (like a Next.js layout). Default /claimant → redirect to /claimant/track.
- Track (claim-list): myClaims$ = claims$.pipe(map(filter by claimantId)) — shows only the logged-in claimant's own claims, reactively, via the async pipe. Client-side filter stands in for backend "WHERE claimantId = me".
- Report (report-claim): Reactive Forms (FormBuilder + Validators: required, minLength, min). On submit → claimService.addClaim() → redirect to track, where the new claim appears immediately because track subscribes to the same BehaviorSubject. Chose reactive over template-driven for explicit, validatable form state.
- Typed the `type` form control as ClaimType (not plain string) so it matches addClaim's union type — TypeScript caught the mismatch (the model's union-type safety working as intended).
- Partial data handled: track shows a claim's decision only if it exists (*ngIf="claim.decision"), since a new/submitted claim has none yet.