import { describe, expect, it, vi } from "vitest";

import {
  DatabaseOperationError,
  createTransactionRunner,
  type DatabaseClient,
  type DatabasePool,
} from "@/src/platform/persistence/transaction-runner";

function createPool() {
  const query = vi.fn<DatabaseClient["query"]>().mockResolvedValue({
    command: "",
    fields: [],
    oid: 0,
    rowCount: null,
    rows: [],
  });
  const release = vi.fn();
  const client = { query, release } satisfies DatabaseClient;
  const connect = vi.fn().mockResolvedValue(client);

  return {
    client,
    connect,
    pool: { connect } satisfies DatabasePool,
    query,
    release,
  };
}

describe("transaction runner", () => {
  it("commits work on one checked-out client", async () => {
    const fixture = createPool();
    const runner = createTransactionRunner(fixture.pool);

    await expect(
      runner.run("request-123", async (transaction) => {
        expect(transaction.correlationId).toBe("request-123");
        await transaction.query("select $1::text", ["ok"]);
        return "done";
      }),
    ).resolves.toBe("done");

    expect(fixture.connect).toHaveBeenCalledOnce();
    expect(fixture.query.mock.calls.map(([sql]) => sql)).toEqual([
      "begin",
      "set local statement_timeout = '5s'",
      "select $1::text",
      "commit",
    ]);
    expect(fixture.release).toHaveBeenCalledOnce();
  });

  it("rolls back and releases after an operation failure", async () => {
    const fixture = createPool();
    const runner = createTransactionRunner(fixture.pool);

    await expect(
      runner.run("request-rollback", () => {
        throw new Error("sensitive database detail");
      }),
    ).rejects.toMatchObject({
      code: "database_operation_failed",
      correlationId: "request-rollback",
      message: "Database operation failed",
    });

    expect(fixture.query.mock.calls.map(([sql]) => sql)).toEqual([
      "begin",
      "set local statement_timeout = '5s'",
      "rollback",
    ]);
    expect(fixture.release).toHaveBeenCalledOnce();
  });

  it("denies nested transaction ownership", async () => {
    const fixture = createPool();
    const runner = createTransactionRunner(fixture.pool);

    await expect(
      runner.run("outer", () => runner.run("inner", () => undefined)),
    ).rejects.toMatchObject({ code: "nested_transaction_denied" });

    expect(fixture.connect).toHaveBeenCalledOnce();
  });

  it("maps connection failures without leaking driver errors", async () => {
    const pool: DatabasePool = {
      connect: vi.fn().mockRejectedValue(new Error("password was hunter2")),
    };
    const runner = createTransactionRunner(pool);

    const failure = await runner
      .run("request-connect", () => undefined)
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(DatabaseOperationError);
    expect(failure).toMatchObject({
      code: "database_connection_failed",
      correlationId: "request-connect",
      message: "Database connection failed",
    });
    expect(JSON.stringify(failure)).not.toContain("hunter2");
  });
});
