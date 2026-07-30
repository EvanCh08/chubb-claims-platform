import { Routes } from '@angular/router';
import { claimantGuard, staffGuard } from './core/guards/role.guards';

export const routes: Routes = [
  // Default: send the bare URL to login.
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // Login page — lazy-loaded single component, no guard (anyone can reach it).
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.component').then(m => m.LoginComponent),
  },

  // Claimant area — guarded by claimantGuard, lazy-loads the claimant routes.
  // A non-claimant hitting /claimant is bounced by the guard before this loads.
  {
    path: 'claimant',
    canActivate: [claimantGuard],
    loadChildren: () =>
      import('./claimant/claimant.routes').then(m => m.CLAIMANT_ROUTES),
  },

  // Staff area — guarded by staffGuard, lazy-loads the staff routes.
  {
    path: 'staff',
    canActivate: [staffGuard],
    loadChildren: () =>
      import('./staff/staff.routes').then(m => m.STAFF_ROUTES),
  },

  // Anything unrecognised → back to login.
  { path: '**', redirectTo: 'login' },
];