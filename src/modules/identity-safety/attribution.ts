import type {
  Account,
  AnonymousAttributionProjection,
  ProfileClaim,
  PublicByline,
  PublicBylineProjection,
  PublicClaimProjection,
  RestrictedAttributionProjection,
} from "./model";

const reservedLabels = new Set([
  "anonymous reviewer",
  "review author",
  "moderator",
  "staff",
  "trust and safety",
]);

type BylineResult =
  | { readonly kind: "accepted"; readonly byline: PublicByline }
  | {
      readonly kind: "rejected";
      readonly code:
        | "display-name-required"
        | "reserved-label"
        | "rate-limited"
        | "impersonation-review";
    };

export function createOrEditByline(input: {
  readonly account: Account;
  readonly displayName: string;
  readonly photoUrl?: string;
  readonly now: Date;
  readonly editsInLastDay: number;
  readonly impersonationSignal: boolean;
}): BylineResult {
  const displayName = input.displayName.trim();
  if (!displayName) return { kind: "rejected", code: "display-name-required" };
  if (reservedLabels.has(displayName.toLocaleLowerCase())) {
    return { kind: "rejected", code: "reserved-label" };
  }
  if (input.editsInLastDay >= 3)
    return { kind: "rejected", code: "rate-limited" };
  if (input.impersonationSignal)
    return { kind: "rejected", code: "impersonation-review" };
  if (input.account.state !== "active")
    return { kind: "rejected", code: "rate-limited" };
  return {
    kind: "accepted",
    byline: {
      accountId: input.account.id,
      displayName,
      ...(input.photoUrl ? { photoUrl: input.photoUrl } : {}),
      claimedProfile: false,
      updatedAt: input.now,
    },
  };
}

export function publicBylineProjection(
  byline: PublicByline,
  account: Account,
  eligibility: {
    readonly claim: ProfileClaim | null;
    readonly recoveryReverificationRequired: boolean;
    readonly claimReverificationRequired: boolean;
  },
): PublicBylineProjection | null {
  if (account.state === "deleted") return null;
  const profileId = byline.profileId;
  const claimProjection = profileId
    ? publicClaimProjection(profileId, eligibility.claim, {
        id: account.id,
        state: account.state,
        verifiedContact: account.verifiedContact,
        recoveryReverificationRequired:
          eligibility.recoveryReverificationRequired,
        claimReverificationRequired: eligibility.claimReverificationRequired,
      })
    : null;
  return {
    kind: "named",
    displayName: byline.displayName,
    ...(byline.photoUrl ? { photoUrl: byline.photoUrl } : {}),
    ...(byline.claimedProfile && claimProjection?.claimed
      ? { profile: { id: claimProjection.profileId, claimed: true as const } }
      : {}),
  };
}

export function anonymousAttribution(): AnonymousAttributionProjection {
  return { kind: "anonymous", label: "Anonymous reviewer" };
}

export type PublicAttributionProjection =
  | AnonymousAttributionProjection
  | PublicBylineProjection
  | { readonly kind: "withheld"; readonly code: "attribution-unavailable" };

export function projectAttribution(input: {
  readonly mode: "anonymous" | "named";
  readonly available: boolean;
  readonly account: Account;
  readonly byline: PublicByline | null;
  readonly claim?: ProfileClaim | null;
  readonly recoveryReverificationRequired?: boolean;
  readonly claimReverificationRequired?: boolean;
}): PublicAttributionProjection {
  if (!input.available) {
    return { kind: "withheld", code: "attribution-unavailable" };
  }
  if (input.mode === "anonymous") return anonymousAttribution();
  if (!input.byline)
    return { kind: "withheld", code: "attribution-unavailable" };
  return (
    publicBylineProjection(input.byline, input.account, {
      claim: input.claim ?? null,
      recoveryReverificationRequired:
        input.recoveryReverificationRequired ?? true,
      claimReverificationRequired: input.claimReverificationRequired ?? true,
    }) ?? {
      kind: "withheld",
      code: "attribution-unavailable",
    }
  );
}

export const publicResponseAttribution = (
  attribution: PublicAttributionProjection,
): {
  readonly attribution: PublicAttributionProjection;
} => ({ attribution });

export const metadataAttribution = (
  attribution: PublicAttributionProjection,
): {
  readonly author: PublicAttributionProjection;
} => ({ author: attribution });

export const ordinaryLogAttribution = (
  attribution: PublicAttributionProjection,
): {
  readonly outcome: "rendered" | "withheld";
} => ({
  outcome: attribution.kind === "withheld" ? "withheld" : "rendered",
});

export const eventAttribution = (
  attribution: PublicAttributionProjection,
): {
  readonly actor: PublicAttributionProjection;
} => ({ actor: attribution });

export const exportAttribution = (
  attribution: PublicAttributionProjection,
): {
  readonly authoredAs: PublicAttributionProjection;
} => ({ authoredAs: attribution });

export const errorAttribution = (
  attribution: PublicAttributionProjection,
): {
  readonly code: "attribution-unavailable" | "none";
} => ({
  code: attribution.kind === "withheld" ? "attribution-unavailable" : "none",
});

export const notificationAttribution = (
  attribution: PublicAttributionProjection,
): {
  readonly actor: PublicAttributionProjection;
} => ({ actor: attribution });

export function restrictedAttributionFromAuditedRecord(input: {
  readonly accountId: string;
  readonly caseReason: string;
  readonly revealId: string;
  readonly auditId: string;
}): RestrictedAttributionProjection {
  if (!input.revealId || !input.auditId)
    throw new Error("Restricted attribution requires an audited reveal record");
  return { accountId: input.accountId, caseReason: input.caseReason };
}

export function linkVerifiedClaim(
  byline: PublicByline,
  claim: ProfileClaim,
  enabled: boolean,
): PublicByline {
  if (
    !enabled ||
    claim.state !== "verified" ||
    claim.accountId !== byline.accountId
  ) {
    const { profileId: _profileId, ...withoutProfile } = byline;
    return { ...withoutProfile, claimedProfile: false };
  }
  return { ...byline, profileId: claim.profileId, claimedProfile: true };
}

export function publicClaimProjection(
  profileId: string,
  claim: ProfileClaim | null,
  account: {
    readonly id: string;
    readonly state: Account["state"];
    readonly verifiedContact: boolean;
    readonly recoveryReverificationRequired: boolean;
    readonly claimReverificationRequired: boolean;
  },
): PublicClaimProjection {
  return {
    profileId,
    claimed:
      claim?.state === "verified" &&
      claim.profileId === profileId &&
      claim.accountId === account.id &&
      account.state === "active" &&
      account.verifiedContact &&
      !account.recoveryReverificationRequired &&
      !account.claimReverificationRequired,
  };
}
