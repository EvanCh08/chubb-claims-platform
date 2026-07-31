# Chubb Claims Platform — Frontend

An Angular frontend for a claims platform serving two user types — **claimants** and **claims staff** — from a single codebase. Built for the Chubb AI Take-Home Assessment (Frontend brief).

## Running locally

This app uses a mock backend (JSON Server). You need two terminals:

Terminal 1 — the mock API:
```bash
npm run api
```

Terminal 2 — the Angular app:
```bash
npm install
ng serve
```

Then open `http://localhost:4200`.

## What it does

**Claimants** can report a claim, and track their own claims (with live status and decisions).

**Claims staff** see the full queue, pick up submitted claims, assess in-review claims (settle with a payout amount, or reject with a reason), and view a manager dashboard showing outstanding liability exposure, claim counts, and per-officer workload — all updating in real time.

The full lifecycle flows end to end: claimant submits → staff picks up → staff settles/rejects → claimant sees the decision.

## Architecture & key decisions

**One codebase, two user types.** A shared `core` (models, services, guards) with two lazy-loaded feature areas — `claimant` and `staff`. Role separation is enforced at the router with `CanActivate` guards, not by hiding UI: a claimant typing `/staff` is redirected, and the staff bundle never even loads. (Frontend guards are UX-level; real access control would be enforced server-side.)

**Single source of truth.** All claim state lives in a root-provided `ClaimService` holding claims in a `BehaviorSubject`, exposed as a read-only `claims$` observable. Components read via `claims$` and mutate only through service methods — so the claimant view, staff queue, and dashboard all stay in sync from one source, with no copies to drift. Chose a service + `BehaviorSubject` over NgRx because the state is simple enough that NgRx's boilerplate wasn't justified.

**Reactive throughout.** Views subscribe via the `async` pipe. The dashboard's figures (exposure, counts) are derived reactively from `claims$`, so settling a claim updates the exposure total live — the "real-time picture" the brief highlights.

**Reactive forms** for claim reporting and assessment, with validation.

## Mock data / backend

Claims are currently seeded in-memory in `ClaimService`, standing in for what a backend API would return. Because components only ever talk to the service, swapping the seed for real HTTP calls (or a mock backend like JSON Server) is isolated to the service — no component changes.

## Deliberate scope decisions

Given the time-box, the following were deprioritised and would be natural next steps:
- **Real authentication** — login is a role picker; no credentials/session.
- **Real backend & persistence** — state is in-memory, so a page refresh resets to seed data. Real enforcement of "claimants see only their own claims" belongs on the backend.
- **Real-time push (Kafka/WebSocket)** — the architecture is shaped for it: a pushed event would update the same `BehaviorSubject` and every view would react. Not implemented.
- **`info_requested` status** — staff sending a claim back to the claimant for more info.
- **Separate manager role** — the dashboard is currently visible to all staff; a `manager` role + guard would restrict it (same guard pattern).
- **Unit tests** — omitted for scope; `ClaimService` methods and the exposure calc are the obvious things to cover.

## AI working journal

See `AI_JOURNAL.md` for a running log of how I directed, challenged, and overrode AI throughout the build, with reasoning behind the key decisions.

## Tech

Angular (standalone components), TypeScript, RxJS. No backend — in-memory seed data.