import { describe, expect, it } from "vitest";

import {
  claimNotice,
  decideProfileClaim,
  linkVerifiedClaim,
  publicClaimProjection,
  runRetention,
  transitionProfileClaim,
  type Account,
  type ProfileClaim,
  type PublicByline,
} from "@/src/modules/identity-safety";
import { findProjectionLeaks } from "@/tests/support/noninterference";

const now = new Date("2026-08-05T12:00:00.000Z");
const account: Account = {
  id: "account-private",
  state: "active",
  verifiedContact: true,
};
const pending: ProfileClaim = {
  id: "claim-private",
  accountId: account.id,
  profileId: "profile-public",
  state: "pending",
  evidenceKind: "authoritative-control",
};

describe("Profile Claim foundation", () => {
  it("verifies only scoped proof with contact, active account, and recent reauthentication", () => {
    expect(
      decideProfileClaim({
        claim: pending,
        account,
        recentReauthentication: true,
        accountHasVerifiedClaim: false,
        profileHasVerifiedClaim: false,
        now,
      }),
    ).toMatchObject({ kind: "accepted", claim: { state: "verified" } });
    expect(
      decideProfileClaim({
        claim: { ...pending, evidenceKind: "surface-attribute" },
        account,
        recentReauthentication: true,
        accountHasVerifiedClaim: false,
        profileHasVerifiedClaim: false,
        now,
      }),
    ).toEqual({ kind: "review-required", code: "insufficient-proof" });
  });

  it.each([
    [true, false, "account-already-claimed"],
    [false, true, "profile-already-claimed"],
  ] as const)(
    "enforces exclusive ownership",
    (accountTaken, profileTaken, code) => {
      expect(
        decideProfileClaim({
          claim: pending,
          account,
          recentReauthentication: true,
          accountHasVerifiedClaim: accountTaken,
          profileHasVerifiedClaim: profileTaken,
          now,
        }),
      ).toEqual({ kind: "review-required", code });
    },
  );

  it("keeps claim, Account, and byline states independent on revocation and appeal", () => {
    const verified = transitionProfileClaim(pending, "verified", now)!;
    const byline: PublicByline = {
      accountId: account.id,
      displayName: "Ada Founder",
      claimedProfile: false,
      updatedAt: now,
    };
    const linked = linkVerifiedClaim(byline, verified, true);
    const revoked = transitionProfileClaim(verified, "revoked", now)!;

    expect(linked.claimedProfile).toBe(true);
    expect(linkVerifiedClaim(linked, revoked, true)).toMatchObject({
      claimedProfile: false,
    });
    expect(account.state).toBe("active");
    expect(claimNotice(revoked)).toMatchObject({ state: "revoked" });
  });

  it("projects only claimed state and expires raw evidence after 90 days", () => {
    const verified = transitionProfileClaim(pending, "verified", now)!;
    const projection = publicClaimProjection("profile-public", verified);
    expect(projection).toEqual({ profileId: "profile-public", claimed: true });
    expect(
      findProjectionLeaks(projection, {
        forbiddenKeys: ["accountId", "evidenceKind", "decidedAt", "reviewerId"],
        forbiddenValues: [account.id, pending.id],
      }),
    ).toEqual([]);

    const result = runRetention(
      [
        {
          id: pending.id,
          category: "claim-evidence",
          expiresAt: verified.evidenceExpiresAt!,
          legalHold: false,
          appealActive: false,
          payloadPresent: true,
        },
      ],
      verified.evidenceExpiresAt!,
    );
    expect(result.records[0]?.payloadPresent).toBe(false);
  });
});
