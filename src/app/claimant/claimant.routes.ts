import { Routes } from '@angular/router';
import { ClaimantHomeComponent } from './claimant-home/claimant-home.component';

// The shell (ClaimantHomeComponent) wraps the claimant area and provides the nav +
// nested outlet. Its children render inside that outlet.
export const CLAIMANT_ROUTES: Routes = [
  {
    path: '',
    component: ClaimantHomeComponent,
    children: [
      {
        path: 'track',
        loadComponent: () =>
          import('./claim-list/claim-list.component').then(m => m.ClaimListComponent),
      },
      {
        path: 'report',
        loadComponent: () =>
          import('./report-claim/report-claim.component').then(m => m.ReportClaimComponent),
      },
      // Default: /claimant with nothing after → show the track page.
      { path: '', redirectTo: 'track', pathMatch: 'full' },
    ],
  },
];