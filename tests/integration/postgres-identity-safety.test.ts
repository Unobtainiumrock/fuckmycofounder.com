import path from "node:path";

import { Pool } from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import {
  executeProtectedAction,
  type Account,
  type PolicyContext,
} from "@/src/modules/identity-safety";
import { assertDisposableDatabaseUrl } from "@/src/platform/persistence/database-identity";
import { createPostgresProtectedActionTransactions } from "@/src/platform/persistence/identity-safety-transactions";
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
    ).resolves.toHaveLength(1);
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
        count: 1,
        databaseUrl,
        directory: migrations,
        direction: "down",
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
    ).resolves.toHaveLength(1);
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
});
