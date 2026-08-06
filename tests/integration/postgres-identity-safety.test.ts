import path from "node:path";

import { Pool } from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  authorizeAuthenticationProof,
  authorizeDurableCommand,
  authorizeStaffCommand,
  authorizeStaffIdentityProof,
  executeProtectedAction,
  type Account,
  type PolicyContext,
} from "@/src/modules/identity-safety/server";
import { assertDisposableDatabaseUrl } from "@/src/platform/persistence/database-identity";
import { createPostgresProtectedActionTransactions } from "@/src/platform/persistence/identity-safety-transactions";
import {
  finalizePrivateIdentityErasure,
  loadAuthorizedAccountData,
  loadRestrictedAttributionProjection,
  persistAccountLifecycle,
  persistAccountBlock,
  persistAbuseRiskReview,
  persistAppeal,
  persistAppealDecision,
  persistAuthenticationMethodChange,
  persistAuthenticatedAccount,
  persistClaimAppeal,
  persistClaimAppealDecision,
  persistEnforcement,
  persistModerationCaseTransition,
  persistPublicByline,
  persistBylineClaimLink,
  persistProfileClaim,
  persistRecoveryDecision,
  persistRecoveryReverification,
  persistReportAndCase,
  recordAuditMutationAttempt,
  recordRestrictedReveal,
} from "@/src/platform/persistence/identity-safety-commands";
import {
  persistLegalHold,
  runDurableRetention,
} from "@/src/platform/persistence/identity-safety-retention";
import { runMigrations } from "@/src/platform/persistence/migrations";
import { createTransactionRunner } from "@/src/platform/persistence/transaction-runner";

const databaseUrl = process.env.DATABASE_TEST_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_TEST_URL is required; identity safety cannot skip Postgres proof",
  );
}
assertDisposableDatabaseUrl(databaseUrl, "test");

const migrations = path.resolve("migrations/postgres");
const now = new Date("2026-08-05T12:00:00.000Z");
const account: Account = {
  id: "account-a",
  state: "active",
  verifiedContact: true,
};
const allowed: PolicyContext = {
  account,
  action: "save-protected-intent",
  blocked: false,
  capabilityEligible: true,
  policyAvailable: true,
  recentReauthentication: true,
  riskApproved: true,
  sensitive: false,
};

function authorize(input: {
  readonly action: string;
  readonly capability: string;
  readonly targetKind: string;
  readonly targetId: string;
  readonly actorId?: string;
  readonly decisionId?: string;
  readonly purpose?: string;
}) {
  const actor = { ...account, id: input.actorId ?? account.id };
  const context = { ...allowed, account: actor, action: input.action };
  const decisionId =
    input.decisionId ??
    `${input.actorId ?? account.id}:${input.action}:${input.targetId}`;
  const role = privilegedRole(input.action);
  const decision = role
    ? (() => {
        const proof = authorizeStaffIdentityProof({
          actorId: actor.id,
          role,
          identityVerified: true,
          restrictedAccessApproved: true,
        });
        if ("kind" in proof) throw new Error("Staff fixture proof denied");
        return authorizeStaffCommand({
          proof,
          context,
          decisionId,
          capability: input.capability,
          targetKind: input.targetKind,
          targetId: input.targetId,
          ...(input.purpose ? { purpose: input.purpose } : {}),
        });
      })()
    : authorizeDurableCommand({
        context,
        decisionId,
        capability: input.capability,
        targetKind: input.targetKind,
        targetId: input.targetId,
      });
  if (decision.kind !== "authorized-durable-command")
    throw new Error("Identity safety integration command must be authorized");
  return decision;
}

const privilegedActions: Readonly<
  Record<
    string,
    | "moderator"
    | "identity-reviewer"
    | "legal"
    | "recovery-reviewer"
    | "retention-worker"
    | "system"
  >
> = {
  "moderation-triage": "moderator",
  "moderation-investigate": "moderator",
  "moderation-close": "moderator",
  "moderation-enforce": "moderator",
  "moderation-appeal-decision": "moderator",
  "restricted-reveal": "moderator",
  "restricted-reveal-project": "moderator",
  "audit-mutation-attempt": "moderator",
  "profile-claim-decide": "identity-reviewer",
  "profile-claim-appeal-decision": "identity-reviewer",
  "legal-hold-apply": "legal",
  "legal-hold-release": "legal",
  "recovery-pending": "recovery-reviewer",
  "recovery-approved": "recovery-reviewer",
  "recovery-denied": "recovery-reviewer",
  "retention-run": "retention-worker",
  "erase-private-identity": "retention-worker",
  "finalize-deletion": "system",
  "abuse-risk-review": "system",
};

function privilegedRole(action: string) {
  return privilegedActions[action] ?? null;
}

