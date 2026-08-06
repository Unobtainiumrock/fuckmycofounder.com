import { describe, expect, it } from "vitest";

import {
  abuseDecision,
  appealCase,
  applyEnforcement,
  authorizeDurableCommand,
  blockApplies,
  evaluatePolicy,
  intakeReport,
  reportStatusProjection,
  transitionModerationCase,
  type Account,
  type EnforcementOutcome,
  type RestrictedModerationCaseRecord,
  type ReportReason,
} from "@/src/modules/identity-safety";
import { findProjectionLeaks } from "@/tests/support/noninterference";

const now = new Date("2026-08-05T12:00:00.000Z");
const account: Account = {
  id: "account-a",
  state: "active",
  verifiedContact: true,
};
const other: Account = {
  id: "account-b",
  state: "active",
  verifiedContact: true,
};

describe("centralized policy", () => {
  const base = {
    account,
    action: "interact",
    blocked: false,
    capabilityEligible: true,
    policyAvailable: true,
    recentReauthentication: true,
    riskApproved: true,
    sensitive: false,
  } as const;

  it("issues a named durable-command decision only after central policy allows", () => {
    expect(
      authorizeDurableCommand({
        context: base,
        decisionId: "decision-a",
        capability: "report",
      }),
    ).toMatchObject({
      kind: "authorized-durable-command",
      actorId: "account-a",
      policyVersion: "identity-safety-v1",
    });
    expect(
      authorizeDurableCommand({
        context: { ...base, account: null },
        decisionId: "decision-b",
        capability: "report",
      }),
    ).toEqual({ kind: "deny", code: "action-not-available" });
  });

  it("returns allow, safe deny, explicit unmet requirement, and fail-closed unavailable", () => {
    expect(evaluatePolicy(base)).toEqual({
      kind: "allow",
      policyVersion: "identity-safety-v1",
    });
    expect(evaluatePolicy({ ...base, blocked: true })).toEqual({
      kind: "deny",
      code: "action-not-available",
    });
    expect(
      evaluatePolicy({
        ...base,
        sensitive: true,
        recentReauthentication: false,
      }),
    ).toEqual({
      kind: "unmet-requirement",
      requirement: "reauthenticate",
    });
    expect(evaluatePolicy({ ...base, policyAvailable: false })).toEqual({
      kind: "unavailable",
      retryable: true,
    });
  });

  it.each(["limited", "suspended", "deletion-pending", "deleted"] as const)(
    "denies ordinary action for %s without exposing account state",
    (state) => {
      const result = evaluatePolicy({
        ...base,
        account: accountInState(state),
      });
      expect(result).toEqual({ kind: "deny", code: "action-not-available" });
      expect(JSON.stringify(result)).not.toContain(state);
    },
  );
});

describe("blocking", () => {
  const blockedPairs = [{ blockerId: account.id, blockedId: other.id }];
  it.each([
    "direct-interaction",
    "targeted-discovery",
    "notification",
  ] as const)(
    "applies bidirectionally to %s without revealing direction",
    (surface) => {
      expect(
        blockApplies({
          viewerAccountId: other.id,
          actorAccountId: account.id,
          blockedPairs,
          surface,
        }),
      ).toBe(true);
    },
  );
  it("does not become a logged-out public takedown", () => {
    expect(
      blockApplies({
        actorAccountId: account.id,
        blockedPairs,
        surface: "public",
      }),
    ).toBe(false);
  });
});

