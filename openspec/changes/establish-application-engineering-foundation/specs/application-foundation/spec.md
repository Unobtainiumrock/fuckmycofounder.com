## ADDED Requirements

### Requirement: The network starts as one server-rendered modular monolith
The application SHALL use one TypeScript deployment unit on the Node.js runtime, SHALL use the current patched Active LTS Next.js App Router release pinned by the lockfile, and SHALL NOT introduce a canary framework, Edge-runtime dependency, microservice, distributed queue, or speculative workspace before a proven requirement demands it.

#### Scenario: Foundation is scaffolded
- **WHEN** the network application first builds
- **THEN** one production artifact serves the current public pages and is the defined host for later authenticated routes and Route Handlers backed by framework-neutral domain modules on Node.js

#### Scenario: New runtime boundary is proposed
- **WHEN** an implementation wants a separate service, worker, Edge function, or package
- **THEN** it requires an approved design that names the load, security, deployment, operational, or real-reuse evidence that makes the additional boundary necessary

### Requirement: Public objects render complete first-response documents
The current public acquisition route and every public Profile, Review, Post, Comment, canonical-sharing, and metadata route introduced by an owning feature SHALL render crawler-readable HTML on the server, SHALL serve canonical and robots metadata from current authorized public projections, and SHALL support deterministic per-object Open Graph images without requiring browser JavaScript or an Account.

#### Scenario: Social crawler opens a Review
- **WHEN** an anonymous HTML-limited crawler requests an eligible Review URL
- **THEN** the first response contains the current canonical title, description, URL, robots policy, and eligible preview-image metadata without private or session-derived fields

#### Scenario: Public source becomes ineligible
- **WHEN** a source is withdrawn, limited, removed, anonymized, merged, or loses required context
- **THEN** its document, metadata, and generated-image path resolve the current safe projection rather than a cached stale revision

### Requirement: Framework files are adapters rather than domain owners
Next.js pages, layouts, Server Functions, metadata functions, and Route Handlers SHALL translate framework requests and responses around framework-free domain-module interfaces and SHALL NOT own authorization policy, state transitions, transaction orchestration, ranking, aggregation, attribution, or retention logic.

#### Scenario: Server Function receives a command
- **WHEN** a signed-in form invokes a mutation
- **THEN** the Server Function authenticates the request context and calls one intent-level domain command whose result is a typed viewer projection

#### Scenario: Framework is replaced
- **WHEN** the route framework changes while domain behavior is unchanged
- **THEN** domain modules and their interface tests remain reusable without importing `next/*`, React types, cookies, cache functions, or route objects

### Requirement: Private modules are server-only and return named projections
Database, authentication, moderation, evidence, anonymous-attribution, messaging, risk, and private-projection implementations SHALL be statically barred from client imports and SHALL return named public, viewer, staff, or consumer-specific projections rather than persistence records or field-optional catch-all objects.

#### Scenario: Client module imports restricted persistence
- **WHEN** a browser-reachable module imports a private database or identity implementation
- **THEN** the production build or architecture gate fails before deployment

#### Scenario: Viewer reads a Profile
- **WHEN** an authorized application module returns Profile data
- **THEN** it selects the explicit projection for that viewer and no downstream component performs field-level privacy filtering

### Requirement: Postgres is the canonical relational store
Canonical Accounts, Profiles, content, relationships, policy state, moderation, reactions, messages, retention state, and audit records introduced by owning features SHALL live in Postgres behind server-only persistence adapters, committed migrations, constraints, and an explicit transaction runner; the selected driver and migration toolkit SHALL be recorded before feature migrations begin.

#### Scenario: Multi-step domain command executes
- **WHEN** a mutation reads, locks, writes, and audits related records
- **THEN** every statement uses one transaction client and commits or rolls back as one operation

#### Scenario: Query tool is selected
- **WHEN** the foundation chooses a driver, query builder, ORM, or migration tool
- **THEN** an architecture record proves explicit transaction control, SQL-constraint support, deterministic migrations, disposable-test compatibility, maintained TypeScript types, and why the selected combination is the smallest sufficient choice

### Requirement: Browser mutations cross authenticated server entrypoints
Canonical browser writes introduced by owning features SHALL use Server Functions for bounded UI commands or Route Handlers for external protocols, webhooks, uploads, downloads, and non-UI clients; every entrypoint SHALL authenticate, authorize, validate, enforce idempotency where retries are possible, and return a safe typed result.

