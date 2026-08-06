import { describe, expect, it } from "vitest";

import {
  createOrEditByline,
  errorAttribution,
  eventAttribution,
  exportAttribution,
  linkVerifiedClaim,
  metadataAttribution,
  notificationAttribution,
  ordinaryLogAttribution,
  projectAttribution,
  publicResponseAttribution,
  publicBylineProjection,
  restrictedAttribution,
  type Account,
  type ProfileClaim,
  type PublicByline,
} from "@/src/modules/identity-safety";
import { findProjectionLeaks } from "@/tests/support/noninterference";

const now = new Date("2026-08-05T12:00:00.000Z");
const account: Account = {
  id: "account-secret",
  state: "active",
  verifiedContact: true,
};
const byline: PublicByline = {
  accountId: account.id,
  displayName: "Ada Founder",
  claimedProfile: false,
  updatedAt: now,
};
const claim: ProfileClaim = {
  id: "claim-secret",
  accountId: account.id,
  profileId: "profile-public",
  state: "verified",
  evidenceKind: "human-review",
  decidedAt: now,
  appealDeadline: new Date("2026-09-04T12:00:00.000Z"),
  evidenceExpiresAt: new Date("2026-11-03T12:00:00.000Z"),
};

describe("Public Bylines and attribution", () => {
  it("creates a byline only for named participation and never creates a Profile", () => {
    const result = createOrEditByline({
      account,
      displayName: " Ada Founder ",
      now,
      editsInLastDay: 0,
      impersonationSignal: false,
    });
    expect(result).toMatchObject({
      kind: "accepted",
      byline: { displayName: "Ada Founder", claimedProfile: false },
    });
    expect(result).not.toHaveProperty("byline.profileId");
  });

  it.each(["Anonymous reviewer", "Review author", "Moderator", "Staff"])(
    "rejects reserved authority label %s",
    (displayName) => {
      expect(
        createOrEditByline({
          account,
          displayName,
          now,
          editsInLastDay: 0,
          impersonationSignal: false,
        }),
      ).toEqual({ kind: "rejected", code: "reserved-label" });
    },
  );

  it("rate-limits rapid changes and routes impersonation signals to review", () => {
    expect(
      createOrEditByline({
        account,
        displayName: "Ada",
        now,
        editsInLastDay: 3,
        impersonationSignal: false,
      }),
    ).toEqual({ kind: "rejected", code: "rate-limited" });
    expect(
      createOrEditByline({
        account,
        displayName: "Famous Person",
        now,
        editsInLastDay: 0,
        impersonationSignal: true,
      }),
    ).toEqual({ kind: "rejected", code: "impersonation-review" });
  });

  it("links only an explicitly enabled verified claim and removes stale claim markers", () => {
    expect(
      publicBylineProjection(linkVerifiedClaim(byline, claim, true), account),
    ).toEqual({
      kind: "named",
      displayName: "Ada Founder",
      profile: { id: "profile-public", claimed: true },
    });
    expect(
      publicBylineProjection(
        linkVerifiedClaim(byline, { ...claim, state: "revoked" }, true),
        account,
      ),
    ).toEqual({ kind: "named", displayName: "Ada Founder" });
  });

  it("uses one fail-closed anonymous isolation seam across all downstream surfaces", () => {
    const anonymous = projectAttribution({
      mode: "anonymous",
      available: true,
      account,
      byline,
    });
    const input = {
      mode: "anonymous" as const,
      available: true,
      account,
      byline,
    };
    const surfaces = {
      response: publicResponseAttribution(input),
      metadata: metadataAttribution(input),
      logs: ordinaryLogAttribution(input),
      events: eventAttribution(input),
      export: exportAttribution(input),
      errors: errorAttribution(input),
      notification: notificationAttribution(input),
    };
    expect(anonymous).toEqual({
      kind: "anonymous",
      label: "Anonymous reviewer",
    });
    expect(
      findProjectionLeaks(surfaces, {
        forbiddenKeys: [
          "accountId",
          "profileId",
          "providerSubject",
          "stablePseudonym",
        ],
        forbiddenValues: [account.id, byline.displayName, claim.id],
      }),
    ).toEqual([]);
    expect(
      projectAttribution({
        mode: "anonymous",
        available: false,
        account,
        byline,
      }),
    ).toEqual({ kind: "withheld", code: "attribution-unavailable" });
  });

  it("reveals anonymous linkage only through the restricted authorized interface", () => {
    expect(
      restrictedAttribution({
        accountId: account.id,
        caseReason: "case-1",
        authorized: false,
      }),
    ).toBeNull();
    expect(
      restrictedAttribution({
        accountId: account.id,
        caseReason: "case-1",
        authorized: true,
      }),
    ).toEqual({ accountId: account.id, caseReason: "case-1" });
  });
});
