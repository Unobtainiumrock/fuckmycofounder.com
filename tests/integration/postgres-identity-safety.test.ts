import path from "node:path";

import { Pool } from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  authorizeDurableCommand,
  executeProtectedAction,
  type Account,
  type PolicyContext,
} from "@/src/modules/identity-safety";
import { assertDisposableDatabaseUrl } from "@/src/platform/persistence/database-identity";
import { createPostgresProtectedActionTransactions } from "@/src/platform/persistence/identity-safety-transactions";
import {
  finalizePrivateIdentityErasure,
  loadAuthorizedAccountData,
  persistAccountLifecycle,
  persistAppeal,
  persistAppealDecision,
  persistAuthenticationMethodChange,
  persistAuthenticatedAccount,
  persistClaimAppeal,
  persistEnforcement,
  persistProfileClaim,
  persistRecoveryDecision,
  persistReportAndCase,
  recordAuditMutationAttempt,
  recordRestrictedReveal,
} from "@/src/platform/persistence/identity-safety-commands";
import { runDurableRetention } from "@/src/platform/persistence/identity-safety-retention";
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
const authorizationDecision = authorizeDurableCommand({
  context: allowed,
  decisionId: "decision-a",
  capability: "identity-safety-test",
});
if (authorizationDecision.kind !== "authorized-durable-command") {
  throw new Error("Identity safety integration fixture must be authorized");
}
const authorization = authorizationDecision;

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

  it("durably coordinates identity, moderation, reveal, and retention state", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: migrations,
    });
    await persistAuthenticatedAccount({
      runner,
      authorization,
      account,
      method: {
        id: "method-a",
        provider: "google",
        subject: "subject-a",
        verifiedAt: now,
      },
      sessionId: "session-a",
      audit: audit("account-created", "identity"),
    });
    await expect(
      persistAuthenticationMethodChange({
        runner,
        authorization,
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
    await expect(
      loadAuthorizedAccountData({
        runner,
        authorization,
        accountId: account.id,
        requesterAccountId: account.id,
        recentReauthentication: true,
        audit: audit("account-exported", "identity"),
      }),
    ).resolves.toMatchObject({
      kind: "account-self-restricted",
      methods: [{ provider: "apple" }, { provider: "google" }],
    });
    const pending = {
      ...account,
      state: "deletion-pending" as const,
      preDeletionState: "active" as const,
      deletionRequestedAt: now,
    };
    await expect(
      persistAccountLifecycle({
        runner,
        authorization,
        account: pending,
        recentReauthentication: false,
        audit: audit("delete-denied", "identity"),
      }),
    ).resolves.toBe("reauthentication-required");
    await expect(
      persistAccountLifecycle({
        runner,
        authorization,
        account: pending,
        recentReauthentication: true,
        audit: audit("delete-started", "identity"),
      }),
    ).resolves.toBe("committed");
    expect(
      await pool.query("select state, pre_deletion_state from accounts"),
    ).toMatchObject({
      rows: [{ state: "deletion-pending", pre_deletion_state: "active" }],
    });
    const sessions = await pool.query<{ revoked_at: Date | null }>(
      "select revoked_at from account_sessions",
    );
    expect(sessions.rows[0]?.revoked_at).toBeInstanceOf(Date);

    await pool.query("update accounts set state='active' where id='account-a'");
    await persistRecoveryDecision({
      runner,
      authorization,
      recoveryId: "recovery-a",
      accountId: account.id,
      state: "approved",
      holdUntil: now,
      audit: audit("recovery-approved", "identity"),
    });
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
    await persistProfileClaim({
      runner,
      authorization,
      claim,
      reviewerId: "identity-reviewer-a",
      encryptedEvidence: new Uint8Array([1, 2, 3]),
      challenge: { id: "challenge-a", challengerAccountId: account.id },
      audit: audit("claim-verified", "claim"),
    });
    await expect(
      persistClaimAppeal({
        runner,
        authorization,
        id: "claim-appeal-conflict",
        claim,
        appellantAccountId: account.id,
        reviewerId: "identity-reviewer-a",
        originalReviewerId: "identity-reviewer-a",
        newContext: "conflicted review",
        now,
        audit: audit("claim-appeal-conflict", "appeal"),
      }),
    ).resolves.toBe("reviewer-conflict");
    await expect(
      persistClaimAppeal({
        runner,
        authorization,
        id: "claim-appeal-a",
        claim,
        appellantAccountId: account.id,
        reviewerId: "identity-reviewer-b",
        originalReviewerId: "identity-reviewer-a",
        newContext: "new claim evidence",
        now,
        audit: audit("claim-appealed", "appeal"),
      }),
    ).resolves.toBe("committed");
    const report = {
      id: "report-a",
      caseId: "case-a",
      reporterAccountId: account.id,
      targetId: "object-a",
      reason: "harassment" as const,
      context: "restricted context",
      evidenceReferences: ["evidence-a"],
      createdAt: new Date(now.getTime() - 25 * 30 * 86_400_000),
    };
    const moderationCase = {
      id: "case-a",
      targetId: "object-a",
      state: "received" as const,
      queue: "ordinary" as const,
      reportIds: [report.id],
    };
    await persistReportAndCase({
      runner,
      authorization,
      report,
      moderationCase,
      targetSnapshot: { private: "snapshot" },
      audit: audit("report-created", "moderation"),
    });
    await persistEnforcement({
      runner,
      authorization,
      id: "enforcement-a",
      caseId: moderationCase.id,
      affectedAccountId: account.id,
      action: {
        outcome: "account-limited",
        policyReason: "harassment",
        effectiveAt: now,
        scopeOrDuration: "30 days",
        appealable: true,
      },
      audit: audit("enforcement-created", "enforcement"),
    });
    await expect(
      persistAppeal({
        runner,
        authorization,
        id: "appeal-expired",
        caseId: moderationCase.id,
        appellantAccountId: account.id,
        reviewerId: "moderator-b",
        originalReviewerId: "moderator-a",
        affectedAccountId: account.id,
        appealDeadline: new Date(now.getTime() - 1),
        newContext: "too late",
        now,
        audit: audit("appeal-expired", "appeal"),
      }),
    ).resolves.toBe("ineligible");
    await expect(
      persistAppeal({
        runner,
        authorization,
        id: "appeal-a",
        caseId: moderationCase.id,
        appellantAccountId: account.id,
        reviewerId: "moderator-b",
        originalReviewerId: "moderator-a",
        affectedAccountId: account.id,
        appealDeadline: new Date(now.getTime() + 30 * 86_400_000),
        newContext: "new context",
        now,
        audit: audit("appeal-created", "appeal"),
      }),
    ).resolves.toBe("committed");
    await persistAppealDecision({
      runner,
      authorization,
      id: "appeal-decision-a",
      appealId: "appeal-a",
      originalEnforcementId: "enforcement-a",
      newEnforcementId: "enforcement-appeal-a",
      affectedAccountId: account.id,
      reviewerId: "moderator-b",
      action: {
        outcome: "none",
        policyReason: "appeal-reversed",
        effectiveAt: now,
        scopeOrDuration: "reversed",
        appealable: false,
      },
      resultingAccountState: "active",
      audit: audit("appeal-decided", "appeal"),
    });
    expect(
      await pool.query("select id from enforcement_actions order by id"),
    ).toMatchObject({
      rows: [{ id: "enforcement-a" }, { id: "enforcement-appeal-a" }],
    });
    expect(await pool.query("select state from accounts")).toMatchObject({
      rows: [{ state: "active" }],
    });
    await recordRestrictedReveal({
      runner,
      authorization,
      id: "reveal-a",
      actorId: "moderator-b",
      approverId: "lead-a",
      caseReason: moderationCase.id,
      field: "reporter-identity",
      allowed: true,
      audit: audit("reveal-recorded", "moderation"),
    });
    await recordAuditMutationAttempt({
      runner,
      authorization,
      event: {
        ...audit("audit-denial", "moderation"),
        reasonCode: "audit-mutation-denied",
      },
    });
    await runDurableRetention({
      runner,
      authorization,
      now,
      audit: audit("retention-run", "retention"),
    });
    await pool.query("update accounts set state='deleted' where id=$1", [
      account.id,
    ]);
    await expect(
      finalizePrivateIdentityErasure({
        runner,
        authorization,
        account: {
          ...account,
          state: "deleted",
          identityErasureDueAt: now,
          backupErasureDueAt: new Date(now.getTime() + 60 * 86_400_000),
        },
        now,
        audit: audit("identity-erased", "retention"),
      }),
    ).resolves.toBe("committed");
    expect(
      await pool.query(
        "select private_context, evidence_references from reports",
      ),
    ).toMatchObject({
      rows: [{ private_context: null, evidence_references: [] }],
    });
    expect(
      await pool.query("select count(*)::int as count from restricted_reveals"),
    ).toMatchObject({ rows: [{ count: 1 }] });
    expect(
      await pool.query(
        "select count(*)::int as count from identity_safety_audit",
      ),
    ).toMatchObject({ rows: [{ count: 15 }] });
    expect(
      await pool.query(
        "select count(*)::int as count from authentication_methods",
      ),
    ).toMatchObject({ rows: [{ count: 0 }] });
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
