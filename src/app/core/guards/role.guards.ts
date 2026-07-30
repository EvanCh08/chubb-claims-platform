import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// A guard is a function that runs BEFORE a route loads and returns true (allow)
// or a redirect (block). CanActivateFn is Angular's type for such a function.

// Only allow through if the current user is a claimant.
export const claimantGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;              // synchronous snapshot — the role right now
  if (user?.role === 'claimant') {
    return true;                              // allowed → route loads
  }
  // Not a claimant (wrong role, or not logged in) → send to login, block the route.
  return router.parseUrl('/login');
};

// Only allow through if the current user is staff.
export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const user = auth.currentUser;
  if (user?.role === 'staff') {
    return true;
  }
  return router.parseUrl('/login');
};