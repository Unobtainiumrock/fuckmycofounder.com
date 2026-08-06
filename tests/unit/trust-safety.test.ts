import { describe, expect, it } from "vitest";

import {
  abuseDecision,
  appealCase,
  applyEnforcement,
  authorizeDurableCommand,
  authorizeStaffCommand,
  authorizeStaffIdentityProof,
  blockApplies,
  evaluatePolicy,
  intakeReport,
  matchesAuthorizedDurableCommand,
  prepareRestrictedReportIntake,
  reportStatusProjection,
  transitionModerationCase,
  type Account,
  type EnforcementOutcome,
  type RestrictedModerationCaseRecord,
  type ReportReason,
} from "@/src/modules/identity-safety/server";
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
    action: "report-create",
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
        capability: "trust-safety.report",
        targetKind: "report",
        targetId: "report-a",
      }),
    ).toMatchObject({
      kind: "authorized-durable-command",
      actorId: "account-a",
      policyVersion: "identity-safety-v1",
      targetId: "report-a",
    });
    expect(
      authorizeDurableCommand({
        context: { ...base, account: null },
        decisionId: "decision-b",
        capability: "trust-safety.report",
        targetKind: "report",
        targetId: "report-a",
      }),
    ).toEqual({ kind: "deny", code: "action-not-available" });
    const issued = authorizeDurableCommand({
      context: base,
      decisionId: "decision-c",
      capability: "trust-safety.report",
      targetKind: "report",
      targetId: "report-a",
    });
    expect(issued.kind).toBe("authorized-durable-command");
    if (issued.kind !== "authorized-durable-command") return;
    expect(
      matchesAuthorizedDurableCommand(issued, {
        actorId: account.id,
        action: "report-create",
        capability: "trust-safety.report",
        targetKind: "report",
        targetId: "report-a",
      }),
    ).toBe(true);
    expect(
      matchesAuthorizedDurableCommand(issued, {
        actorId: account.id,
        action: "interact",
        capability: "enforce",
        targetKind: "content",
        targetId: "content-a",
      }),
    ).toBe(false);
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

  it.each([
    ["limited", "account-export", "account.export"],
    ["suspended", "moderation-appeal", "trust-safety.appeal"],
    ["deletion-pending", "cancel-deletion", "account.lifecycle"],
  ] as const)(
    "allows the explicit restricted capability for %s",
    (state, action, capability) => {
      expect(
        authorizeDurableCommand({
          context: {
            ...base,
            action,
            account: accountInState(state),
          },
          decisionId: `${state}:${action}`,
          capability,
          targetKind: "account",
          targetId: account.id,
        }),
      ).toMatchObject({ kind: "authorized-durable-command" });
    },
  );

  it("does not issue an Account lifecycle capability for another Account", () => {
    expect(
      authorizeDurableCommand({
        context: { ...base, action: "request-deletion" },
        decisionId: "cross-account-deletion",
        capability: "account.lifecycle",
        targetKind: "account",
        targetId: other.id,
      }),
    ).toEqual({ kind: "deny", code: "action-not-available" });
  });

  it("does not let an ordinary Account mint privileged commands", () => {
    expect(
      authorizeDurableCommand({
        context: { ...base, action: "moderation-enforce" },
        decisionId: "forged-moderation",
        capability: "trust-safety.enforce",
        targetKind: "case",
        targetId: "case-a",
      }),
    ).toEqual({ kind: "deny", code: "action-not-available" });
  });

  it.each([
    ["support", "moderation-enforce", "trust-safety.enforce", false],
    ["moderator", "moderation-enforce", "trust-safety.enforce", true],
    ["identity-reviewer", "profile-claim-decide", "profile-claim.decide", true],
    ["legal", "legal-hold-apply", "retention.legal-hold", true],
    ["recovery-reviewer", "recovery-approved", "account.recovery", true],
    ["retention-worker", "retention-run", "retention.execute", true],
    ["system", "abuse-risk-review", "trust-safety.risk-review", true],
  ] as const)(
    "applies least-privilege grants for %s",
    (role, action, capability, allowed) => {
      const proof = authorizeStaffIdentityProof({
        actorId: `${role}-a`,
        role,
        identityVerified: true,
      });
      if ("kind" in proof) throw new Error("staff fixture proof denied");
      const result = authorizeStaffCommand({
        proof,
        context: {
          ...base,
          account: { ...account, id: proof.actorId },
          action,
        },
        decisionId: `${role}:${action}`,
        capability,
        targetKind: "operation",
        targetId: "target-a",
      });
      expect(result.kind).toBe(allowed ? "authorized-durable-command" : "deny");
    },
  );

  it("requires both role grant and approved purpose for restricted reveal", () => {
    const unapproved = authorizeStaffIdentityProof({
      actorId: "moderator-a",
      role: "moderator",
      identityVerified: true,
    });
    const approved = authorizeStaffIdentityProof({
      actorId: "moderator-a",
      role: "moderator",
      identityVerified: true,
      restrictedAccessApproved: true,
    });
    if ("kind" in unapproved || "kind" in approved)
      throw new Error("staff fixture proof denied");
    const command = (proof: typeof approved, purpose?: string) =>
      authorizeStaffCommand({
        proof,
        context: {
          ...base,
          account: { ...account, id: proof.actorId },
          action: "restricted-reveal",
        },
        decisionId: `reveal:${purpose ?? "none"}`,
        capability: "restricted.anonymous-author-linkage",
        targetKind: "anonymous-linkage",
        targetId: "linkage-a",
        ...(purpose ? { purpose } : {}),
      });
    expect(command(unapproved, "case-a").kind).toBe("deny");
    expect(command(approved).kind).toBe("deny");
    expect(command(approved, "case-a").kind).toBe("authorized-durable-command");
  });
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
  };
  const reportAuthorization = authorizeDurableCommand({
    context: {
      account,
      action: "report-create",
      blocked: false,
      capabilityEligible: true,
      policyAvailable: true,
      recentReauthentication: true,
      riskApproved: true,
      sensitive: false,
    },
    decisionId: "report-decision",
    capability: "trust-safety.report",
    targetKind: "report",
    targetId: reportInput.id,
  });
  if (reportAuthorization.kind !== "authorized-durable-command")
    throw new Error("report fixture unauthorized");

  it("requires an Account, deduplicates intake, and keeps reporter/evidence confidential", () => {
    expect(intakeReport({ ...reportInput, reporterAccount: null })).toEqual({
      kind: "authentication-required",
    });
    const first = intakeReport(reportInput);
    expect(first).toMatchObject({ kind: "accepted" });
    expect(first).not.toHaveProperty("restricted");
    if (first.kind !== "accepted") throw new Error("report not accepted");
    const restricted = prepareRestrictedReportIntake({
      authorization: reportAuthorization,
      request: reportInput,
    });
    expect(restricted).toMatchObject({
      moderationCase: { state: "received", reportIds: ["report-secret"] },
    });
    if (!restricted) throw new Error("restricted intake unavailable");
    const duplicate = intakeReport({
      ...reportInput,
      existingCase: restricted.moderationCase,
    });
    expect(duplicate).toMatchObject({
      receipt: { caseId: reportInput.caseId },
    });
    expect(
      intakeReport({
        ...reportInput,
        existingCase: transitionModerationCase(
          restricted.moderationCase,
          "closed",
        )!,
      }),
    ).toEqual({ kind: "case-closed", retryable: false });
    const status = reportStatusProjection(restricted.moderationCase);
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
    "sexual-exploitation",
    "threat-or-imminent-harm",
    "spam",
    "evasion",
    "brigading",
    "retaliation",
  ] as ReportReason[])(
    "withholds every prohibited conduct signal without waiting for volume: %s",
    (reason) => {
      expect(
        abuseDecision({ reason, attempts: 1, coordinatedAccounts: 1 }),
      ).toEqual({
        allowed: false,
        reasonCode: `conduct:${reason}`,
      });
    },
  );

  it("applies generic volume controls to unclassified risk signals", () => {
    expect(
      abuseDecision({ reason: "other", attempts: 6, coordinatedAccounts: 1 }),
    ).toEqual({
      allowed: false,
      reasonCode: "rate-limit:other",
    });
    expect(
      abuseDecision({ reason: "other", attempts: 1, coordinatedAccounts: 3 }),
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
