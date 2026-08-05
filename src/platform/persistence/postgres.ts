import "server-only";

import { Pool } from "pg";

import { readDatabaseSettings, type DatabaseSettings } from "./database-config";
import { assertApplicationDatabaseIdentity } from "./database-identity";
import {
  createTransactionRunner,
  type DatabaseClient,
  type DatabasePool,
  type DatabaseRow,
  type TransactionRunner,
} from "./transaction-runner";
import { isShuttingDown } from "../runtime/shutdown-state";

interface ManagedDatabase {
  readonly pool: Pool;
  readonly transactions: TransactionRunner;
}

let managedDatabase: ManagedDatabase | undefined;
let closingDatabase: Promise<void> | undefined;

function createPoolAdapter(pool: Pool): DatabasePool {
  return {
    async connect(): Promise<DatabaseClient> {
      const client = await pool.connect();

      return {
        query: <Row extends DatabaseRow>(
          text: string,
          values?: readonly unknown[],
        ) => client.query<Row>(text, values ? [...values] : []),
        release: (destroy = false) => client.release(destroy),
      };
    },
  };
}

export function databaseTransactionRunner(
  settings: DatabaseSettings = readDatabaseSettings(),
): TransactionRunner {
  return getDatabase(settings).transactions;
}

function getDatabase(
  settings: DatabaseSettings = readDatabaseSettings(),
): ManagedDatabase {
  if (isShuttingDown()) {
    throw new Error("Database is shutting down");
  }

  if (!settings.databaseUrl) {
    throw new Error("Database is not configured");
  }

  assertApplicationDatabaseIdentity(
    settings.databaseUrl,
    settings.appEnvironment,
  );

  managedDatabase ??= (() => {
    const pool = new Pool({
      connectionString: settings.databaseUrl,
      connectionTimeoutMillis: 2_000,
      idleTimeoutMillis: 10_000,
      max: 5,
    });

    return {
      pool,
      transactions: createTransactionRunner(createPoolAdapter(pool)),
    };
  })();

  return managedDatabase;
}

export async function probeDatabase(
  settings: DatabaseSettings = readDatabaseSettings(),
): Promise<boolean> {
  if (!settings.required) {
    return true;
  }

  try {
    await getDatabase(settings).pool.query("select 1");
    return true;
  } catch {
    return false;
  }
}

export async function closeDatabase(): Promise<void> {
  const database = managedDatabase;

  if (!database) {
    return;
  }

  closingDatabase ??= database.pool.end().finally(() => {
    if (managedDatabase === database) {
      managedDatabase = undefined;
    }
    closingDatabase = undefined;
  });

  await closingDatabase;
}
