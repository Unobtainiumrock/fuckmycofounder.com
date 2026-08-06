import { describe, expect, it } from "vitest";

import {
  accountExport,
  accountTransitionEffects,
  authenticateProtectedIntent,
  cancelDeletion,
  capabilitiesFor,
  completeReviewedRecovery,
  completeAuthentication,
  correctAuthenticationMethod,
  deletionConsequences,
  finalizeExpiredDeletion,
  linkAuthenticationMethod,
  isSafeLocalReturnPath,
  recoveryResponse,
  reauthenticationIsRecent,
  transitionAccount,
  type Account,
  type AuthenticationMethod,
  type ProtectedIntent,
} from "@/src/modules/identity-safety/server";
import { createDeterministicAuthenticationAdapter } from "@/src/platform/auth/deterministic-auth";
import { findProjectionLeaks } from "@/tests/support/noninterference";

const now = new Date("2026-08-05T12:00:00.000Z");
const intent: ProtectedIntent = {
  action: "file-report",
  draftReference: "local-draft",
  returnPath: "/reports/new",
};
const active: Account = {
  id: "account-a",
  state: "active",
  verifiedContact: true,
};
const method: AuthenticationMethod = {
  id: "google:subject-a",
  provider: "google",
  providerSubject: "subject-a",
  verifiedAt: now,
};

describe("Account authentication and lifecycle", () => {
  it.each(["google", "apple", "email-link"] as const)(
    "preserves protected intent through %s success, failure, and provider unavailability",
    async (provider) => {
      const adapter = createDeterministicAuthenticationAdapter({
        [provider]: { availability: "available", validProof: "valid-proof" },
      });
      await expect(
        adapter.authenticate({ provider, proof: "valid-proof", intent }),
      ).resolves.toMatchObject({
        kind: "authenticated",
        intent,
      });
      await expect(
        adapter.authenticate({ provider, proof: "expired", intent }),
      ).resolves.toEqual({
        kind: "retry",
        intent,
        code: "invalid-or-expired",
      });

      expect(
        completeAuthentication(
          { provider, availability: "unavailable", intent },
          { valid: false },
        ),
      ).toEqual({ kind: "retry", intent, code: "method-unavailable" });
    },
  );

  it("links methods only explicitly after recent reauthentication and never email-merges", () => {
    expect(
      linkAuthenticationMethod({
        existingMethods: [],
        newMethod: method,
        recentReauthentication: false,
        belongsToAnotherAccount: false,
      }),
    ).toEqual({ kind: "reauthentication-required" });
    expect(
      linkAuthenticationMethod({
        existingMethods: [],
        newMethod: method,
        recentReauthentication: true,
        belongsToAnotherAccount: true,
      }),
    ).toEqual({ kind: "account-conflict" });
    expect(
      correctAuthenticationMethod({
        methods: [method],
        replacement: {
          ...method,
          id: "google:subject-new",
          providerSubject: "subject-new",
        },
        replacedMethodId: method.id,
        recentReauthentication: true,
        belongsToAnotherAccount: false,
      }),
    ).toMatchObject({
      kind: "linked",
      methods: [{ id: "google:subject-new" }],
    });
    expect(recoveryResponse({ accountExists: true, throttled: false })).toEqual(
      recoveryResponse({ accountExists: false, throttled: true }),
    );
    expect(
      completeReviewedRecovery({
        approved: true,
        holdComplete: true,
        proofSufficient: true,
      }),
    ).toEqual({
      kind: "approved",
      revokePriorSessions: true,
      notifyVerifiedContacts: true,
      requireFreshAuthentication: true,
      requireClaimReverification: true,
    });
    expect(
      reauthenticationIsRecent(now, new Date(now.getTime() + 14 * 60_000)),
    ).toBe(true);
    expect(
      reauthenticationIsRecent(now, new Date(now.getTime() + 16 * 60_000)),
    ).toBe(false);
    expect(
      reauthenticationIsRecent(new Date(now.getTime() + 60_000), now),
    ).toBe(false);
  });

  it("validates local protected-intent return paths before calling auth", async () => {
    expect(isSafeLocalReturnPath("/reports/new")).toBe(true);
    expect(isSafeLocalReturnPath("//evil.test")).toBe(false);
    expect(isSafeLocalReturnPath("/\\evil.test")).toBe(false);
    await expect(
      authenticateProtectedIntent(
        {
          provider: "google",
          proof: "proof",
          intent: { ...intent, returnPath: "/\\evil.test" },
        },
        () =>
          Promise.resolve({ kind: "retry", intent, code: "method-disabled" }),
      ),
    ).resolves.toEqual({
      kind: "retry",
      intent: { ...intent, returnPath: "/" },
      code: "invalid-or-expired",
    });
  });

  it.each([
    ["active", true],
    ["limited", false],
    ["suspended", false],
    ["deletion-pending", false],
    ["deleted", false],
  ] as const)("applies the %s capability matrix", (state, mayAct) => {
    expect(
      capabilitiesFor(accountInState(state)).includes("protected-action"),
    ).toBe(mayAct);
    expect(
      accountTransitionEffects("active", state).ordinaryCapabilitiesDisabled,
    ).toBe(state !== "active");
  });

  it.each(["suspended", "deletion-pending", "deleted"] as const)(
    "revokes sessions on %s transition",
    (state) =>
      expect(accountTransitionEffects("active", state).revokeSessions).toBe(
        true,
      ),
  );

  it("schedules, cancels, finalizes, and assigns bounded erasure deadlines", () => {
    const pending = transitionAccount(active, "deletion-pending", now)!;
    expect(
      cancelDeletion(pending, new Date(now.getTime() + 29 * 86_400_000))?.state,
    ).toBe("active");
    const finalized = finalizeExpiredDeletion(
      pending,
      new Date(now.getTime() + 30 * 86_400_000),
    );
    expect(finalized).toMatchObject({
      state: "deleted",
      identityErasureDueAt: new Date("2026-10-04T12:00:00.000Z"),
      backupErasureDueAt: new Date("2026-12-03T12:00:00.000Z"),
    });
    expect(deletionConsequences()).toContain(
      "public Profile remains independent",
    );
  });

  it("exports only the Account holder's authorized private data", () => {
    const exported = accountExport({
      account: active,
      methods: [method],
      byline: { displayName: "Ada Founder" },
      requesterAccountId: active.id,
      recentReauthentication: true,
    });
    expect(exported).toMatchObject({
      account: { id: "account-a", state: "active" },
    });
    expect(
      findProjectionLeaks(exported, {
        forbiddenKeys: ["reporterId", "blockedAccountId", "anonymousAuthorId"],
        forbiddenValues: ["account-other"],
      }),
    ).toEqual([]);
    expect(
      accountExport({
        account: active,
        methods: [method],
        byline: null,
        requesterAccountId: "account-other",
        recentReauthentication: true,
      }),
    ).toEqual({ kind: "not-authorized" });
  });
});

function accountInState(state: Account["state"]): Account {
  if (state === "deletion-pending") {
    return {
      ...active,
      state,
      preDeletionState: "active",
      deletionRequestedAt: now,
    };
  }
  if (state === "deleted") {
    return {
      ...active,
      state,
      identityErasureDueAt: now,
      backupErasureDueAt: now,
    };
  }
  return { ...active, state };
}
