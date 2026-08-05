# Tech stack and scaffold

Status: accepted by `establish-application-engineering-foundation`.

The application is one server-rendered TypeScript modular monolith. Next.js is
the route/rendering adapter; it is not the domain architecture. See
`docs/code-standards.md` for implementation rules and ADR 0002 for the Postgres
tooling decision.

## Runtime and package decisions

- Node.js 24.18.0 LTS, pinned by `.nvmrc`, `package.json`, CI, and the container.
- pnpm 9.15.4, pinned by the `packageManager` field and Corepack.
- Next.js 16.2.11 Active LTS App Router with stable APIs and Node runtime only.
- React and React DOM 19.2.8.
- Strict TypeScript 5.9.3.
- PostgreSQL through `pg`; ordered migrations through `node-pg-migrate`.
- Zod only at runtime input/configuration boundaries.
- Vitest for framework-neutral tests, real disposable PostgreSQL for persistence,
  production HTTP tests for server output, and Playwright for the current
  landing/Cooked Quiz journey.
- ESLint and Prettier for source quality, dependency-cruiser for layer/cycle
  enforcement, Knip for unused exports, and a repository-owned size check.

Exact package versions are locked in `pnpm-lock.yaml`. Upgrade versions
deliberately and keep the stable root command interface unchanged.

## Layout and dependency direction

```text
app/                         Next composition and rendering adapters
src/modules/<capability>/    framework-neutral domain/application modules
src/platform/                server-only runtime implementations
src/shared/                  demonstrated cross-module primitives only
tests/integration/           Postgres and production HTTP proof
tests/e2e/                   critical browser journeys
public/                      versioned public assets, never private uploads
docs/architecture/           accepted cross-cutting decisions
```

`app` may compose `modules`, `platform`, and `shared`. `platform` may implement
module-owned interfaces and depend on `shared`. `modules` may depend only on
`shared`. Modules never import `app`, React, `next/*`, or concrete platform
implementations. A port exists only when behavior varies across at least two
justified adapters, normally production and deterministic test versions.
One domain module never imports another; composition belongs in `app` or an
explicit owning application seam. Server Functions use the enforced
`*.action.ts(x)` convention, and all `app` entrypoints are prohibited from
importing database clients or module-internal policy files.

## Runtime posture

- Public documents render complete first-response HTML and metadata.
- Private database/configuration code is marked `server-only`; named authorized
  projections are the actual privacy boundary.
- No application cache, Edge runtime, worker, queue, microservice, monorepo
  package, generic repository, provider SDK, or shared UI library exists in
  Order 0.
- Media providers, authentication, email, storage, scanning, and hosting remain
  decisions of their owning changes.
- The build emits one portable standalone Node container with distinct liveness
  and readiness routes, graceful termination, and immutable build identity.

Repository proof does not include preview deployment, live migrations, crawler
unfurls, or provider acceptance.
