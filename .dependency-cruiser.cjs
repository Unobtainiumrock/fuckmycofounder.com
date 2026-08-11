module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: { circular: true },
    },
    {
      name: "not-to-unresolvable",
      severity: "error",
      from: {},
      to: { couldNotResolve: true },
    },
    {
      name: "modules-cannot-import-platform",
      severity: "error",
      from: { path: "(^|/)src/modules/" },
      to: { path: "(^|/)src/platform/" },
    },
    {
      name: "modules-cannot-import-app",
      severity: "error",
      from: { path: "(^|/)src/modules/" },
      to: { path: "(^|/)app/" },
    },
    {
      name: "modules-cannot-import-runtime-dependencies",
      severity: "error",
      from: { path: "(^|/)src/modules/" },
      to: {
        dependencyTypes: [
          "core",
          "npm",
          "npm-dev",
          "npm-optional",
          "npm-peer",
        ],
      },
    },
    {
      name: "client-cannot-import-platform",
      severity: "error",
      from: { path: "(^|/)app/_client/" },
      to: { path: "(^|/)src/platform/" },
    },
    {
      name: "routes-cannot-import-persistence",
      severity: "error",
      from: { path: "(^|/)app/(api/.+/route|.+action)\\.[cm]?[jt]sx?$" },
      to: { path: "(^|/)src/platform/(persistence|restricted)/" },
    },
    {
      name: "app-cannot-import-database-clients",
      severity: "error",
      from: { path: "(^|/)app/" },
      to: {
        dependencyTypes: ["npm", "npm-dev", "npm-optional", "npm-peer"],
        path: "node_modules/\\.pnpm/(pg@|node-pg-migrate@)",
      },
    },
    {
      name: "app-uses-module-public-interface",
      severity: "error",
      from: { path: "(^|/)app/" },
      to: { path: "(^|/)src/modules/[^/]+/(?!index\\.[cm]?[jt]sx?$)" },
    },
    {
      name: "metadata-cannot-import-persistence",
      severity: "error",
      from: { path: "(^|/)app/" },
      to: { path: "(^|/)src/platform/(persistence|restricted)/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
    tsConfig: { fileName: "tsconfig.json" },
  },
};