describe.sequential("identity and safety PostgreSQL persistence", () => {
  const pool = new Pool({ connectionString: databaseUrl, max: 6 });
  const runner = createTransactionRunner({
    async connect() {
      const client = await pool.connect();
      return {
        query: (text, values) => client.query(text, values ? [...values] : []),
        release: (destroy = false) => client.release(destroy),
      };
    },
  });
  const transactions = createPostgresProtectedActionTransactions(runner);

  beforeEach(async () => {
    await pool.query("drop schema public cascade; create schema public");
  });
  afterAll(async () => pool.end());

  it("applies cleanly, upgrades the previous schema, repeats, rolls back, and reapplies", async () => {
    await expect(
      runMigrations({
        appEnvironment: "test",
        count: 1,
        databaseUrl,
        directory: migrations,
      }),
    ).resolves.toHaveLength(1);
    expect(
      await pool.query(
        "select column_name from information_schema.columns where table_name = 'retained_records' and column_name = 'completed_at'",
      ),
    ).toMatchObject({ rowCount: 0 });
    await expect(
      runMigrations({
        appEnvironment: "test",
        databaseUrl,
        directory: migrations,
      }),
    ).resolves.toHaveLength(2);
    await expect(
      runMigrations({
        appEnvironment: "test",
        databaseUrl,
        directory: migrations,
      }),
    ).resolves.toHaveLength(0);
    await expect(
      runMigrations({
        appEnvironment: "test",
        count: 2,
        databaseUrl,
        directory: migrations,
        direction: "down",
      }),
    ).resolves.toHaveLength(2);
    expect(
      await pool.query(
        "select column_name from information_schema.columns where table_name = 'retained_records' and column_name = 'completed_at'",
      ),
    ).toMatchObject({ rowCount: 0 });
    await expect(
      runMigrations({
        appEnvironment: "test",
        databaseUrl,
        directory: migrations,
      }),
    ).resolves.toHaveLength(2);
  });

  it("refuses a destructive rollback when operational data is populated", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: migrations,
    });
    await pool.query(
      "insert into accounts (id,state,verified_contact) values ('rollback-account','active',true); insert into account_sessions (id,account_id,reauthenticated_at) values ('rollback-session','rollback-account',now())",
    );
    await pool.query(
      `insert into identity_safety_audit
       (id,category,actor_role,occurred_at,reason_code,policy_version,prior_state,resulting_state,restricted_evidence_references)
       values ('rollback-audit','retention','fixture',now(),'fixture','identity-safety-v1',null,'committed','[]');
       insert into audit_evidence_payloads (audit_id,restricted_references,expires_at)
       values ('rollback-audit','["restricted"]',now())`,
    );
    await expect(
      runMigrations({
        appEnvironment: "test",
        count: 1,
        databaseUrl,
        directory: migrations,
        direction: "down",
      }),
    ).rejects.toThrow(/rollback requires empty operational data/u);
    expect(
      await pool.query(
        "select id from account_sessions where id='rollback-session'",
      ),
    ).toMatchObject({ rowCount: 1 });
    expect(
      await pool.query(
        "select audit_id from audit_evidence_payloads where audit_id='rollback-audit'",
      ),
    ).toMatchObject({ rowCount: 1 });
  });

  it("authorizes before one owned transaction and atomically writes action plus audit", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: migrations,
    });
    await pool.query(
      "insert into accounts (id, state, verified_contact) values ($1, 'active', true)",
      [account.id],
    );
    await expect(
      executeProtectedAction({
        context: { ...allowed, account: null },
        actionId: "denied-action",
        correlationId: "request-denied",
        now,
        transactions,
      }),
    ).resolves.toMatchObject({ kind: "deny" });
    expect(await pool.query("select * from protected_actions")).toMatchObject({
      rowCount: 0,
    });

    await expect(
      executeProtectedAction({
        context: allowed,
        actionId: "allowed-action",
        correlationId: "request-allowed",
        now,
        transactions,
      }),
    ).resolves.toEqual({ kind: "committed", actionId: "allowed-action" });
    expect(await pool.query("select * from protected_actions")).toMatchObject({
      rowCount: 1,
    });
    expect(
      await pool.query("select * from identity_safety_audit"),
    ).toMatchObject({ rowCount: 1 });
  });

  it("rolls back an action when its required audit conflicts", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: migrations,
    });
    await pool.query(
      "insert into accounts (id, state, verified_contact) values ($1, 'active', true)",
      [account.id],
    );
    await pool.query(
      `insert into identity_safety_audit
       (id, category, actor_role, occurred_at, reason_code, policy_version, prior_state, resulting_state, restricted_evidence_references)
       values ('conflict:audit', 'policy', 'fixture', now(), 'fixture', 'v1', null, 'existing', '[]')`,
    );

    await expect(
      executeProtectedAction({
        context: allowed,
        actionId: "conflict",
        correlationId: "request-conflict",
        now,
        transactions,
      }),
    ).rejects.toMatchObject({ code: "database_operation_failed" });
    expect(
      await pool.query(
        "select id from protected_actions where id = 'conflict'",
      ),
    ).toMatchObject({ rowCount: 0 });
  });

  it("enforces concurrent action and verified-claim uniqueness", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: migrations,
    });
    await pool.query(
      "insert into accounts (id, state, verified_contact) values ('account-a', 'active', true), ('account-b', 'active', true)",
    );
    const attempt = (correlationId: string) =>
      executeProtectedAction({
        context: allowed,
        actionId: "same-action",
        correlationId,
        now,
        transactions,
      });
    const results = await Promise.allSettled([
      attempt("race-a"),
      attempt("race-b"),
    ]);
    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    expect(await pool.query("select * from protected_actions")).toMatchObject({
      rowCount: 1,
    });
    expect(
      await pool.query("select * from identity_safety_audit"),
    ).toMatchObject({ rowCount: 1 });

    const claims = await Promise.allSettled([
      pool.query(
        "insert into profile_claims (id, account_id, profile_id, state, evidence_kind) values ('claim-a', 'account-a', 'profile-1', 'verified', 'human-review')",
      ),
      pool.query(
        "insert into profile_claims (id, account_id, profile_id, state, evidence_kind) values ('claim-b', 'account-b', 'profile-1', 'verified', 'human-review')",
      ),
    ]);
    expect(claims.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
  });

  it("rejects audit mutation and preserves the original event", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: migrations,
    });
    await pool.query(
      `insert into identity_safety_audit
       (id, category, actor_role, occurred_at, reason_code, policy_version, prior_state, resulting_state, restricted_evidence_references)
       values ('audit-1', 'policy', 'fixture', now(), 'fixture', 'v1', null, 'committed', '[]')`,
    );
    await expect(
      pool.query(
        "update identity_safety_audit set resulting_state = 'altered' where id = 'audit-1'",
      ),
    ).rejects.toThrow(/append-only/u);
    expect(
      await pool.query("select resulting_state from identity_safety_audit"),
    ).toMatchObject({
      rows: [{ resulting_state: "committed" }],
    });
  });

  it("durably coordinates bound identity, moderation, appeal, reveal, and retention commands", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: migrations,
    });
    const authentication = authorizeAuthenticationProof({
      decisionId: "authentication-a",
      accountId: account.id,
      providerProofVerified: true,
    });
    if (authentication.kind !== "authorized-durable-command")
      throw new Error("fixture proof");
    await expect(
      persistAuthenticatedAccount({
        runner,
        authorization: authentication,
        account,
        method: {
          id: "method-a",
          provider: "google",
          subject: "subject-a",
          verifiedAt: now,
        },
        sessionId: "session-a",
        audit: audit("account-created", "identity"),
      }),
    ).resolves.toBe("committed");
    await pool.query(
      "insert into accounts (id,state,verified_contact) values ('account-b','active',true),('account-deleted','deleted',false)",
    );
    const deletedProof = authorizeAuthenticationProof({
      decisionId: "deleted-proof",
      accountId: "account-deleted",
      providerProofVerified: true,
    });
    if (deletedProof.kind !== "authorized-durable-command")
      throw new Error("fixture proof");
    await expect(
      persistAuthenticatedAccount({
        runner,
        authorization: deletedProof,
        account: {
          id: "account-deleted",
          state: "deleted",
          verifiedContact: false,
          identityErasureDueAt: now,
          backupErasureDueAt: now,
        },
        method: {
          id: "deleted-method",
          provider: "apple",
          subject: "deleted-subject",
          verifiedAt: now,
        },
        sessionId: "deleted-session",
        audit: audit("deleted-auth-denied", "identity"),
      }),
    ).resolves.toBe("deleted-account");

    await expect(
      persistAuthenticationMethodChange({
        runner,
        authorization: authorize({
          action: "add-authentication-method",
          capability: "account.authentication-method",
          targetKind: "account",
          targetId: account.id,
        }),
        accountId: account.id,
        recentReauthentication: true,
        operation: "add",
        method: {
          id: "method-b",
          provider: "apple",
          subject: "subject-b",
          verifiedAt: now,
        },
        audit: audit("method-added", "identity"),
      }),
    ).resolves.toBe("committed");
    const removals = await Promise.all([
      persistAuthenticationMethodChange({
        runner,
        authorization: authorize({
          action: "remove-authentication-method",
          capability: "account.authentication-method",
          targetKind: "account",
          targetId: account.id,
          decisionId: "remove-a",
        }),
        accountId: account.id,
        recentReauthentication: true,
        operation: "remove",
        method: {
          id: "method-a",
          provider: "google",
          subject: "subject-a",
          verifiedAt: now,
        },
        audit: audit("method-remove-a", "identity"),
      }),
      persistAuthenticationMethodChange({
        runner,
        authorization: authorize({
          action: "remove-authentication-method",
          capability: "account.authentication-method",
          targetKind: "account",
          targetId: account.id,
          decisionId: "remove-b",
        }),
        accountId: account.id,
        recentReauthentication: true,
        operation: "remove",
        method: {
          id: "method-b",
          provider: "apple",
          subject: "subject-b",
          verifiedAt: now,
        },
        audit: audit("method-remove-b", "identity"),
      }),
    ]);
    expect(removals.sort()).toEqual(["committed", "last-method"]);
    await expect(
      loadAuthorizedAccountData({
        runner,
        authorization: authorize({
          action: "account-export",
          capability: "account.export",
          targetKind: "account",
          targetId: account.id,
        }),
        accountId: account.id,
        requesterAccountId: account.id,
        recentReauthentication: true,
        audit: audit("account-exported", "identity"),
      }),
    ).resolves.toMatchObject({ kind: "account-self-restricted" });
    await expect(
      persistAccountBlock({
        runner,
        authorization: authorize({
          action: "account-export",
          capability: "account.export",
          targetKind: "account",
          targetId: account.id,
          decisionId: "wrong-binding",
        }),
        blockerId: account.id,
        blockedId: "account-b",
        now,
        audit: audit("wrong-block", "moderation"),
      }),
    ).rejects.toThrow(/does not match/u);
    await persistAccountBlock({
      runner,
      authorization: authorize({
        action: "account-block",
        capability: "trust-safety.block",
        targetKind: "account",
        targetId: "account-b",
      }),
      blockerId: account.id,
      blockedId: "account-b",
      now,
      audit: audit("block-created", "moderation"),
    });
    await expect(
      persistPublicByline({
        runner,
        authorization: authorize({
          action: "byline-write",
          capability: "public-byline.write",
          targetKind: "account",
          targetId: account.id,
        }),
        accountId: account.id,
        displayName: "Ada Founder",
        now,
        impersonationSignal: false,
        editId: "byline-edit-a",
        audit: audit("byline-created", "identity"),
      }),
    ).resolves.toBe("committed");

    const claim = {
      id: "claim-a",
      accountId: account.id,
      profileId: "profile-a",
      state: "verified" as const,
      evidenceKind: "human-review" as const,
      decidedAt: now,
      appealDeadline: new Date(now.getTime() + 30 * 86_400_000),
      evidenceExpiresAt: now,
    };
    await expect(
      persistProfileClaim({
        runner,
        authorization: authorize({
          action: "profile-claim-submit",
          capability: "profile-claim.submit",
          targetKind: "claim",
          targetId: "claim-surface-only",
        }),
        actorId: account.id,
        sessionId: "session-a",
        claim: {
          id: "claim-surface-only",
          accountId: account.id,
          profileId: "profile-surface-only",
          state: "pending",
          evidenceKind: "surface-attribute",
        },
        reviewerId: null,
        encryptedEvidence: null,
        audit: audit("claim-surface-denied", "claim"),
      }),
    ).resolves.toBe("ineligible");
    await expect(
      persistProfileClaim({
        runner,
        authorization: authorize({
          action: "profile-claim-submit",
          capability: "profile-claim.submit",
          targetKind: "claim",
          targetId: claim.id,
        }),
        actorId: account.id,
        sessionId: "session-a",
        claim: {
          id: claim.id,
          accountId: claim.accountId,
          profileId: claim.profileId,
          state: "pending",
          evidenceKind: claim.evidenceKind,
        },
        reviewerId: null,
        encryptedEvidence: new Uint8Array([1, 2, 3]),
        audit: audit("claim-submitted", "claim"),
      }),
    ).resolves.toBe("committed");
    await expect(
      persistProfileClaim({
        runner,
        authorization: authorize({
          action: "profile-claim-decide",
          capability: "profile-claim.decide",
          targetKind: "claim",
          targetId: claim.id,
          actorId: "identity-reviewer-a",
        }),
        actorId: "identity-reviewer-a",
        claim,
        reviewerId: "identity-reviewer-a",
        encryptedEvidence: new Uint8Array([1, 2, 3]),
        challenge: { id: "challenge-a", challengerAccountId: account.id },
        audit: audit("claim-verified", "claim"),
      }),
    ).resolves.toBe("committed");
    await expect(
      persistBylineClaimLink({
        runner,
        authorization: authorize({
          action: "byline-claim-link",
          capability: "public-byline.claim",
          targetKind: "claim",
          targetId: claim.id,
        }),
        accountId: account.id,
        claimId: claim.id,
        enabled: true,
        audit: audit("byline-claim-linked", "claim"),
      }),
    ).resolves.toBe("committed");
    await expect(
      persistClaimAppeal({
        runner,
        authorization: authorize({
          action: "profile-claim-appeal",
          capability: "profile-claim.appeal",
          targetKind: "claim",
          targetId: claim.id,
          decisionId: "claim-conflict",
        }),
        id: "claim-appeal-conflict",
        claimId: claim.id,
        appellantAccountId: account.id,
        reviewerId: "identity-reviewer-a",
        newContext: "conflict",
        now,
        audit: audit("claim-appeal-conflict", "appeal"),
      }),
    ).resolves.toBe("reviewer-conflict");
    await expect(
      persistClaimAppeal({
        runner,
        authorization: authorize({
          action: "profile-claim-appeal",
          capability: "profile-claim.appeal",
          targetKind: "claim",
          targetId: claim.id,
        }),
        id: "claim-appeal-a",
        claimId: claim.id,
        appellantAccountId: account.id,
        reviewerId: "identity-reviewer-b",
        newContext: "new evidence",
        now,
        audit: audit("claim-appealed", "appeal"),
      }),
    ).resolves.toBe("committed");
    await runDurableRetention({
      runner,
      authorization: authorize({
        action: "retention-run",
        capability: "retention.execute",
        targetKind: "retention-job",
        targetId: "retention-claim",
        actorId: "retention-worker",
      }),
      actorId: "retention-worker",
      jobId: "retention-claim",
      now,
      audit: audit("retention-claim", "retention"),
    });
    expect(
      (
        await pool.query<{ encrypted_evidence: unknown }>(
          "select encrypted_evidence from profile_claims where id='claim-a'",
        )
      ).rows[0]?.encrypted_evidence,
    ).not.toBeNull();
    await expect(
      persistClaimAppealDecision({
        runner,
        authorization: authorize({
          action: "profile-claim-appeal-decision",
          capability: "profile-claim.appeal-decide",
          targetKind: "claim-appeal",
          targetId: "claim-appeal-a",
          actorId: "identity-reviewer-b",
        }),
        actorId: "identity-reviewer-b",
        id: "claim-appeal-decision-a",
        appealId: "claim-appeal-a",
        resultingState: "verified",
        reasonCode: "decision-upheld",
        now,
        audit: audit("claim-appeal-decided", "appeal"),
      }),
    ).resolves.toBe("committed");

    await expect(
      persistAbuseRiskReview({
        runner,
        authorization: authorize({
          action: "abuse-risk-review",
          capability: "trust-safety.risk-review",
          targetKind: "abuse-review",
          targetId: "risk-sexual-a",
          actorId: "risk-service",
        }),
        actorId: "risk-service",
        reviewId: "risk-sexual-a",
        caseId: "case-risk-sexual-a",
        subjectAccountId: "account-b",
        targetId: "object-risk-a",
        reason: "sexual-exploitation",
        attempts: 1,
        coordinatedAccounts: 1,
        now,
        audit: audit("risk-sexual-routed", "moderation"),
      }),
    ).resolves.toEqual({
      allowed: false,
      reasonCode: "conduct:sexual-exploitation",
      caseId: "case-risk-sexual-a",
    });
    expect(
      (
        await pool.query(
          "select state,queue from moderation_cases where id='case-risk-sexual-a'",
        )
      ).rows[0],
    ).toEqual({ state: "received", queue: "urgent" });

    const report = {
      id: "report-a",
      caseId: "case-a",
      reporterAccountId: account.id,
      targetId: "object-a",
      reason: "harassment" as const,
      context: "restricted context",
      evidenceReferences: ["evidence-a"],
      createdAt: now,
    };
    const moderationCase = {
      id: "case-a",
      targetId: "object-a",
      state: "received" as const,
      queue: "ordinary" as const,
      reportIds: [report.id],
    };
    await expect(
      persistReportAndCase({
        runner,
        authorization: authorize({
          action: "report-create",
          capability: "trust-safety.report",
          targetKind: "report",
          targetId: "forged-report",
          actorId: "account-b",
        }),
        actorId: "account-b",
        report: { ...report, id: "forged-report" },
        moderationCase,
        targetAccountId: account.id,
        targetSnapshot: {
          kind: "public-object",
          targetId: report.targetId,
          summary: "Restricted report snapshot",
          capturedAt: now,
        },
        audit: audit("forged-report-denied", "moderation"),
      }),
    ).rejects.toThrow(/reporter/u);
    await persistReportAndCase({
      runner,
      authorization: authorize({
        action: "report-create",
        capability: "trust-safety.report",
        targetKind: "report",
        targetId: report.id,
      }),
      actorId: account.id,
      report,
      moderationCase,
      targetAccountId: account.id,
      targetSnapshot: {
        kind: "public-object",
        targetId: report.targetId,
        summary: "Restricted report snapshot",
        capturedAt: now,
      },
      audit: audit("report-created", "moderation"),
    });
    await persistModerationCaseTransition({
      runner,
      authorization: authorize({
        action: "moderation-triage",
        capability: "trust-safety.moderate",
        targetKind: "case",
        targetId: moderationCase.id,
        actorId: "moderator-a",
      }),
      actorId: "moderator-a",
      caseId: moderationCase.id,
      operation: "triage",
      now,
      audit: audit("case-triaged", "moderation"),
    });
    await persistModerationCaseTransition({
      runner,
      authorization: authorize({
        action: "moderation-investigate",
        capability: "trust-safety.moderate",
        targetKind: "case",
        targetId: moderationCase.id,
        actorId: "moderator-a",
      }),
      actorId: "moderator-a",
      caseId: moderationCase.id,
      operation: "investigate",
      now,
      audit: audit("case-investigating", "moderation"),
    });
    await expect(
      persistEnforcement({
        runner,
        authorization: authorize({
          action: "moderation-enforce",
          capability: "trust-safety.enforce",
          targetKind: "case",
          targetId: moderationCase.id,
          actorId: "moderator-a",
        }),
        actorId: "moderator-a",
        reviewerId: "moderator-a",
        id: "enforcement-a",
        caseId: moderationCase.id,
        targetId: "object-a",
        action: {
          outcome: "account-limited",
          policyReason: "harassment",
          effectiveAt: now,
          scopeOrDuration: "30 days",
          appealable: true,
        },
        audit: audit("enforcement-created", "enforcement"),
      }),
    ).resolves.toBe("committed");
    await expect(
      persistAppeal({
        runner,
        authorization: authorize({
          action: "moderation-appeal",
          capability: "trust-safety.appeal",
          targetKind: "case",
          targetId: moderationCase.id,
          decisionId: "appeal-conflict",
        }),
        id: "appeal-conflict",
        caseId: moderationCase.id,
        appellantAccountId: account.id,
        reviewerId: "moderator-a",
        newContext: "conflict",
        now,
        audit: audit("appeal-conflict", "appeal"),
      }),
    ).resolves.toBe("reviewer-conflict");
    await expect(
      persistAppeal({
        runner,
        authorization: authorize({
          action: "moderation-appeal",
          capability: "trust-safety.appeal",
          targetKind: "case",
          targetId: moderationCase.id,
        }),
        id: "appeal-a",
        caseId: moderationCase.id,
        appellantAccountId: account.id,
        reviewerId: "moderator-b",
        newContext: "new context",
        now,
        audit: audit("appeal-created", "appeal"),
      }),
    ).resolves.toBe("committed");
    await expect(
      persistAppealDecision({
        runner,
        authorization: authorize({
          action: "moderation-appeal-decision",
          capability: "trust-safety.appeal-decide",
          targetKind: "appeal",
          targetId: "appeal-a",
          actorId: "moderator-b",
        }),
        actorId: "moderator-b",
        id: "appeal-decision-a",
        appealId: "appeal-a",
        newEnforcementId: "enforcement-appeal-a",
        action: {
          outcome: "none",
          policyReason: "appeal-reversed",
          effectiveAt: now,
          scopeOrDuration: "reversed",
          appealable: false,
        },
        audit: audit("appeal-decided", "appeal"),
      }),
    ).resolves.toBe("committed");
    expect(
      (await pool.query("select id from enforcement_actions order by id")).rows,
    ).toEqual([{ id: "enforcement-a" }, { id: "enforcement-appeal-a" }]);

    const claimReport = {
      id: "report-claim-a",
      caseId: "case-claim-a",
      reporterAccountId: account.id,
      targetId: claim.profileId,
      reason: "impersonation" as const,
      evidenceReferences: ["evidence-claim-a"],
      createdAt: now,
    };
    await persistReportAndCase({
      runner,
      authorization: authorize({
        action: "report-create",
        capability: "trust-safety.report",
        targetKind: "report",
        targetId: claimReport.id,
      }),
      actorId: account.id,
      report: claimReport,
      moderationCase: {
        id: claimReport.caseId,
        targetId: claimReport.targetId,
        state: "received",
        queue: "ordinary",
        reportIds: [claimReport.id],
      },
      targetAccountId: account.id,
      targetClaimId: claim.id,
      targetSnapshot: {
        kind: "profile",
        targetId: claimReport.targetId,
        summary: "Restricted Profile Claim snapshot",
        capturedAt: now,
      },
      audit: audit("claim-report-created", "moderation"),
    });
    for (const operation of ["triage", "investigate"] as const) {
      await persistModerationCaseTransition({
        runner,
        authorization: authorize({
          action: `moderation-${operation}`,
          capability: "trust-safety.moderate",
          targetKind: "case",
          targetId: claimReport.caseId,
          actorId: "moderator-a",
        }),
        actorId: "moderator-a",
        caseId: claimReport.caseId,
        operation,
        now,
        audit: audit(`claim-case-${operation}`, "moderation"),
      });
    }
    await persistEnforcement({
      runner,
      authorization: authorize({
        action: "moderation-enforce",
        capability: "trust-safety.enforce",
        targetKind: "case",
        targetId: claimReport.caseId,
        actorId: "moderator-a",
      }),
      actorId: "moderator-a",
      reviewerId: "moderator-a",
      id: "enforcement-claim-a",
      caseId: claimReport.caseId,
      targetId: claimReport.targetId,
      action: {
        outcome: "profile-claim-revoked",
        policyReason: "impersonation",
        effectiveAt: now,
        scopeOrDuration: "until appeal",
        appealable: true,
      },
      audit: audit("claim-enforcement-created", "enforcement"),
    });
    await persistAppeal({
      runner,
      authorization: authorize({
        action: "moderation-appeal",
        capability: "trust-safety.appeal",
        targetKind: "case",
        targetId: claimReport.caseId,
      }),
      id: "appeal-claim-a",
      caseId: claimReport.caseId,
      appellantAccountId: account.id,
      reviewerId: "moderator-b",
      newContext: "fresh claim proof",
      now,
      audit: audit("claim-enforcement-appealed", "appeal"),
    });
    await persistAppealDecision({
      runner,
      authorization: authorize({
        action: "moderation-appeal-decision",
        capability: "trust-safety.appeal-decide",
        targetKind: "appeal",
        targetId: "appeal-claim-a",
        actorId: "moderator-b",
      }),
      actorId: "moderator-b",
      id: "appeal-decision-claim-a",
      appealId: "appeal-claim-a",
      newEnforcementId: "enforcement-claim-appeal-a",
      action: {
        outcome: "none",
        policyReason: "claim-revocation-reversed",
        effectiveAt: now,
        scopeOrDuration: "reversed",
        appealable: false,
      },
      audit: audit("claim-enforcement-reversed", "appeal"),
    });
    expect(
      (
        await pool.query<{ state: string }>(
          "select state from profile_claims where id=$1",
          [claim.id],
        )
      ).rows[0]?.state,
    ).toBe("verified");

    await pool.query(
      "insert into anonymous_linkages (id,account_id,encrypted_payload,expires_at) values ('linkage-a',$1,$2,$3),('linkage-b','account-b',$2,$3)",
      [account.id, new Uint8Array([4]), new Date(now.getTime() + 86_400_000)],
    );
    await recordRestrictedReveal({
      runner,
      authorization: authorize({
        action: "restricted-reveal",
        capability: "restricted.anonymous-author-linkage",
        targetKind: "anonymous-linkage",
        targetId: "linkage-a",
        actorId: "moderator-b",
        purpose: moderationCase.id,
      }),
      id: "reveal-a",
      actorId: "moderator-b",
      approverId: "lead-a",
      caseReason: moderationCase.id,
      linkageId: "linkage-a",
      field: "anonymous-author-linkage",
      audit: audit("reveal-recorded", "moderation"),
    });
    await expect(
      loadRestrictedAttributionProjection({
        runner,
        authorization: authorize({
          action: "restricted-reveal-project",
          capability: "restricted.anonymous-author-linkage",
          targetKind: "anonymous-linkage",
          targetId: "linkage-a",
          actorId: "moderator-b",
          purpose: moderationCase.id,
        }),
        actorId: "moderator-b",
        revealId: "reveal-a",
        linkageId: "linkage-a",
        caseReason: moderationCase.id,
        audit: audit("reveal-projected", "moderation"),
      }),
    ).resolves.toEqual({
      kind: "restricted",
      accountId: account.id,
      caseReason: moderationCase.id,
    });
    await expect(
      loadRestrictedAttributionProjection({
        runner,
        authorization: authorize({
          action: "restricted-reveal-project",
          capability: "restricted.anonymous-author-linkage",
          targetKind: "anonymous-linkage",
          targetId: "linkage-b",
          actorId: "moderator-b",
          purpose: moderationCase.id,
        }),
        actorId: "moderator-b",
        revealId: "reveal-a",
        linkageId: "linkage-b",
        caseReason: moderationCase.id,
        audit: audit("unrelated-reveal-denied", "moderation"),
      }),
    ).resolves.toEqual({ kind: "not-authorized" });
    await recordAuditMutationAttempt({
      runner,
      authorization: authorize({
        action: "audit-mutation-attempt",
        capability: "audit.append-only",
        targetKind: "audit",
        targetId: "account-created",
        actorId: "moderator-b",
      }),
      actorId: "moderator-b",
      targetAuditId: "account-created",
      attemptedOperation: "update",
      event: {
        ...audit("audit-denial", "moderation"),
        reasonCode: "audit-mutation-denied",
      },
    });

    await pool.query("update reports set expires_at=$2 where id=$1", [
      report.id,
      now,
    ]);
    await persistLegalHold({
      runner,
      authorization: authorize({
        action: "legal-hold-apply",
        capability: "retention.legal-hold",
        targetKind: "report",
        targetId: report.id,
        actorId: "legal-a",
      }),
      actorId: "legal-a",
      holdId: "hold-report-a",
      scopeKind: "report",
      scopeId: report.id,
      authority: "counsel-ticket-1",
      reason: "active matter",
      operation: "apply",
      now,
      audit: audit("hold-applied", "retention"),
    });
    await runDurableRetention({
      runner,
      authorization: authorize({
        action: "retention-run",
        capability: "retention.execute",
        targetKind: "retention-job",
        targetId: "retention-held",
        actorId: "retention-worker",
      }),
      actorId: "retention-worker",
      jobId: "retention-held",
      now,
      audit: audit("retention-held", "retention"),
    });
    expect(
      (
        await pool.query<{ private_context: string | null }>(
          "select private_context from reports where id=$1",
          [report.id],
        )
      ).rows[0]?.private_context,
    ).toBe("restricted context");
    await persistLegalHold({
      runner,
      authorization: authorize({
        action: "legal-hold-release",
        capability: "retention.legal-hold",
        targetKind: "report",
        targetId: report.id,
        actorId: "legal-a",
      }),
      actorId: "legal-a",
      holdId: "hold-report-a",
      scopeKind: "report",
      scopeId: report.id,
      authority: "counsel-ticket-1",
      reason: "matter closed",
      operation: "release",
      now,
      audit: audit("hold-released", "retention"),
    });
    await runDurableRetention({
      runner,
      authorization: authorize({
        action: "retention-run",
        capability: "retention.execute",
        targetKind: "retention-job",
        targetId: "retention-final",
        actorId: "retention-worker",
      }),
      actorId: "retention-worker",
      jobId: "retention-final",
      now,
      audit: audit("retention-final", "retention"),
    });
    expect(
      (
        await pool.query<{ private_context: string | null }>(
          "select private_context from reports where id=$1",
          [report.id],
        )
      ).rows[0]?.private_context,
    ).toBeNull();

    await persistRecoveryDecision({
      runner,
      authorization: authorize({
        action: "recovery-pending",
        capability: "account.recovery",
        targetKind: "recovery",
        targetId: "recovery-a",
        actorId: "recovery-reviewer",
      }),
      actorId: "recovery-reviewer",
      recoveryId: "recovery-a",
      state: "pending",
      accountId: account.id,
      holdUntil: now,
      proofVerified: true,
      now,
      audit: audit("recovery-pending", "identity"),
    });
    await expect(
      persistRecoveryDecision({
        runner,
        authorization: authorize({
          action: "recovery-approved",
          capability: "account.recovery",
          targetKind: "recovery",
          targetId: "recovery-a",
          actorId: "recovery-reviewer",
        }),
        actorId: "recovery-reviewer",
        recoveryId: "recovery-a",
        state: "approved",
        now,
        audit: audit("recovery-approved", "identity"),
      }),
    ).resolves.toBe("committed");
    expect(
      (
        await pool.query<{ count: number }>(
          "select verified_contact,recovery_reverification_required from accounts where id=$1",
          [account.id],
        )
      ).rows[0],
    ).toEqual({
      verified_contact: false,
      recovery_reverification_required: true,
    });
    const freshAuthentication = authorizeAuthenticationProof({
      decisionId: "recovery-fresh-authentication",
      accountId: account.id,
      providerProofVerified: true,
    });
    if (freshAuthentication.kind !== "authorized-durable-command")
      throw new Error("fixture proof");
    await persistAuthenticatedAccount({
      runner,
      authorization: freshAuthentication,
      account,
      method: {
        id: "method-fresh",
        provider: "google",
        subject: "subject-a",
        verifiedAt: now,
      },
      sessionId: "session-fresh",
      audit: audit("recovery-fresh-authenticated", "identity"),
    });
    await expect(
      persistRecoveryReverification({
        runner,
        authorization: authorize({
          action: "reverify-recovery-contact",
          capability: "account.recovery-reverification",
          targetKind: "account",
          targetId: account.id,
        }),
        accountId: account.id,
        operation: "contact",
        sessionId: "session-fresh",
        freshProofVerified: true,
        audit: audit("recovery-contact-reverified", "identity"),
      }),
    ).resolves.toBe("committed");
    await expect(
      persistRecoveryReverification({
        runner,
        authorization: authorize({
          action: "reverify-recovery-claim",
          capability: "account.recovery-reverification",
          targetKind: "claim",
          targetId: claim.id,
        }),
        accountId: account.id,
        operation: "claim",
        claimId: claim.id,
        sessionId: "session-fresh",
        freshProofVerified: true,
        audit: audit("recovery-claim-reverified", "identity"),
      }),
    ).resolves.toBe("committed");
    expect(
      (
        await pool.query(
          "select a.verified_contact,a.recovery_reverification_required,c.reverify_required from accounts a join profile_claims c on c.account_id=a.id where c.id=$1",
          [claim.id],
        )
      ).rows[0],
    ).toEqual({
      verified_contact: true,
      recovery_reverification_required: false,
      reverify_required: false,
    });

    const lifecycle = (
      operation: "request-deletion" | "cancel-deletion" | "finalize-deletion",
      id: string,
      at: Date,
      recentReauthentication: boolean,
    ) =>
      persistAccountLifecycle({
        runner,
        authorization: authorize({
          action: operation,
          capability: "account.lifecycle",
          targetKind: "account",
          targetId: account.id,
          actorId:
            operation === "finalize-deletion" ? "deletion-worker" : account.id,
          decisionId: id,
        }),
        actorId:
          operation === "finalize-deletion" ? "deletion-worker" : account.id,
        accountId: account.id,
        operation,
        recentReauthentication,
        now: at,
        audit: audit(id, "identity"),
      });
    await expect(
      lifecycle("request-deletion", "delete-stale", now, false),
    ).resolves.toBe("reauthentication-required");
    await expect(
      lifecycle("request-deletion", "delete-start", now, true),
    ).resolves.toBe("committed");
    await expect(
      lifecycle("cancel-deletion", "delete-cancel", now, true),
    ).resolves.toBe("committed");
    await expect(
      lifecycle("request-deletion", "delete-restart", now, true),
    ).resolves.toBe("committed");
    const finalizationTime = new Date(now.getTime() + 31 * 86_400_000);
    await expect(
      lifecycle(
        "finalize-deletion",
        "delete-finalize",
        finalizationTime,
        false,
      ),
    ).resolves.toBe("committed");
    const erasureTime = new Date(finalizationTime.getTime() + 30 * 86_400_000);
    await persistLegalHold({
      runner,
      authorization: authorize({
        action: "legal-hold-apply",
        capability: "retention.legal-hold",
        targetKind: "account",
        targetId: account.id,
        actorId: "legal-a",
        decisionId: "hold-account",
      }),
      actorId: "legal-a",
      holdId: "hold-account-a",
      scopeKind: "account",
      scopeId: account.id,
      authority: "counsel-ticket-2",
      reason: "preservation",
      operation: "apply",
      now: erasureTime,
      audit: audit("account-hold-applied", "retention"),
    });
    await expect(
      finalizePrivateIdentityErasure({
        runner,
        authorization: authorize({
          action: "erase-private-identity",
          capability: "retention.identity",
          targetKind: "account",
          targetId: account.id,
          actorId: "retention-worker",
          decisionId: "erasure-held",
        }),
        actorId: "retention-worker",
        accountId: account.id,
        now: erasureTime,
        audit: audit("identity-erasure-held", "retention"),
      }),
    ).resolves.toBe("legal-hold");
    await persistLegalHold({
      runner,
      authorization: authorize({
        action: "legal-hold-release",
        capability: "retention.legal-hold",
        targetKind: "account",
        targetId: account.id,
        actorId: "legal-a",
        decisionId: "release-account",
      }),
      actorId: "legal-a",
      holdId: "hold-account-a",
      scopeKind: "account",
      scopeId: account.id,
      authority: "counsel-ticket-2",
      reason: "released",
      operation: "release",
      now: erasureTime,
      audit: audit("account-hold-released", "retention"),
    });
    await expect(
      finalizePrivateIdentityErasure({
        runner,
        authorization: authorize({
          action: "erase-private-identity",
          capability: "retention.identity",
          targetKind: "account",
          targetId: account.id,
          actorId: "retention-worker",
        }),
        actorId: "retention-worker",
        accountId: account.id,
        now: erasureTime,
        audit: audit("identity-erased", "retention"),
      }),
    ).resolves.toBe("committed");
    expect(
      (
        await pool.query<{ count: number }>(
          "select count(*)::int count from authentication_methods where account_id=$1",
          [account.id],
        )
      ).rows[0]?.count,
    ).toBe(0);
  });
});

function audit(
  id: string,
  category:
    | "identity"
    | "claim"
    | "moderation"
    | "enforcement"
    | "appeal"
    | "retention",
) {
  return {
    id,
    category,
    actorRole: "test",
    occurredAt: now,
    reasonCode: id,
    policyVersion: "identity-safety-v1",
    priorState: null,
    resultingState: "committed",
    restrictedEvidenceReferences: [],
  } as const;
}
