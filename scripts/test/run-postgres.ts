import { spawnSync } from "node:child_process";

if (!process.env.DATABASE_TEST_URL) {
  throw new Error(
    "DATABASE_TEST_URL is required; the Postgres integration gate cannot skip",
  );
}

const result = spawnSync(
  process.execPath,
  [
    "node_modules/vitest/vitest.mjs",
    "run",
    "tests/integration/postgres-foundation.test.ts",
  ],
  { cwd: process.cwd(), env: process.env, stdio: "inherit" },
);

process.exitCode = result.status ?? 1;
