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
): PublicBylineProjection | null {
  if (account.state === "deleted") return null;
  return {
    kind: "named",
    displayName: byline.displayName,
    ...(byline.photoUrl ? { photoUrl: byline.photoUrl } : {}),
    ...(byline.claimedProfile && byline.profileId
      ? { profile: { id: byline.profileId, claimed: true as const } }
      : {}),
  };
}

export function anonymousAttribution(): AnonymousAttributionProjection {
  return { kind: "anonymous", label: "Anonymous reviewer" };
}

type PublicAttributionProjection =
  | AnonymousAttributionProjection
  | PublicBylineProjection
  | { readonly kind: "withheld"; readonly code: "attribution-unavailable" };

export function projectAttribution(input: {
  readonly mode: "anonymous" | "named";
  readonly available: boolean;
  readonly account: Account;
  readonly byline: PublicByline | null;
}): PublicAttributionProjection {
  if (!input.available) {
    return { kind: "withheld", code: "attribution-unavailable" };
  }
  if (input.mode === "anonymous") return anonymousAttribution();
  if (!input.byline)
    return { kind: "withheld", code: "attribution-unavailable" };
  return (
    publicBylineProjection(input.byline, input.account) ?? {
      kind: "withheld",
      code: "attribution-unavailable",
    }
  );
}

type AttributionInput = Parameters<typeof projectAttribution>[0];

export const publicResponseAttribution = (
  input: AttributionInput,
): {
  readonly attribution: PublicAttributionProjection;
} => ({ attribution: projectAttribution(input) });

export const metadataAttribution = (
  input: AttributionInput,
): {
  readonly author: PublicAttributionProjection;
} => ({ author: projectAttribution(input) });

export const ordinaryLogAttribution = (
  input: AttributionInput,
): {
  readonly outcome: "rendered" | "withheld";
} => ({
  outcome:
    projectAttribution(input).kind === "withheld" ? "withheld" : "rendered",
});

export const eventAttribution = (
  input: AttributionInput,
): {
  readonly actor: PublicAttributionProjection;
} => ({ actor: projectAttribution(input) });

export const exportAttribution = (
  input: AttributionInput,
): {
  readonly authoredAs: PublicAttributionProjection;
} => ({ authoredAs: projectAttribution(input) });

export const errorAttribution = (
  input: AttributionInput,
): {
  readonly code: "attribution-unavailable" | "none";
} => ({
  code:
    projectAttribution(input).kind === "withheld"
      ? "attribution-unavailable"
      : "none",
});

export const notificationAttribution = (
  input: AttributionInput,
): {
  readonly actor: PublicAttributionProjection;
} => ({ actor: projectAttribution(input) });

export function restrictedAttribution(input: {
  readonly accountId: string;
  readonly caseReason: string;
  readonly authorized: boolean;
}): RestrictedAttributionProjection | null {
  return input.authorized
    ? { accountId: input.accountId, caseReason: input.caseReason }
    : null;
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
): PublicClaimProjection {
  return { profileId, claimed: claim?.state === "verified" };
}
