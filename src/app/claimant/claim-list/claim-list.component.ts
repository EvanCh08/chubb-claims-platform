import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClaimService } from '../../core/services/claim.service';
import { AuthService } from '../../core/services/auth.service';
import { Claim } from '../../core/models/claim.model';

@Component({
  selector: 'app-claim-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './claim-list.component.html',
  styleUrl: './claim-list.component.css',
})
export class ClaimListComponent {
  private claimService = inject(ClaimService);
  private auth = inject(AuthService);

  // This claimant's own claims — filter the full stream by their claimantId.
  myClaims$: Observable<Claim[]> = this.claimService.claims$.pipe(
    map(claims => claims.filter(c => c.claimantId === this.auth.currentUser?.id))
  );
}