import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { Claim } from '../models/claim.model';

@Injectable({ providedIn: 'root' })
export class ClaimService {
  private http = inject(HttpClient);

  // The mock backend's claims endpoint (JSON Server, from db.json's "claims" key).
  private apiUrl = 'http://localhost:3000/claims';

  // Local cache of claims for the UI. Same BehaviorSubject as before — components
  // and the async pipe are unchanged. It starts empty and is filled by loadClaims().
  private claimsSubject = new BehaviorSubject<Claim[]>([]);
  public claims$: Observable<Claim[]> = this.claimsSubject.asObservable();

  constructor() {
    // On service creation (app start), fetch the claims from the backend.
    this.loadClaims();
  }

  private get currentClaims(): Claim[] {
    return this.claimsSubject.value;
  }

  // GET all claims from the API and populate the local cache.
  private loadClaims(): void {
    this.http.get<Claim[]>(this.apiUrl).subscribe(claims => {
      this.claimsSubject.next(claims);
    });
  }

  getTotalExposure(): number {
    return this.currentClaims
      .filter(c => c.status !== 'settled' && c.status !== 'rejected')
      .reduce((sum, c) => sum + c.estimatedAmount, 0);
  }

  // Create a new claim: POST to the backend, then add the SAVED claim (from the
  // response) to the local cache. We use the backend's returned object because it's
  // the authoritative version.
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
    this.http.post<Claim>(this.apiUrl, newClaim).subscribe(saved => {
      this.claimsSubject.next([...this.currentClaims, saved]);
    });
  }

  assignClaim(claimId: string, officer: string): void {
    this.patchClaim(claimId, { assignedTo: officer, status: 'in_review' });
  }

  settleClaim(claimId: string, amount: number, decision: string): void {
    this.patchClaim(claimId, { status: 'settled', settledAmount: amount, decision });
  }

  rejectClaim(claimId: string, reason: string): void {
    this.patchClaim(claimId, { status: 'rejected', decision: reason });
  }

  // Shared update: PATCH the changed fields to the backend, then update the local
  // cache with the saved claim it returns.
  private patchClaim(claimId: string, changes: Partial<Claim>): void {
    this.http.patch<Claim>(`${this.apiUrl}/${claimId}`, changes).subscribe(saved => {
      const updated = this.currentClaims.map(c => (c.id === claimId ? saved : c));
      this.claimsSubject.next(updated);
    });
  }

  private generateId(): string {
    return 'c_' + Math.random().toString(36).substring(2, 9);
  }
}