#### Scenario: Browser attempts a direct table write
- **WHEN** client code tries to use a database or storage credential to mutate canonical state
- **THEN** repository architecture checks reject the import and the capability remains available only through the owning server command

#### Scenario: Webhook retries
- **WHEN** an external provider repeats a previously accepted event
- **THEN** the Route Handler validates provider authenticity and the domain command produces the same durable outcome without duplicating effects

### Requirement: Media uses provider-neutral storage and processing seams
Profile photos, Review Exhibits, Post images, and generated Share Clips introduced by owning features SHALL use private or public object storage through justified adapters, while Postgres stores authoritative ownership, provenance, lifecycle, and derivative metadata; durable media SHALL NOT depend on framework-local disk or large Server Function bodies. Order 0 SHALL NOT predeclare provider ports that no implemented capability consumes.

#### Scenario: Account submits media
- **WHEN** an eligible upload begins
- **THEN** a server command authorizes a bounded upload intent or Route Handler stream, and publication remains a separate validated and moderated transition

#### Scenario: Storage provider changes
- **WHEN** a production storage adapter is replaced
- **THEN** domain media policy and its deterministic tests remain unchanged behind the storage and processing interfaces

### Requirement: Correctness precedes application caching
Sensitive and public-object reads SHALL be dynamic or uncached at foundation launch, and application caching SHALL NOT be introduced until an approved change proves coordinated invalidation for edits, withdrawals, blocks, claim changes, moderation, deletion, retention, and multi-instance deployment.

#### Scenario: Agent adds a framework cache directive
- **WHEN** a public or viewer projection is proposed for caching
- **THEN** review rejects it unless the active change specifies ownership, versioning, invalidation-before-visibility, multi-instance behavior, and stale-safety tests

#### Scenario: Performance is unmeasured
- **WHEN** a route is considered slow without a production-representative measurement
- **THEN** the implementation simplifies or measures the uncached path instead of adding speculative caching

### Requirement: Configuration is typed and environment-separated
Server runtime configuration SHALL initialize once per process as a typed server-only object, SHALL distinguish local, test, preview, and production environments, SHALL reject missing or malformed required values, and SHALL prevent local or test commands from targeting any configured production database or later-added provider project by default. Explicitly public build-time values SHALL use a separate allowlisted projection.

#### Scenario: Test command receives a production database URL
- **WHEN** an integration or browser test resolves a configured production database identity
- **THEN** it aborts before connecting or mutating and reports the rejected environment class without printing credentials

#### Scenario: Browser bundle requests configuration
- **WHEN** client code needs an explicitly public build-time value
- **THEN** it imports only the allowlisted public configuration projection and cannot import the server runtime object

#### Scenario: Later change adds provider configuration
- **WHEN** an owning feature introduces configuration for an external provider
- **THEN** it extends the typed environment contract with an explicit disabled state and cannot silently select a production project

### Requirement: The current acquisition surface migrates without a blind cutover
The existing dependency-free landing and Cooked Quiz experience SHALL remain available until the server-rendered replacement matches its canonical content, accessibility, responsive layout, sharing behavior, and regression tests, and the migration SHALL preserve public URLs or provide explicit redirects.

#### Scenario: New application scaffold lands
- **WHEN** the first Next.js build replaces the static entrypoint
- **THEN** regression and browser tests prove the current public experience before the old assets are retired or relocated

#### Scenario: Existing share fragment is opened
- **WHEN** a previously distributed static share URL remains within the supported compatibility window
- **THEN** the new application renders the equivalent safe result or an explicitly specified migration outcome rather than silently discarding it

### Requirement: The deployment baseline is a portable standalone Node artifact
The foundation SHALL produce a standalone Node container artifact with a health endpoint, a readiness check that verifies required internal dependencies without exposing secrets, graceful shutdown, immutable build identity, and no production-provider assumption in repository tests.

#### Scenario: Production build is created
- **WHEN** the canonical build command succeeds
- **THEN** the standalone artifact starts without a development toolchain and reports its immutable version through a restricted operational surface

#### Scenario: Database is unavailable at readiness
- **WHEN** the process is alive but a required canonical dependency cannot serve safe traffic
- **THEN** liveness remains distinct from readiness and the deployment does not advertise the instance as ready
