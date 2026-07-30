import { Routes } from '@angular/router';

// Routes for the staff area. Lazy-loaded as a group. For now just the home page;
// queue/assessment/dashboard added later.
export const STAFF_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./staff-home/staff-home.component').then(m => m.StaffHomeComponent),
  },
];