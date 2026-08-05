import "server-only";

import { AsyncLocalStorage } from "node:async_hooks";

export type DatabaseRow = Record<string, unknown>;

export interface DatabaseQueryResult<Row extends DatabaseRow> {
  readonly rowCount: number | null;
  readonly rows: readonly Row[];
}

export interface DatabaseClient {
  query<Row extends DatabaseRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<DatabaseQueryResult<Row>>;
  release(destroy?: boolean): void;
}

export interface DatabasePool {
  connect(): Promise<DatabaseClient>;
}

export interface TransactionContext {
  readonly correlationId: string;
  query<Row extends DatabaseRow>(
    text: string,
    values?: readonly unknown[],
  ): Promise<DatabaseQueryResult<Row>>;
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
  ) {
    super(message);
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

      let destroyClient = false;

      try {
        client = await pool.connect();
      } catch {
        throw new DatabaseOperationError(
          "database_connection_failed",
          correlationId,
          "Database connection failed",
        );
      }

      try {
        await client.query("begin");
        await client.query("set local statement_timeout = '5s'");

        const result = await transactionScope.run(true, () =>
          operation({
            correlationId,
            query: <Row extends DatabaseRow>(
              text: string,
              values?: readonly unknown[],
            ) => client.query<Row>(text, values),
          }),
        );

        await client.query("commit");
        return result;
      } catch (cause) {
        try {
          await client.query("rollback");
        } catch {
          destroyClient = true;
        }

        if (cause instanceof DatabaseOperationError) {
          throw cause;
        }

        throw new DatabaseOperationError(
          "database_operation_failed",
          correlationId,
          "Database operation failed",
        );
      } finally {
        client.release(destroyClient);
      }
    },
  };
}
