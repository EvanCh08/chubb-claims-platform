import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ClaimService } from '../../core/services/claim.service';
import { AuthService } from '../../core/services/auth.service';
import { ClaimType } from '../../core/models/claim.model';

@Component({
  selector: 'app-report-claim',
  standalone: true,
  // ReactiveFormsModule gives the template the form directives (formGroup, formControlName).
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './report-claim.component.html',
  styleUrl: './report-claim.component.css',
})
export class ReportClaimComponent {
  private fb = inject(FormBuilder);
  private claimService = inject(ClaimService);
  private auth = inject(AuthService);
  private router = inject(Router);

  // The form model, defined in TS (that's the "reactive" part — form state lives here,
  // not in the template). Each control has an initial value + validation rules.
  claimForm = this.fb.group({
    type: ['motor' as ClaimType, Validators.required],
    description: ['', [Validators.required, Validators.minLength(10)]],
    estimatedAmount: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  submit(): void {
    // If the form is invalid, mark all fields touched so errors show, and stop.
    if (this.claimForm.invalid) {
      this.claimForm.markAllAsTouched();
      return;
    }

    const user = this.auth.currentUser;
    if (!user) return; // shouldn't happen — guard ensures a claimant is logged in

    const { type, description, estimatedAmount } = this.claimForm.value;

    // Hand the claim to the service. The service generates id/createdAt and sets
    // status 'submitted', then pushes it into the BehaviorSubject.
    this.claimService.addClaim({
      claimantId: user.id,
      claimantName: user.name,
      type: type!,                       // '!' — we know these are set (form is valid)
      description: description!,
      estimatedAmount: estimatedAmount!,
    });

    // Go to the track page — the new claim will already be there, because the track
    // list subscribes to the same BehaviorSubject we just updated.
    this.router.navigate(['/claimant/track']);
  }
}