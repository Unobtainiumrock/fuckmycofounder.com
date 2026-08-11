import { createHash } from "node:crypto";
import path from "node:path";

export const HASH_LENGTH = 10;

// Matches static `from "./x.js"` and dynamic `import("./x.js")` specifiers,
// tolerating a legacy `?v=` query so old sources still build.
const SPECIFIER_PATTERN =
  /(\bfrom\s*"|\bimport\(\s*")(\.{1,2}\/[^"]*?\.js)(\?[^"]*?)?"/g;

export function hashContent(content) {
  return createHash("sha256")
    .update(content)
    .digest("hex")
    .slice(0, HASH_LENGTH);
}

export function fingerprint(relativePath, hash) {
  const extension = path.posix.extname(relativePath);
  return `${relativePath.slice(0, -extension.length)}.${hash}${extension}`;
}

export function moduleSpecifiers(source) {
  return [...source.matchAll(SPECIFIER_PATTERN)].map((match) => match[2]);
}

export function rewriteModuleSpecifiers(source, resolve) {
  return source.replace(
    SPECIFIER_PATTERN,
    (match, prefix, specifier) => `${prefix}${resolve(specifier)}"`,
  );
}

export function resolveSpecifier(fromPath, specifier) {
  const target = specifier.split("?")[0];
  return path.posix.normalize(
    path.posix.join(path.posix.dirname(fromPath), target),
  );
}

export function relativeSpecifier(fromPath, targetPath) {
  const relative = path.posix.relative(
    path.posix.dirname(fromPath),
    targetPath,
  );
  return relative.startsWith(".") ? relative : `./${relative}`;
}

// Leaves first, so a module's own hash already covers its rewritten imports.
export function dependencyOrder(dependencies) {
  const order = [];
  const state = new Map();

  const visit = (id, trail) => {
    if (state.get(id) === "done") return;
    if (state.get(id) === "visiting") {
      throw new Error(
        `Circular module dependency: ${[...trail, id].join(" -> ")}`,
      );
    }
    state.set(id, "visiting");
    for (const dependency of dependencies.get(id) ?? []) {
      if (!dependencies.has(dependency)) {
        throw new Error(
          `${id} imports ${dependency}, which is not a build input`,
        );
      }
      visit(dependency, [...trail, id]);
    }
    state.set(id, "done");
    order.push(id);
  };

  for (const id of dependencies.keys()) visit(id, []);
  return order;
}
