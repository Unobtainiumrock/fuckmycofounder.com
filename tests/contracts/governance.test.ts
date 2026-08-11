import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

const authoritativePaths = [
  "CONTEXT.md",
  "DESIGN.md",
  "docs/product-definition.md",
  "docs/code-standards.md",
  "docs/architecture/tech-stack-and-scaffold.md",
  "openspec/README.md",
] as const;

describe("repository governance", () => {
  it("publishes one implementation reading order from the repository root", async () => {
    const instructions = await readFile("AGENTS.md", "utf8");

    for (const path of authoritativePaths) {
      expect(instructions).toContain(path);
    }

    expect(instructions).toContain("repository proof");
    expect(instructions).toContain("deployment proof");
    expect(instructions).toContain("live-provider acceptance");
  });

  it("keeps standards and stack decisions mutually linked", async () => {
    const standards = await readFile("docs/code-standards.md", "utf8");
    const stack = await readFile(
      "docs/architecture/tech-stack-and-scaffold.md",
      "utf8",
    );

    expect(standards).toContain("docs/architecture/tech-stack-and-scaffold.md");
    expect(stack).toContain("docs/code-standards.md");
    expect(stack).toContain("establish-application-engineering-foundation");
  });
});
