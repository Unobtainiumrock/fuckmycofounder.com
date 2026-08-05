import { AsyncLocalStorage } from "node:async_hooks";

import type { QueryResult } from "pg";

export interface DatabaseClient {
  query(text: string, values?: readonly unknown[]): Promise<QueryResult>;
  release(): void;
}

export interface DatabasePool {
  connect(): Promise<DatabaseClient>;
}

export interface TransactionContext {
  readonly correlationId: string;
  query(text: string, values?: readonly unknown[]): Promise<QueryResult>;
}

type DatabaseFailureCode =
  | "database_connection_failed"
  | "database_operation_failed"
  | "nested_transaction_denied";

export class DatabaseOperationError extends Error {
  readonly code: DatabaseFailureCode;
  readonly correlationId: string;

  constructor(
    code: DatabaseFailureCode,
    correlationId: string,
    message: string,
    cause?: unknown,
  ) {
    super(message, { cause });
    this.name = "DatabaseOperationError";
    this.code = code;
    this.correlationId = correlationId;
  }
}

export interface TransactionRunner {
  run<Result>(
    correlationId: string,
    operation: (transaction: TransactionContext) => Promise<Result> | Result,
  ): Promise<Result>;
}

export function createTransactionRunner(pool: DatabasePool): TransactionRunner {
  const transactionScope = new AsyncLocalStorage<boolean>();

  return {
    async run<Result>(
      correlationId: string,
      operation: (transaction: TransactionContext) => Promise<Result> | Result,
    ): Promise<Result> {
      if (transactionScope.getStore()) {
        throw new DatabaseOperationError(
          "nested_transaction_denied",
          correlationId,
          "Nested transaction denied",
        );
      }

      let client: DatabaseClient;

      try {
        client = await pool.connect();
      } catch (cause) {
        throw new DatabaseOperationError(
          "database_connection_failed",
          correlationId,
          "Database connection failed",
          cause,
        );
      }

      try {
        await client.query("begin");
        await client.query("set local statement_timeout = '5s'");

        const result = await transactionScope.run(true, () =>
          operation({
            correlationId,
            query: (text: string, values?: readonly unknown[]) =>
              client.query(text, values),
          }),
        );

        await client.query("commit");
        return result;
      } catch (cause) {
        await client.query("rollback").catch(() => undefined);

        if (cause instanceof DatabaseOperationError) {
          throw cause;
        }

        throw new DatabaseOperationError(
          "database_operation_failed",
          correlationId,
          "Database operation failed",
          cause,
        );
      } finally {
        client.release();
      }
    },
  };
}
