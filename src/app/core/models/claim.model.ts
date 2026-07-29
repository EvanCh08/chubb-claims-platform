// The single shared contract for a claim, used by both claimants and staff.
// One model represents a claim at EVERY lifecycle stage — which is why the
// later-stage fields are optional (they're absent until staff act on the claim).

// Restrict type/status to a fixed set of values, so an invalid value
// (e.g. a typo like 'moter') is caught by TypeScript rather than slipping through.
export type ClaimType = 'motor' | 'property';

export type ClaimStatus = 'submitted' | 'in_review' | 'settled' | 'rejected'; // main lifecycle statuses

export interface Claim {
  id: string;                // unique key to target a single claim (settle/assign/reject act on this)
  claimantId: string;        // stable reference to who filed it — the key used to filter a claimant to their own claims
  claimantName: string;      // display only — so a human can read whose claim this is; never used for logic
  type: ClaimType;
  status: ClaimStatus;
  description: string;        // claimant's account of the incident
  estimatedAmount: number;   // insurer's estimate of the payout — this is what liability exposure sums over
  createdAt: string;         // ISO date string — when the claim was submitted

  // --- Optional: absent until a later lifecycle stage ---
  assignedTo?: string;       // set when a staff member picks up the claim (before that, unassigned)
  decision?: string;         // set when the claim is settled or rejected — the outcome/reason
  settledAmount?: number;    // set only when the claim is settled — the actual amount paid out
}