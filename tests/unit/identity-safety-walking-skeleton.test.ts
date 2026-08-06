import { describe, expect, it } from "vitest";

import {
  anonymousAttribution,
  createMemoryProtectedActionTransactions,
  executeProtectedAction,
  publicBylineProjection,
  type Account,
} from "@/src/modules/identity-safety";
import { composeNetworkContentSecurityPolicy } from "@/src/platform/http/security-headers";
import { findProjectionLeaks } from "@/tests/support/noninterference";

const now = new Date("2026-08-05T12:00:00.000Z");
const account: Account = {
  id: "account-private-123",
  state: "active",
  verifiedContact: true,
};

describe("identity and safety walking skeleton", () => {
  it("denies signed-out and atomically commits one authenticated action and audit", async () => {
    const transactions = createMemoryProtectedActionTransactions();
    const base = {
      actionId: "action-1",
      correlationId: "request-1",
      now,
      transactions,
    } as const;

    await expect(
      executeProtectedAction({
        ...base,
        context: {
          account: null,
          action: "save-protected-intent",
          blocked: false,
          capabilityEligible: true,
          policyAvailable: true,
          recentReauthentication: true,
          riskApproved: true,
          sensitive: false,
        },
      }),
    ).resolves.toEqual({ kind: "deny", code: "action-not-available" });

    await expect(
      executeProtectedAction({
        ...base,
        context: {
          account,
          action: "save-protected-intent",
          blocked: false,
          capabilityEligible: true,
          policyAvailable: true,
          recentReauthentication: true,
          riskApproved: true,
          sensitive: false,
        },
      }),
    ).resolves.toEqual({ kind: "committed", actionId: "action-1" });

    expect(transactions.snapshot()).toMatchObject({
      actions: [{ actionId: "action-1", actorAccountId: account.id }],
      audits: [{ id: "action-1:audit", resultingState: "committed" }],
      transactionCount: 1,
    });
  });

  it("renders separate named and anonymous public projections without private identity", () => {
    const named = publicBylineProjection(
      {
        accountId: account.id,
        displayName: "Ada Founder",
        claimedProfile: false,
        updatedAt: now,
      },
      account,
    );
    const anonymous = anonymousAttribution();
    const policy = {
      forbiddenKeys: ["accountId", "providerSubject", "email"],
      forbiddenValues: [account.id, "ada@example.test"],
    };

    expect(named).toEqual({ kind: "named", displayName: "Ada Founder" });
    expect(anonymous).toEqual({
      kind: "anonymous",
      label: "Anonymous reviewer",
    });
    expect(findProjectionLeaks({ named, anonymous }, policy)).toEqual([]);
  });

  it("allows exact deterministic auth origins only on network surfaces", () => {
    const policy = composeNetworkContentSecurityPolicy({
      firstPartyOrigin: "https://app.example.test",
      authenticationOrigins: [
        "https://accounts.google.test",
        "https://appleid.apple.test",
      ],
    });

    expect(policy).toContain(
      "connect-src 'self' https://app.example.test https://accounts.google.test https://appleid.apple.test",
    );
    expect(policy).not.toContain("https://unlisted.example.test");
  });
});
