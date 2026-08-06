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
    "--no-file-parallelism",
    "tests/integration/postgres-foundation.test.ts",
    "tests/integration/postgres-identity-safety.test.ts",
  ],
  {
    cwd: process.cwd(),
    env: { ...process.env, ALLOW_TEST_NETWORK: "true" },
    stdio: "inherit",
  },
);

process.exitCode = result.status ?? 1;
