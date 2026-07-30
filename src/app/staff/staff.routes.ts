import { Routes } from '@angular/router';
import { StaffHomeComponent } from './staff-home/staff-home.component';

export const STAFF_ROUTES: Routes = [
  {
    path: '',
    component: StaffHomeComponent,
    children: [
      {
        path: 'queue',
        loadComponent: () =>
          import('./queue/queue.component').then((m) => m.QueueComponent),
      },
      {
        // Assessment page for one claim — :id is a route parameter (which claim).
        path: 'assess/:id',
        loadComponent: () =>
          import('./assess-claim/assess-claim.component').then(
            (m) => m.AssessClaimComponent,
          ),
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./dashboard/dashboard.component').then(
            (m) => m.DashboardComponent,
          ),
      },
      { path: '', redirectTo: 'queue', pathMatch: 'full' },
    ],
  },
];
