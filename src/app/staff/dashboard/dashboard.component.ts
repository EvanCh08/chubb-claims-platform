import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClaimService } from '../../core/services/claim.service';
import { Claim } from '../../core/models/claim.model';

// A small shape for the dashboard's summary numbers.
interface DashboardStats {
  totalClaims: number;
  openClaims: number;
  settledClaims: number;
  rejectedClaims: number;
  totalExposure: number;          // sum of estimatedAmount for open claims
  perOfficer: { officer: string; count: number }[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  private claimService = inject(ClaimService);

  // Derive all the dashboard numbers reactively from the claims stream.
  // Because this is built on claims$, it updates live: settle a claim and the
  // exposure figure drops immediately.
  stats$: Observable<DashboardStats> = this.claimService.claims$.pipe(
    map(claims => this.computeStats(claims))
  );

  private computeStats(claims: Claim[]): DashboardStats {
    const isOpen = (c: Claim) => c.status !== 'settled' && c.status !== 'rejected';

    // Count how many claims each officer is handling (only assigned ones).
    const officerCounts = new Map<string, number>();
    for (const c of claims) {
      if (c.assignedTo) {
        officerCounts.set(c.assignedTo, (officerCounts.get(c.assignedTo) ?? 0) + 1);
      }
    }
    const perOfficer = Array.from(officerCounts, ([officer, count]) => ({ officer, count }));

    return {
      totalClaims: claims.length,
      openClaims: claims.filter(isOpen).length,
      settledClaims: claims.filter(c => c.status === 'settled').length,
      rejectedClaims: claims.filter(c => c.status === 'rejected').length,
      // Total liability exposure = sum of estimatedAmount across OPEN claims.
      totalExposure: claims.filter(isOpen).reduce((sum, c) => sum + c.estimatedAmount, 0),
      perOfficer,
    };
  }
}