import path from "node:path";

import { runMigrations } from "../../src/platform/persistence/migrations.ts";

const databaseUrl = process.env.DATABASE_TEST_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_TEST_URL is required; no database default is allowed",
  );
}

await runMigrations({
  appEnvironment: "test",
  databaseUrl,
  directory: path.resolve("migrations"),
});
