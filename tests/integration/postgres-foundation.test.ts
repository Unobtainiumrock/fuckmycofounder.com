import path from "node:path";

import { Pool } from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

import { runMigrations } from "@/src/platform/persistence/migrations";
import { assertDisposableDatabaseUrl } from "@/src/platform/persistence/database-identity";
import {
  closeDatabase,
  databaseTransactionRunner,
} from "@/src/platform/persistence/postgres";

const databaseUrl = process.env.DATABASE_TEST_URL;
const fixtureDirectory = path.resolve("tests/fixtures/postgres/migrations");

if (!databaseUrl) {
  throw new Error(
    "DATABASE_TEST_URL is required; the Postgres integration gate cannot skip",
  );
}

assertDisposableDatabaseUrl(databaseUrl, "test");

describe.sequential("disposable Postgres foundation", () => {
  const pool = new Pool({ connectionString: databaseUrl, max: 4 });
  const transactionRunner = () =>
    databaseTransactionRunner({
      appEnvironment: "test",
      databaseUrl,
      required: true,
    });

  beforeEach(async () => {
    await pool.query("drop schema public cascade; create schema public");
  });

  afterAll(async () => {
    await closeDatabase();
    await pool.end();
  });

  it("applies from empty and repeats without rerunning migrations", async () => {
    const first = await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: fixtureDirectory,
    });
    const repeat = await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: fixtureDirectory,
    });

    expect(first).toHaveLength(2);
    expect(repeat).toHaveLength(0);
  });

  it("upgrades a previous schema to current", async () => {
    await runMigrations({
      appEnvironment: "test",
      count: 1,
      databaseUrl,
      directory: fixtureDirectory,
    });
    const before = await pool.query(
      "select column_name from information_schema.columns where table_name = 'foundation_subjects' and column_name = 'updated_at'",
    );

    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: fixtureDirectory,
    });
    const after = await pool.query(
      "select column_name from information_schema.columns where table_name = 'foundation_subjects' and column_name = 'updated_at'",
    );

    expect(before.rowCount).toBe(0);
    expect(after.rowCount).toBe(1);
  });

  it("rolls back the domain write when its required audit write fails", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: fixtureDirectory,
    });
    const runner = transactionRunner();

    await expect(
      runner.run("audit-failure", async (transaction) => {
        await transaction.query(
          "insert into foundation_subjects (id, state) values ($1, $2)",
          ["subject-audit", "active"],
        );
        await transaction.query(
          "insert into foundation_audit (subject_id, action, correlation_id) values ($1, $2, $3)",
          ["subject-audit", null, transaction.correlationId],
        );
      }),
    ).rejects.toMatchObject({ code: "database_operation_failed" });

    const subjects = await pool.query(
      "select id from foundation_subjects where id = 'subject-audit'",
    );
    expect(subjects.rowCount).toBe(0);
  });

  it("preserves a concurrent revision invariant and one matching audit", async () => {
    await runMigrations({
      appEnvironment: "test",
      databaseUrl,
      directory: fixtureDirectory,
    });
    await pool.query(
      "insert into foundation_subjects (id, state) values ('subject-race', 'active')",
    );
    const runner = transactionRunner();

    const attempt = (correlationId: string) =>
      runner.run(correlationId, async (transaction) => {
        const update = await transaction.query<{ revision: string }>(
          "update foundation_subjects set revision = revision + 1 where id = $1 and revision = 0 returning revision",
          ["subject-race"],
        );

        if (update.rowCount !== 1) {
          throw new Error("revision conflict");
        }

        await transaction.query(
          "insert into foundation_audit (subject_id, action, correlation_id) values ($1, $2, $3)",
          ["subject-race", "revision_changed", correlationId],
        );
      });

    const results = await Promise.allSettled([
      attempt("race-a"),
      attempt("race-b"),
    ]);
    const state = await pool.query(
      "select revision from foundation_subjects where id = 'subject-race'",
    );
    const audit = await pool.query(
      "select count(*)::int as count from foundation_audit where subject_id = 'subject-race'",
    );

    expect(results.filter(({ status }) => status === "fulfilled")).toHaveLength(
      1,
    );
    expect(results.filter(({ status }) => status === "rejected")).toHaveLength(
      1,
    );
    expect(state.rows).toEqual([{ revision: "1" }]);
    expect(audit.rows).toEqual([{ count: 1 }]);
  });
});
