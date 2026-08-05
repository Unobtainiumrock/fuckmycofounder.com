## Why

The proposed product changes assume authenticated server behavior, durable relational state, private identity projections, moderation, media, and crawler-readable public objects. The repository is still a dependency-free static site with one `npm test` command and no repo-wide implementation rules. Starting feature work now would let each implementation agent invent its own stack, module layout, safety boundary, and definition of done.

## What Changes

- Add a TypeScript-first, Postgres-backed modular-monolith foundation for one server-rendered public application and its authenticated network surfaces.
- Define small domain-module interfaces, server-only mutation paths, explicit public/restricted projections, injected nondeterminism, transactional writes, migrations, and media-ownership rules without prebuilding feature-owned providers.
- Add repository-wide model instructions and authoritative code standards covering spec-first work, surgical scope, strict types, boundary validation, deterministic logic, privacy-aware logging, dependency discipline, migrations, and evidence-backed completion.
- Add canonical local and CI gates for formatting, linting, typechecking, unit/component tests, disposable-Postgres integration tests, selected browser tests, dependency direction, file size, builds, and strict OpenSpec validation.
- Require one isolated worktree/branch/PR per substantive implementation change and serialized migration landing.
- Preserve the current static acquisition experience until an equivalent server-rendered route passes regression and accessibility checks.

Explicitly out: implementing Accounts, Profiles, Reviews, Feed, messaging, Open To, choosing production vendors or secrets, deploying infrastructure, and copying Sift-specific brain/RAG or provider rules.

## Impact

- Adds `application-foundation`, `engineering-standards`, and `verification-gates` capabilities.
- Becomes implementation order zero and a dependency of every network feature change.
- Adds an application scaffold, local Postgres test boundary, repository governance documents, quality tooling, and CI in implementation.
- Main risks are over-scaffolding, framework coupling, false-green gates, migration collisions, and privacy rules that exist only in prose rather than executable checks.
