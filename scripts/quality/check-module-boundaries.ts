import { spawnSync } from "node:child_process";

interface CruiseDependency {
  readonly resolved: string;
}

interface CruiseModule {
  readonly dependencies: readonly CruiseDependency[];
  readonly source: string;
}

interface CruiseReport {
  readonly modules: readonly CruiseModule[];
}

const roots = process.argv.slice(2);
const targets = roots.length > 0 ? roots : ["app", "src", "scripts"];
const result = spawnSync(
  "node_modules/.bin/depcruise",
  ["--config", ".dependency-cruiser.cjs", "--output-type", "json", ...targets],
  { cwd: process.cwd(), encoding: "utf8" },
);

if (result.status !== 0) {
  process.stderr.write(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

const report = JSON.parse(result.stdout) as CruiseReport;
const modulePath = /(?:^|\/)src\/modules\/([^/]+)\//u;
const violations: string[] = [];

for (const source of report.modules) {
  const owner = modulePath.exec(source.source)?.[1];

  if (!owner) {
    continue;
  }

  for (const dependency of source.dependencies) {
    const dependencyOwner = modulePath.exec(dependency.resolved)?.[1];

    if (dependencyOwner && dependencyOwner !== owner) {
      violations.push(
        `${source.source} imports module ${dependencyOwner} through ${dependency.resolved}`,
      );
    }
  }
}

if (violations.length > 0) {
  throw new Error(
    `Modules must depend only on shared code:\n${violations.join("\n")}`,
  );
}
