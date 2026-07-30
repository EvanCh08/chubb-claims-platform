import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-staff-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './staff-home.component.html',
  styleUrl: './staff-home.component.css',
})
export class StaffHomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  currentUser = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}