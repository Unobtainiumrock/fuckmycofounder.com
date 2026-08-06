export type AccountState =
  | "active"
  | "limited"
  | "suspended"
  | "deletion-pending"
  | "deleted";

export type AccountCapability =
  | "appeal"
  | "delete-account"
  | "export-data"
  | "protected-action"
  | "read-notices";

export interface Account {
  readonly id: string;
  readonly state: AccountState;
  readonly preDeletionState?: Exclude<
    AccountState,
    "deletion-pending" | "deleted"
  >;
  readonly deletionRequestedAt?: Date;
  readonly identityErasureDueAt?: Date;
  readonly backupErasureDueAt?: Date;
  readonly verifiedContact: boolean;
}

export type AuthenticationProvider = "apple" | "email-link" | "google";
export type ProviderAvailability = "available" | "disabled" | "unavailable";

export interface ProtectedIntent {
  readonly action: string;
  readonly draftReference?: string;
  readonly returnPath: string;
}

export interface AuthenticationMethod {
  readonly id: string;
  readonly provider: AuthenticationProvider;
  readonly providerSubject: string;
  readonly verifiedAt: Date;
}

export interface PublicByline {
  readonly accountId: string;
  readonly displayName: string;
  readonly photoUrl?: string;
  readonly profileId?: string;
  readonly claimedProfile: boolean;
  readonly updatedAt: Date;
}

export interface PublicBylineProjection {
  readonly kind: "named";
  readonly displayName: string;
  readonly photoUrl?: string;
  readonly profile?: { readonly id: string; readonly claimed: true };
}

export interface AnonymousAttributionProjection {
  readonly kind: "anonymous";
  readonly label: "Anonymous reviewer";
}

export interface RestrictedAttributionProjection {
  readonly accountId: string;
  readonly caseReason: string;
}

export type ProfileClaimState = "pending" | "verified" | "rejected" | "revoked";

export interface ProfileClaim {
  readonly id: string;
  readonly accountId: string;
  readonly profileId: string;
  readonly state: ProfileClaimState;
  readonly evidenceKind:
    | "authoritative-control"
    | "human-review"
    | "surface-attribute";
  readonly decidedAt?: Date;
  readonly appealDeadline?: Date;
  readonly evidenceExpiresAt?: Date;
}

export interface PublicClaimProjection {
  readonly profileId: string;
  readonly claimed: boolean;
}

export type PolicyOutcome =
  | { readonly kind: "allow"; readonly policyVersion: string }
  | { readonly kind: "deny"; readonly code: "action-not-available" }
  | {
      readonly kind: "unmet-requirement";
      readonly requirement: "reauthenticate" | "verified-contact";
    }
  | { readonly kind: "unavailable"; readonly retryable: true };

export interface PolicyContext {
  readonly account: Account | null;
  readonly action: string;
  readonly blocked: boolean;
  readonly capabilityEligible: boolean;
  readonly policyAvailable: boolean;
  readonly recentReauthentication: boolean;
  readonly riskApproved: boolean;
  readonly sensitive: boolean;
}

export type ModerationCaseState =
  | "received"
  | "triaged"
  | "investigating"
  | "resolved"
  | "appealed"
  | "closed";

export type EnforcementOutcome =
  | "none"
  | "changes-required"
  | "visibility-limited"
  | "removed"
  | "account-limited"
  | "account-suspended"
  | "profile-claim-revoked";

export interface Report {
  readonly id: string;
  readonly caseId: string;
  readonly reporterAccountId: string;
  readonly targetId: string;
  readonly reason: ReportReason;
  readonly context?: string;
  readonly evidenceReferences: readonly string[];
  readonly createdAt: Date;
}

export type ReportReason =
  | "impersonation"
  | "harassment"
  | "private-contact-information"
  | "threat-or-imminent-harm"
  | "spam"
  | "evasion"
  | "brigading"
  | "retaliation"
  | "other";

export interface ModerationCase {
  readonly id: string;
  readonly targetId: string;
  readonly state: ModerationCaseState;
  readonly queue: "ordinary" | "urgent";
  readonly reportIds: readonly string[];
  readonly originalReviewerId?: string;
  readonly enforcement?: EnforcementAction;
  readonly appealDeadline?: Date;
}

export interface EnforcementAction {
  readonly outcome: EnforcementOutcome;
  readonly policyReason: string;
  readonly effectiveAt: Date;
  readonly scopeOrDuration: string;
  readonly appealable: boolean;
}

export interface AuditEvent {
  readonly id: string;
  readonly category:
    | "identity"
    | "claim"
    | "policy"
    | "moderation"
    | "enforcement"
    | "appeal"
    | "retention";
  readonly actorRole: string;
  readonly occurredAt: Date;
  readonly reasonCode: string;
  readonly policyVersion: string;
  readonly priorState: string | null;
  readonly resultingState: string;
  readonly restrictedEvidenceReferences: readonly string[];
}

export type StaffRole = "support" | "moderator" | "identity-reviewer" | "legal";
export type RestrictedField =
  | "authentication-data"
  | "anonymous-author-linkage"
  | "block-direction"
  | "claim-evidence"
  | "legal-hold"
  | "reporter-identity"
  | "risk-signals";

export interface RetainedRecord {
  readonly id: string;
  readonly category:
    | "private-identity"
    | "recovery"
    | "claim-evidence"
    | "anonymous-linkage"
    | "safety-audit"
    | "backup";
  readonly expiresAt: Date;
  readonly legalHold: boolean;
  readonly appealActive: boolean;
  readonly payloadPresent: boolean;
}
