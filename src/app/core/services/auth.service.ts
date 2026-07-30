import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// The two roles the app serves. This is the single field that drives the entire
// role-separation: which routes you can reach, and which UI you see.
export type UserRole = 'claimant' | 'staff';

// The logged-in user. Minimal by design — no real auth in scope, so this is just
// enough to identify who's acting and in what role.
export interface CurrentUser {
  id: string;        // e.g. 'u_01' for a claimant, or a staff id
  name: string;      // display name, no passwords for now (low in priority)
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Current user held in a BehaviorSubject — null when logged out. Same pattern as
  // ClaimService: private subject, public read-only stream, mutate via methods.
  private currentUserSubject = new BehaviorSubject<CurrentUser | null>(null);
  public currentUser$: Observable<CurrentUser | null> = this.currentUserSubject.asObservable();

  // Synchronous snapshot — guards need to check the role immediately (without
  // subscribing), so they read this.
  get currentUser(): CurrentUser | null {
    return this.currentUserSubject.value;
  }

  // "Log in" as a given role. Real system: validate credentials against a backend.
  // Here we just set the user — enough to demonstrate role-based routing.
  login(user: CurrentUser): void {
    this.currentUserSubject.next(user);
  }

  logout(): void {
    this.currentUserSubject.next(null);
  }
}