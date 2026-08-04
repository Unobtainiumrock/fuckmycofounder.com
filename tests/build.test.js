import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { build } from "../scripts/build.mjs";
import { dependencyOrder, rewriteModuleSpecifiers } from "../scripts/fingerprint.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const HASHED_NAME = /\.[0-9a-f]{10}\.(?:js|css)$/;
const HTML_REFERENCE = /(?:href|src)="(\/(?:assets|shared)\/[^"]+)"/g;
const SPECIFIER = /(?:from|import\()\s*"(\.[^"]+)"/g;
const UNCOPIED = new Set([".git", ".wrangler", "node_modules", "dist"]);

async function tempDir(t) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "fmc-"));
  t.after(() => fs.rm(directory, { recursive: true, force: true }));
  return directory;
}

async function buildTo(t, root = ROOT) {
  const outDir = await tempDir(t);
  return { outDir, manifest: await build({ root, outDir }) };
}

async function copySource(t) {
  const root = await tempDir(t);
  await fs.cp(ROOT, root, {
    recursive: true,
    filter: (source) => {
      const relative = path.relative(ROOT, source);
      return relative === "" || !relative.split(path.sep).some((segment) => UNCOPIED.has(segment));
    }
  });
  return root;
}

async function listBuiltScripts(outDir) {
  const entries = await fs.readdir(outDir, { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".js"))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

test("every script and stylesheet is emitted under a content-hashed name", async (t) => {
  const { manifest } = await buildTo(t);
  assert.ok(manifest.size > 0);
  for (const [source, hashed] of manifest) {
    assert.match(hashed, HASHED_NAME, `${source} was not fingerprinted`);
  }
});

test("built html only references files that exist in the build", async (t) => {
  const { outDir } = await buildTo(t);
  const html = await fs.readFile(path.join(outDir, "index.html"), "utf8");
  const references = [...html.matchAll(HTML_REFERENCE)].map(([, reference]) => reference);

  assert.ok(references.some((reference) => reference.endsWith(".js")));
  for (const reference of references) {
    await fs.access(path.join(outDir, reference));
    const stable = reference.startsWith("/assets/images/") || reference.startsWith("/assets/icons/");
    assert.ok(stable || HASHED_NAME.test(reference), `${reference} is served without a content hash`);
  }
});

test("import specifiers in the build resolve to emitted files", async (t) => {
  const { outDir } = await buildTo(t);
  const scripts = await listBuiltScripts(outDir);
  assert.ok(scripts.length > 0);

  for (const script of scripts) {
    const source = await fs.readFile(script, "utf8");
    for (const [, specifier] of source.matchAll(SPECIFIER)) {
      assert.match(specifier, HASHED_NAME, `${script} imports unfingerprinted ${specifier}`);
      await fs.access(path.resolve(path.dirname(script), specifier));
    }
  }
});

test("editing a leaf module changes the hash of everything that imports it", async (t) => {
  const root = await copySource(t);
  const before = await buildTo(t, root);

  const leaf = path.join(root, "shared/case-limits.js");
  await fs.appendFile(leaf, "\nexport const BUILD_PROBE = 1;\n");
  const after = await buildTo(t, root);

  for (const importer of ["shared/case-limits.js", "assets/js/modules/codec.js", "assets/js/app.js"]) {
    assert.notEqual(after.manifest.get(importer), before.manifest.get(importer), `${importer} kept a stale hash`);
  }
  assert.equal(
    after.manifest.get("assets/js/modules/content.js"),
    before.manifest.get("assets/js/modules/content.js"),
    "unrelated modules should keep their hash so clients keep cache hits"
  );
});

test("rewriting covers static, dynamic, and legacy versioned specifiers", () => {
  const source = [
    'import { a } from "./a.js";',
    'import { b } from "../b.js?v=20260804f";',
    'const c = await import("./c.js");'
  ].join("\n");

  const rewritten = rewriteModuleSpecifiers(source, (specifier) => `${specifier.split("?")[0]}#hashed`);

  assert.equal(rewritten.includes("?v="), false);
  assert.match(rewritten, /from "\.\/a\.js#hashed"/);
  assert.match(rewritten, /from "\.\.\/b\.js#hashed"/);
  assert.match(rewritten, /import\("\.\/c\.js#hashed"\)/);
});

test("dependency order emits leaves first and rejects cycles", () => {
  const order = dependencyOrder(new Map([["app.js", ["leaf.js"]], ["leaf.js", []]]));
  assert.deepEqual(order, ["leaf.js", "app.js"]);

  assert.throws(
    () => dependencyOrder(new Map([["a.js", ["b.js"]], ["b.js", ["a.js"]]])),
    /Circular module dependency/
  );
});
