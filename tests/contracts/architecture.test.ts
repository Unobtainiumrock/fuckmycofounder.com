import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { describe, expect, it } from "vitest";

const execFileAsync = promisify(execFile);
const dependencyCruiser = "node_modules/.bin/depcruise";

async function cruise(path: string): Promise<{ code: number; output: string }> {
  try {
    const result = await execFileAsync(
      dependencyCruiser,
      [
        "--config",
        ".dependency-cruiser.cjs",
        "--output-type",
        "err-long",
        path,
      ],
      { cwd: process.cwd() },
    );
    return { code: 0, output: result.stdout };
  } catch (error) {
    const failure = error as {
      code?: number;
      stdout?: string;
      stderr?: string;
    };
    return {
      code: failure.code ?? 1,
      output: `${failure.stdout ?? ""}${failure.stderr ?? ""}`,
    };
  }
}

describe("module dependency direction", () => {
  it("accepts app composition around a framework-neutral module", async () => {
    const result = await cruise("tests/fixtures/architecture/valid");

    expect(result.code, result.output).toBe(0);
  });

  it("rejects a module importing concrete platform code", async () => {
    const result = await cruise("tests/fixtures/architecture/reverse");

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("modules-cannot-import-platform");
  });

  it("resolves aliases before rejecting a reverse import", async () => {
    const result = await cruise("tests/fixtures/architecture/alias-reverse");

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("modules-cannot-import-platform");
  });

  it("rejects reverse type-only imports", async () => {
    const result = await cruise("tests/fixtures/architecture/type-reverse");

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("modules-cannot-import-platform");
  });

  it("rejects circular imports", async () => {
    const result = await cruise("tests/fixtures/architecture/cycle");

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("no-circular");
  });

  it("detects cycles through dynamic imports", async () => {
    const result = await cruise("tests/fixtures/architecture/dynamic-cycle");

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("no-circular");
  });

  it("rejects browser code importing server platform implementations", async () => {
    const result = await cruise("tests/fixtures/architecture/client-leak");

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("client-cannot-import-platform");
  });

  it("rejects metadata code importing persistence", async () => {
    const result = await cruise("tests/fixtures/architecture/metadata-leak");

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("metadata-cannot-import-persistence");
  });

  it("allows a route to call a module's public intent interface", async () => {
    const result = await cruise("tests/fixtures/architecture/route-valid");

    expect(result.code, result.output).toBe(0);
  });

  it("rejects a route importing persistence directly", async () => {
    const result = await cruise(
      "tests/fixtures/architecture/route-persistence-leak",
    );

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("routes-cannot-import-persistence");
  });

  it("rejects a route importing internal module policy", async () => {
    const result = await cruise(
      "tests/fixtures/architecture/route-policy-leak",
    );

    expect(result.code).not.toBe(0);
    expect(result.output).toContain("routes-use-module-public-interface");
  });
});