describe("reports, moderation, enforcement, and appeals", () => {
  const reportInput = {
    id: "report-secret",
    caseId: "case-public-receipt",
    reporterAccount: account,
    targetId: "object-1",
    targetAvailable: true,
    intakeAvailable: true,
    reason: "harassment" as const,
    evidenceReferences: ["restricted-evidence"],
    createdAt: now,
    restrictedProjectionAuthorized: true,
  };

  it("requires an Account, deduplicates intake, and keeps reporter/evidence confidential", () => {
    expect(intakeReport({ ...reportInput, reporterAccount: null })).toEqual({
      kind: "authentication-required",
    });
    const first = intakeReport(reportInput);
    expect(first).toMatchObject({
      kind: "accepted",
      restricted: {
        moderationCase: { state: "received", reportIds: ["report-secret"] },
      },
    });
    if (first.kind !== "accepted") throw new Error("report not accepted");
    const duplicate = intakeReport({
      ...reportInput,
      existingCase: first.restricted.moderationCase,
    });
    expect(duplicate).toMatchObject({
      restricted: { moderationCase: { reportIds: ["report-secret"] } },
    });
    expect(
      intakeReport({
        ...reportInput,
        existingCase: transitionModerationCase(
          first.restricted.moderationCase,
          "closed",
        )!,
      }),
    ).toEqual({ kind: "case-closed", retryable: false });
    const status = reportStatusProjection(first.restricted.moderationCase);
    expect(
      findProjectionLeaks(status, {
        forbiddenKeys: ["reporterAccountId", "evidenceReferences"],
        forbiddenValues: [account.id, "restricted-evidence"],
      }),
    ).toEqual([]);
  });

  it("routes imminent harm urgently with literal emergency guidance", () => {
    const result = intakeReport({
      ...reportInput,
      reason: "threat-or-imminent-harm",
    });
    expect(result.kind).toBe("accepted");
    if (result.kind !== "accepted") throw new Error("urgent report rejected");
    expect(result.receipt.queue).toBe("urgent");
    expect(result.emergencyGuidance).toContain("emergency services");
  });

  it.each([
    "none",
    "changes-required",
    "visibility-limited",
    "removed",
    "account-limited",
    "account-suspended",
    "profile-claim-revoked",
  ] as const)(
    "keeps case state separate for %s enforcement",
    (outcome: EnforcementOutcome) => {
      const investigating: RestrictedModerationCaseRecord = {
        id: "case-1",
        targetId: "object-1",
        state: "investigating",
        queue: "ordinary",
        reportIds: ["report-1"],
      };
      const resolved = applyEnforcement({
        moderationCase: investigating,
        reviewerId: "moderator-a",
        outcome,
        policyReason: "conduct-rule",
        effectiveAt: now,
        scopeOrDuration: "object-only",
      });
      expect(resolved).toMatchObject({
        state: "resolved",
        enforcement: { outcome },
      });
      expect(investigating.state).toBe("investigating");
    },
  );

  it("requires a different appeal reviewer within 30 days and preserves original decision", () => {
    const investigating: RestrictedModerationCaseRecord = {
      id: "case-1",
      targetId: "object-1",
      state: "investigating",
      queue: "ordinary",
      reportIds: [],
    };
    const resolved = applyEnforcement({
      moderationCase: investigating,
      reviewerId: "moderator-a",
      outcome: "removed",
      policyReason: "doxxing",
      effectiveAt: now,
      scopeOrDuration: "permanent",
    })!;
    if (resolved.state !== "resolved") throw new Error("case not resolved");
    expect(
      appealCase({ moderationCase: resolved, reviewerId: "moderator-a", now }),
    ).toBeNull();
    const appealed = appealCase({
      moderationCase: resolved,
      reviewerId: "moderator-b",
      now,
    });
    expect(appealed).toMatchObject({
      state: "appealed",
      enforcement: resolved.enforcement,
    });
    expect(transitionModerationCase(appealed!, "closed")?.state).toBe("closed");
  });

  it.each([
    "impersonation",
    "harassment",
    "private-contact-information",
    "spam",
    "evasion",
    "brigading",
    "retaliation",
  ] as ReportReason[])("applies auditable abuse controls for %s", (reason) => {
    expect(
      abuseDecision({ reason, attempts: 6, coordinatedAccounts: 1 }),
    ).toEqual({
      allowed: false,
      reasonCode: `rate-limit:${reason}`,
    });
    expect(
      abuseDecision({ reason, attempts: 1, coordinatedAccounts: 3 }),
    ).toEqual({
      allowed: false,
      reasonCode: "coordinated-abuse",
    });
  });
});

function accountInState(state: Account["state"]): Account {
  if (state === "deletion-pending") {
    return {
      ...account,
      state,
      preDeletionState: "active",
      deletionRequestedAt: now,
    };
  }
  if (state === "deleted") {
    return {
      ...account,
      state,
      identityErasureDueAt: now,
      backupErasureDueAt: now,
    };
  }
  return { ...account, state };
}
