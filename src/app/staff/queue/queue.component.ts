import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-queue',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './queue.component.html',
  styleUrl: './queue.component.css',
})
export class QueueComponent {
  private claimService = inject(ClaimService);
  private auth = inject(AuthService);

  // Staff see ALL claims (unlike claimants, who see only their own).
  claims$ = this.claimService.claims$;

  // "Pick up" a submitted claim: assign it to the current officer, move to in_review.
  pickUp(claimId: string): void {
    const officer = this.auth.currentUser?.name ?? 'Unknown';
    this.claimService.assignClaim(claimId, officer);
  }
}