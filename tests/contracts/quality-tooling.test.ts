import { execFile } from "node:child_process";
import { readFile } from "node:fs/promises";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);

describe("canonical quality tooling", () => {
  it("accepts a conforming TypeScript fixture", async () => {
    await expect(
      execFileAsync("node_modules/.bin/eslint", [
        "tests/lint-fixtures/passing.ts",
      ]),
    ).resolves.toMatchObject({ stderr: "", stdout: "" });
  });

  it("rejects unused code and a floating Promise", async () => {
    const failure = await execFileAsync("node_modules/.bin/eslint", [
      "tests/lint-fixtures/failing.ts",
    ]).catch((error: unknown) => error as { stdout: string });

    expect(failure.stdout).toContain("@typescript-eslint/no-unused-vars");
    expect(failure.stdout).toContain("@typescript-eslint/no-floating-promises");
    expect(failure.stdout).toContain("max-depth");
    expect(failure.stdout).toContain("max-params");
    expect(failure.stdout).toContain("complexity");
  });

  it("publishes every stable root command without failure swallowing", async () => {
    const packageManifest = JSON.parse(
      await readFile("package.json", "utf8"),
    ) as { scripts: Record<string, string> };
    const required = [
      "format",
      "format:check",
      "lint",
      "typecheck",
      "build",
      "test",
      "test:unit",
      "test:integration",
      "test:e2e",
      "check:architecture",
      "check:file-sizes",
      "check:unused",
      "openspec:validate",
    ];

    expect(Object.keys(packageManifest.scripts)).toEqual(
      expect.arrayContaining(required),
    );

    for (const command of required) {
      expect(packageManifest.scripts[command]).not.toMatch(
        /\|\|\s*true|;\s*true/u,
      );
    }
  });

  it("fails the Postgres gate when its disposable URL is missing", async () => {
    const environment = { ...process.env };
    delete environment.DATABASE_TEST_URL;

    const failure = await execFileAsync(
      process.execPath,
      ["scripts/test/run-postgres.ts"],
      { env: environment },
    ).catch((error: unknown) => error as { stderr: string });

    expect(failure.stderr).toContain("Postgres integration gate cannot skip");
  });
});
