import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import ts from "typescript";

const sourcePattern = /\.[cm]?[jt]sx?$/u;
const actionPattern = /\.action\.[cm]?[jt]sx?$/u;

async function sourceFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name);
      return entry.isDirectory()
        ? sourceFiles(entryPath)
        : sourcePattern.test(entry.name)
          ? [entryPath]
          : [];
    }),
  );
  return nested.flat();
}

function containsDirective(source: ts.SourceFile, directive: string): boolean {
  let found = false;

  function visit(node: ts.Node): void {
    if (
      ts.isExpressionStatement(node) &&
      ts.isStringLiteral(node.expression) &&
      node.expression.text === directive
    ) {
      found = true;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(source);
  return found;
}

const roots = process.argv.slice(2);
const targets = roots.length > 0 ? roots : ["app"];
const files = (await Promise.all(targets.map(sourceFiles))).flat();
const invalid: string[] = [];
const invalidClients: string[] = [];

for (const file of files) {
  const source = ts.createSourceFile(
    file,
    await readFile(file, "utf8"),
    ts.ScriptTarget.Latest,
    true,
  );

  if (containsDirective(source, "use server") && !actionPattern.test(file)) {
    invalid.push(file);
  }
  if (
    containsDirective(source, "use client") &&
    !file.replaceAll("\\", "/").includes("/app/_client/") &&
    !file.replaceAll("\\", "/").startsWith("app/_client/")
  ) {
    invalidClients.push(file);
  }
}

if (invalidClients.length > 0) {
  throw new Error(
    `Client modules must live under app/_client/:\n${invalidClients.join("\n")}`,
  );
}

if (invalid.length > 0) {
  throw new Error(
    `Server Functions must live in *.action files:\n${invalid.join("\n")}`,
  );
}
