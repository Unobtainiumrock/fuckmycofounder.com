import "server-only";

import { Pool } from "pg";

import { readDatabaseSettings, type DatabaseSettings } from "./database-config";
import {
  createTransactionRunner,
  type DatabaseClient,
  type DatabasePool,
  type TransactionRunner,
} from "./transaction-runner";

interface ManagedDatabase {
  readonly pool: Pool;
  readonly transactions: TransactionRunner;
}

let managedDatabase: ManagedDatabase | undefined;

function createPoolAdapter(pool: Pool): DatabasePool {
  return {
    async connect(): Promise<DatabaseClient> {
      const client = await pool.connect();

      return {
        query: (text, values) => client.query(text, values ? [...values] : []),
        release: () => client.release(),
      };
    },
  };
}

function getDatabase(
  settings: DatabaseSettings = readDatabaseSettings(),
): ManagedDatabase {
  if (!settings.databaseUrl) {
    throw new Error("Database is not configured");
  }

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
