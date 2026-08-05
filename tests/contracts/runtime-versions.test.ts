import { readFile } from "node:fs/promises";

import { describe, expect, it } from "vitest";

interface PackageManifest {
  engines?: { node?: string };
  packageManager?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

describe("runtime version contract", () => {
  it("pins the approved runtime, package manager, framework, and compiler", async () => {
    const manifest = JSON.parse(
      await readFile("package.json", "utf8"),
    ) as PackageManifest;
    const nodeVersion = (await readFile(".nvmrc", "utf8")).trim();

    expect(nodeVersion).toBe("24.18.0");
    expect(manifest.engines?.node).toBe("24.18.x");
    expect(manifest.packageManager).toMatch(/^pnpm@9\.15\.4\+/u);
    expect(manifest.dependencies?.next).toBe("16.2.11");
    expect(manifest.devDependencies?.typescript).toBe("5.9.3");
  });

  it("enables every strict TypeScript family rather than overriding it", async () => {
    const tsconfig = JSON.parse(await readFile("tsconfig.json", "utf8")) as {
      compilerOptions?: Record<string, unknown>;
    };

    expect(tsconfig.compilerOptions?.strict).toBe(true);
    expect(tsconfig.compilerOptions?.noUncheckedIndexedAccess).toBe(true);
    expect(tsconfig.compilerOptions?.exactOptionalPropertyTypes).toBe(true);
  });

  it("bakes build identity into the runner image and proves the reported value", async () => {
    const [dockerfile, smokeTest] = await Promise.all([
      readFile("Dockerfile", "utf8"),
      readFile("scripts/test/container-smoke.sh", "utf8"),
    ]);

    expect(dockerfile).toContain(
      "printf 'export const artifactBuildId = \"%s\";\\n'",
    );
    expect(dockerfile).not.toMatch(
      /FROM node:24\.18\.0-alpine AS runner[\s\S]*ENV BUILD_ID=/u,
    );
    expect(dockerfile).toContain('CMD ["node", "start-standalone.mts"]');
    expect(smokeTest).toContain("--build-arg BUILD_ID=container-ci");
    expect(smokeTest).toContain("--env BUILD_ID=runtime-override");
    expect(smokeTest).toContain("x-build-id: container-ci");
  });
});
