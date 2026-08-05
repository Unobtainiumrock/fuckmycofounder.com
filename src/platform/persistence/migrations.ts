import { readdir } from "node:fs/promises";

import { runner } from "node-pg-migrate";

import {
  assertDisposableDatabaseUrl,
  type AppEnvironment,
} from "./database-identity";
import { assertMigrationManifest } from "./migration-manifest";

interface MigrationRunOptions {
  readonly appEnvironment: AppEnvironment;
  readonly count?: number;
  readonly databaseUrl: string;
  readonly directory: string;
}

export async function runMigrations(options: MigrationRunOptions) {
  assertDisposableDatabaseUrl(options.databaseUrl, options.appEnvironment);

  const filenames = (await readdir(options.directory))
    .filter((filename) => filename.endsWith(".mjs"))
    .sort((left, right) => left.localeCompare(right));
  assertMigrationManifest(filenames);

  return runner({
    checkOrder: true,
    databaseUrl: options.databaseUrl,
    dir: options.directory,
    direction: "up",
    ...(options.count === undefined ? {} : { count: options.count }),
    migrationsTable: "foundation_migrations",
    singleTransaction: true,
    verbose: false,
  });
}
