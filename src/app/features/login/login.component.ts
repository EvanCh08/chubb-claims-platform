import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, CurrentUser } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  // inject() is the modern standalone way to get dependencies (vs constructor params).
  private auth = inject(AuthService);
  private router = inject(Router);

  // Log in as a claimant, then route into the claimant area.
  // No real auth in scope — we hardcode a demo claimant identity. In a real system
  // this comes from validated credentials / a backend session.
  loginAsClaimant(): void {
    const user: CurrentUser = { id: 'u_01', name: 'John Tan', role: 'claimant' };
    this.auth.login(user);
    this.router.navigate(['/claimant']);
  }

  // Log in as a staff member, then route into the staff area.
  loginAsStaff(): void {
    const user: CurrentUser = { id: 's_01', name: 'Officer Lim', role: 'staff' };
    this.auth.login(user);
    this.router.navigate(['/staff']);
  }
}