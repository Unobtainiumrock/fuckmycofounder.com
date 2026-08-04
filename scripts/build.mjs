#!/usr/bin/env node
// Produces dist/: a byte-identical copy of the site with every JS and CSS file
// renamed to include a hash of its contents. Content-addressed URLs make the
// Cloudflare edge cache safe to treat as immutable, and remove the need to
// hand-bump `?v=` query strings on every deploy.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  dependencyOrder,
  fingerprint,
  hashContent,
  moduleSpecifiers,
  relativeSpecifier,
  resolveSpecifier,
  rewriteModuleSpecifiers
} from "./fingerprint.mjs";

const ROOT = fileURLToPath(new URL("..", import.meta.url));

// `shared/` is imported by the browser as well as by Pages Functions, so it is
// fingerprinted alongside the client bundle.
const SCRIPT_DIRS = ["assets/js", "shared"];
const STYLE_DIR = "assets/css";
const COPY_FILES = ["index.html", "board/index.html", "404.html", "CNAME", "robots.txt", "sitemap.xml", "_headers"];
const COPY_DIRS = ["assets/images", "assets/icons"];

const HTML_ASSET_REFERENCE = /\/(assets\/(?:js|css)\/[\w./-]+\.(?:js|css))(\?[^"'\s>]*)?/g;
const CSS_URL_REFERENCE = /url\(\s*["']?([^"')]+)/g;
// Inlined SVG data URIs contain their own url(#filter) references.
const CSS_DATA_URI = /url\(\s*["']?data:[^)]*\)/g;
const PORTABLE_URL_PREFIXES = ["http:", "https:", "//", "#", "/assets/images/", "/assets/icons/"];

async function listFiles(root, directory) {
  const entries = await fs.readdir(path.join(root, directory), { withFileTypes: true, recursive: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.posix.join(path.relative(root, entry.parentPath).split(path.sep).join("/"), entry.name))
    .sort();
}

async function writeFile(outDir, relativePath, content) {
  const target = path.join(outDir, relativePath);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, content);
}

function assertNoLocalUrls(relativePath, css) {
  for (const [, reference] of css.replace(CSS_DATA_URI, "").matchAll(CSS_URL_REFERENCE)) {
    if (PORTABLE_URL_PREFIXES.some((prefix) => reference.startsWith(prefix))) continue;
    throw new Error(`${relativePath} references ${reference}; fingerprinted CSS cannot resolve relative urls`);
  }
}

async function fingerprintScripts(root, outDir, manifest) {
  const listings = await Promise.all(SCRIPT_DIRS.map((directory) => listFiles(root, directory)));
  const files = listings.flat().filter((file) => file.endsWith(".js"));
  const sources = new Map();
  for (const file of files) {
    sources.set(file, await fs.readFile(path.join(root, file), "utf8"));
  }

  const dependencies = new Map(
    files.map((file) => [file, moduleSpecifiers(sources.get(file)).map((specifier) => resolveSpecifier(file, specifier))])
  );

  for (const file of dependencyOrder(dependencies)) {
    const rewritten = rewriteModuleSpecifiers(sources.get(file), (specifier) => {
      const hashed = manifest.get(resolveSpecifier(file, specifier));
      if (!hashed) throw new Error(`${file} imports ${specifier} before it was fingerprinted`);
      return relativeSpecifier(file, hashed);
    });
    const hashed = fingerprint(file, hashContent(rewritten));
    manifest.set(file, hashed);
    await writeFile(outDir, hashed, rewritten);
  }
}

async function fingerprintStyles(root, outDir, manifest) {
  const files = (await listFiles(root, STYLE_DIR)).filter((file) => file.endsWith(".css"));
  for (const file of files) {
    const source = await fs.readFile(path.join(root, file), "utf8");
    assertNoLocalUrls(file, source);
    const hashed = fingerprint(file, hashContent(source));
    manifest.set(file, hashed);
    await writeFile(outDir, hashed, source);
  }
}

function rewriteHtml(relativePath, html, manifest) {
  return html.replace(HTML_ASSET_REFERENCE, (match, reference) => {
    const hashed = manifest.get(reference);
    if (!hashed) throw new Error(`${relativePath} references ${reference}, which is not a build output`);
    return `/${hashed}`;
  });
}

export async function build({ root = ROOT, outDir = path.join(ROOT, "dist") } = {}) {
  await fs.rm(outDir, { recursive: true, force: true });

  const manifest = new Map();
  await fingerprintScripts(root, outDir, manifest);
  await fingerprintStyles(root, outDir, manifest);

  for (const directory of COPY_DIRS) {
    await fs.cp(path.join(root, directory), path.join(outDir, directory), { recursive: true });
  }

  for (const file of COPY_FILES) {
    const content = await fs.readFile(path.join(root, file), "utf8");
    await writeFile(outDir, file, file.endsWith(".html") ? rewriteHtml(file, content, manifest) : content);
  }

  return manifest;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const manifest = await build();
  for (const [source, hashed] of manifest) {
    console.log(`${source} -> ${hashed}`);
  }
  console.log(`Fingerprinted ${manifest.size} assets into dist/`);
}
