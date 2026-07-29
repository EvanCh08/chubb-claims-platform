import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Claim } from '../models/claim.model';

// Root-provided singleton: ONE instance for the whole app, so every component
// (claimant view, staff queue, manager dashboard) reads from the same source of
// truth. Providing it here (not inside a lazy-loaded module) is what guarantees
// the single instance — a service provided inside a lazy module would get its own.
@Injectable({ providedIn: 'root' })
export class ClaimService {
  // The single source of truth: all claims live in one private BehaviorSubject.
  // Private, so nothing outside the service can push new values directly — the
  // only way to change state is through this service's methods (controlled mutation).
  // BehaviorSubject (not plain Subject) because it holds a CURRENT value, so a
  // component that subscribes late still immediately receives the latest claims.
  private claimsSubject = new BehaviorSubject<Claim[]>(this.seedClaims());

  // Public read-only stream. Components subscribe to this (via the async pipe)
  // to display claims, but cannot mutate it — they must call the methods below.
  public claims$: Observable<Claim[]> = this.claimsSubject.asObservable();

  // --- READ ---

  // Current claims snapshot (not a stream) — used internally to compute next state.
  private get currentClaims(): Claim[] {
    return this.claimsSubject.value;
  }

  // Total liability exposure = sum of estimatedAmount across all OPEN claims
  // (not settled, not rejected). Settled = paid out, rejected = owes nothing,
  // so both have left the exposure bucket.
  getTotalExposure(): number {
    return this.currentClaims
      .filter(c => c.status !== 'settled' && c.status !== 'rejected')
      .reduce((sum, c) => sum + c.estimatedAmount, 0);
  }

  // --- WRITE (each builds a NEW array immutably, then emits it) ---

  // Claimant submits a new claim. We generate id + createdAt and set status
  // 'submitted'. Caller supplies only the human-entered parts.
  addClaim(input: {
    claimantId: string;
    claimantName: string;
    type: Claim['type'];
    description: string;
    estimatedAmount: number;
  }): void {
    const newClaim: Claim = {
      id: this.generateId(),
      claimantId: input.claimantId,
      claimantName: input.claimantName,
      type: input.type,
      status: 'submitted',
      description: input.description,
      estimatedAmount: input.estimatedAmount,
      createdAt: new Date().toISOString(),
    };
    this.claimsSubject.next([...this.currentClaims, newClaim]);
  }

  // Staff picks up a claim: assign to an officer, move into review.
  assignClaim(claimId: string, officer: string): void {
    this.updateClaim(claimId, { assignedTo: officer, status: 'in_review' });
  }

  // Staff settles a claim: record payout amount + decision note.
  settleClaim(claimId: string, amount: number, decision: string): void {
    this.updateClaim(claimId, { status: 'settled', settledAmount: amount, decision });
  }

  // Staff rejects a claim: record the reason.
  rejectClaim(claimId: string, reason: string): void {
    this.updateClaim(claimId, { status: 'rejected', decision: reason });
  }

  // --- INTERNAL HELPERS ---

  // Shared update logic: find the one claim by id, produce a NEW claim object with
  // the changes merged in, leave all others untouched, emit the new array.
  private updateClaim(claimId: string, changes: Partial<Claim>): void {
    const updated = this.currentClaims.map(c =>
      c.id === claimId ? { ...c, ...changes } : c
    );
    this.claimsSubject.next(updated);
  }

  // Simple unique-id generator for the demo (real system: backend/DB assigns ids).
  private generateId(): string {
    return 'c_' + Math.random().toString(36).substring(2, 9);
  }

  // Seed data so the app has something on load. Real app: this comes from the backend.
  private seedClaims(): Claim[] {
    return [
      { id: 'c_1001', claimantId: 'u_01', claimantName: 'John Tan',
        type: 'motor', status: 'submitted',
        description: 'Rear-ended at a traffic light on the PIE.',
        estimatedAmount: 4200, createdAt: '2026-07-25T09:00:00.000Z' },

      { id: 'c_1002', claimantId: 'u_02', claimantName: 'Priya Nair',
        type: 'property', status: 'in_review',
        description: 'Burst pipe damaged kitchen flooring.',
        estimatedAmount: 15000, createdAt: '2026-07-24T14:30:00.000Z',
        assignedTo: 'Officer Lim' },

      { id: 'c_1003', claimantId: 'u_03', claimantName: 'Marcus Lee',
        type: 'motor', status: 'settled',
        description: 'Windscreen cracked by road debris.',
        estimatedAmount: 800, createdAt: '2026-07-20T11:15:00.000Z',
        assignedTo: 'Officer Lim', settledAmount: 750,
        decision: 'Approved — windscreen replacement covered.' },

      { id: 'c_1004', claimantId: 'u_04', claimantName: 'Aisha Rahman',
        type: 'property', status: 'submitted',
        description: 'Storm damage to roof tiles.',
        estimatedAmount: 9500, createdAt: '2026-07-26T08:45:00.000Z' },

      { id: 'c_1005', claimantId: 'u_05', claimantName: 'David Wong',
        type: 'motor', status: 'rejected',
        description: 'Claim for pre-existing scratch damage.',
        estimatedAmount: 2000, createdAt: '2026-07-19T16:00:00.000Z',
        assignedTo: 'Officer Tan',
        decision: 'Rejected — damage predates policy start.' },

      { id: 'c_1006', claimantId: 'u_01', claimantName: 'John Tan',
        type: 'property', status: 'submitted',
        description: 'Water heater leak damaged bathroom ceiling.',
        estimatedAmount: 6000, createdAt: '2026-07-27T10:20:00.000Z' },
    ];
  }
}