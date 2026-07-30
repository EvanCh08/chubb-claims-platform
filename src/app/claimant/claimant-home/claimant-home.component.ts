import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-claimant-home',
  standalone: true,
  imports: [RouterOutlet, RouterLink],   // RouterOutlet = where child pages render; RouterLink = nav links
  templateUrl: './claimant-home.component.html',
  styleUrl: './claimant-home.component.css',
})
export class ClaimantHomeComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  // Show who's logged in, for the header.
  currentUser = this.auth.currentUser;

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}