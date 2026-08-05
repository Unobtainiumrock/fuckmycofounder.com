import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { evaluateSourceSize } from "./source-size-policy.ts";

const roots = ["app", "src", "scripts"];
const sourceExtension = /\.[cm]?[jt]sx?$/u;

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) {
        return sourceFiles(entryPath);
      }

      return sourceExtension.test(entry.name) ? [entryPath] : [];
    }),
  );

  return nested.flat();
}

const files = (await Promise.all(roots.map(sourceFiles))).flat();
const failures: string[] = [];

for (const file of files) {
  const result = evaluateSourceSize(await readFile(file, "utf8"));

  if (!result.accepted) {
    failures.push(`${file}: ${result.lineCount} lines`);
  }
}

if (failures.length > 0) {
  throw new Error(`Source-size policy failed:\n${failures.join("\n")}`);
}
