import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

describe("pull-request CI contract", () => {
  it("runs every fail-closed foundation gate from a frozen install", async () => {
    const workflow = await readFile(".github/workflows/quality.yml", "utf8");
    const requiredCommands = [
      "pnpm install --frozen-lockfile",
      "pnpm format:check",
      "pnpm lint",
      "pnpm check:architecture",
      "pnpm check:unused",
      "pnpm typecheck",
      "pnpm build:app",
      "pnpm test:all",
      "pnpm test:integration",
      "pnpm check:file-sizes",
      "pnpm openspec:validate",
      "pnpm test:e2e",
      "git diff --exit-code",
      "pnpm test:container",
    ];

    for (const command of requiredCommands) {
      expect(workflow).toContain(command);
    }

    expect(workflow).toContain("timeout-minutes: 30");
    expect(workflow).toContain("cancel-in-progress: true");
    expect(workflow).not.toContain("continue-on-error");
    expect(workflow).not.toMatch(/\|\|\s*true/u);
  });
});
