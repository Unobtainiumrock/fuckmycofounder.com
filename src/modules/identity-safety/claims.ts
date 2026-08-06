import type { Account, ProfileClaim, ProfileClaimState } from "./model";

const claimTransitions: Readonly<
  Record<ProfileClaimState, readonly ProfileClaimState[]>
> = {
  pending: ["verified", "rejected", "revoked"],
  verified: ["revoked"],
  rejected: ["pending"],
  revoked: ["pending"],
};

type ClaimDecision =
  | { readonly kind: "accepted"; readonly claim: ProfileClaim }
  | {
      readonly kind: "review-required";
      readonly code:
        | "insufficient-proof"
        | "reauthentication-required"
        | "verified-contact-required"
        | "account-already-claimed"
        | "profile-already-claimed";
    };

export function decideProfileClaim(input: {
  readonly claim: ProfileClaim;
  readonly account: Account;
  readonly recentReauthentication: boolean;
  readonly accountHasVerifiedClaim: boolean;
  readonly profileHasVerifiedClaim: boolean;
  readonly now: Date;
}): ClaimDecision {
  if (!input.recentReauthentication) {
    return { kind: "review-required", code: "reauthentication-required" };
  }
  if (!input.account.verifiedContact || input.account.state !== "active") {
    return { kind: "review-required", code: "verified-contact-required" };
  }
  if (input.accountHasVerifiedClaim) {
    return { kind: "review-required", code: "account-already-claimed" };
  }
  if (input.profileHasVerifiedClaim) {
    return { kind: "review-required", code: "profile-already-claimed" };
  }
  if (input.claim.evidenceKind === "surface-attribute") {
    return { kind: "review-required", code: "insufficient-proof" };
  }
  return {
    kind: "accepted",
    claim: transitionProfileClaim(input.claim, "verified", input.now)!,
  };
}

export function transitionProfileClaim(
  claim: ProfileClaim,
  state: ProfileClaimState,
  now: Date,
): ProfileClaim | null {
  if (!claimTransitions[claim.state].includes(state)) return null;
  const base = {
    id: claim.id,
    accountId: claim.accountId,
    profileId: claim.profileId,
    evidenceKind: claim.evidenceKind,
  } as const;
  if (state === "pending") return { ...base, state };
  return {
    ...base,
    state,
    decidedAt: now,
    appealDeadline: addDays(now, 30),
    evidenceExpiresAt: addDays(now, 90),
  };
}

export function claimNotice(claim: ProfileClaim): {
  readonly state: ProfileClaimState;
  readonly appealDeadline?: Date;
  readonly message: string;
} {
  const deadline =
    claim.state === "pending" ? {} : { appealDeadline: claim.appealDeadline };
  return {
    state: claim.state,
    ...deadline,
    message:
      claim.state === "verified"
        ? "Profile Claim verified."
        : claim.state === "pending"
          ? "Profile Claim is under review."
          : `Profile Claim ${claim.state}. You may appeal within 30 days.`,
  };
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
