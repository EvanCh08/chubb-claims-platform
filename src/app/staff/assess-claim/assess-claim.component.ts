import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ClaimService } from '../../core/services/claim.service';
import { Claim } from '../../core/models/claim.model';

@Component({
  selector: 'app-assess-claim',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './assess-claim.component.html',
  styleUrl: './assess-claim.component.css',
})
export class AssessClaimComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private claimService = inject(ClaimService);
  private fb = inject(FormBuilder);

  // Read the :id from the URL (/staff/assess/c_1002 → 'c_1002').
  private claimId = this.route.snapshot.paramMap.get('id')!;

  // Find THIS claim in the stream by its id, so we can show its details.
  claim$: Observable<Claim | undefined> = this.claimService.claims$.pipe(
    map(claims => claims.find(c => c.id === this.claimId))
  );

  // Settle form: amount required + positive, plus an optional decision note.
  settleForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    note: [''],
  });

  // Reject form: a reason is required.
  rejectForm = this.fb.group({
    reason: ['', Validators.required],
  });

  settle(): void {
    if (this.settleForm.invalid) {
      this.settleForm.markAllAsTouched();
      return;
    }
    const { amount, note } = this.settleForm.value;
    const decision = note?.trim() ? note : 'Claim approved.';
    this.claimService.settleClaim(this.claimId, amount!, decision!);
    this.router.navigate(['/staff/queue']);   // back to the queue
  }

  reject(): void {
    if (this.rejectForm.invalid) {
      this.rejectForm.markAllAsTouched();
      return;
    }
    const { reason } = this.rejectForm.value;
    this.claimService.rejectClaim(this.claimId, reason!);
    this.router.navigate(['/staff/queue']);
  }
}