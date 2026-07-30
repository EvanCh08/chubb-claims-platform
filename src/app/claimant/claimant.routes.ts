import { Routes } from '@angular/router';

// Routes for the claimant area. Lazy-loaded as a group via loadChildren in the
// main router config. For now just the home page; report/track pages added later.
export const CLAIMANT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./claimant-home/claimant-home.component').then(m => m.ClaimantHomeComponent),
  },
];