## Context

The repository is a small static site, while the proposed network specs require crawlable public objects, authenticated mutations, private identity projections, Postgres transactions, moderation, uploads, generated social images, and later background expiry or delivery work. The foundation should make those behaviors consistent without importing Sift's brain/RAG architecture or constructing a large platform before the first product slice.

Primary-source framework research is recorded in [`docs/research/application-foundation-stack-primary-sources.md`](../../../docs/research/application-foundation-stack-primary-sources.md).

## Decisions and rationale

### Use Next.js Active LTS narrowly

Use the current patched **Active LTS Next.js App Router** release on a supported LTS Node.js runtime, pin exact versions in the lockfile, and produce `output: "standalone"`. Next.js wins over React Router Framework Mode for FMCF because per-object metadata and dynamic Open Graph images are central product capabilities rather than ancillary SEO work. React Router remains the fallback if the team rejects Next's Server Component and cache operational costs.

Next.js is the route and rendering adapter, not the architecture. `app/` files may authenticate request context, parse framework inputs, and render typed projections. They cannot own domain transitions, SQL, policy interpretation, attribution, ranking, or cache truth. `server-only` protects every private implementation, but explicit projection types—not the import marker alone—provide the privacy model.

Async Server Components are not a unit-test surface. Domain modules use Vitest without Next.js; route behavior, metadata, Server Functions, and async Server Components use production-build HTTP or focused Playwright tests.

### Start with one package and one deployable

Do not copy Sift's monorepo. Begin with one pnpm-managed package because there is only one application and no proven reuse boundary. A later worker or package requires real independent deployment or reuse evidence.

```text
app/                         # Next route/rendering adapters only
src/modules/<capability>/    # domain and application modules
src/platform/                # Postgres, auth, storage, email, observability adapters
src/shared/                  # tiny dependency-free primitives with real cross-module reuse
tests/integration/           # disposable-Postgres and production-build HTTP tests
tests/e2e/                   # critical browser journeys only
public/                      # versioned public assets, never private uploads
docs/architecture/           # accepted cross-cutting decisions
```

`app` is the composition root and may depend on `modules`, `platform`, and `shared`; `platform` may implement module-owned interfaces and depend on `shared`; `modules` may depend only on `shared`. Modules never import `app` or concrete `platform` implementations. A port exists only when behavior really varies across at least two justified adapters, normally production and deterministic test implementations; otherwise the dependency remains private implementation.

### Keep domain commands transaction-shaped

Postgres is canonical. The foundation selects one maintained Node driver and one migration/query approach only after a tiny transaction-and-migration proof, then records the decision in an ADR. Selection criteria are explicit transaction-client ownership, constraints, typed results, deterministic forward migrations, concurrency tests, and disposable database setup—not ORM ergonomics alone.

A domain command receives a typed intent and an execution context containing the actor and justified dependencies. It authorizes, opens one transaction where durable state changes, writes canonical state plus any policy-required audit or outbox facts, and returns a typed result projection. Routes never call a generic table repository or compose partial transactions.

### Separate public projections structurally

Persistence records are restricted. Each domain module owns named public, viewer, staff, and consumer-specific projections as needed. Public Profiles, anonymous Reviews, Feed items, metadata, notifications, exports, and Share Clips consume those projections and cannot query raw records. A projection failure never falls back to serialization of an ORM result.

This rule receives an executable noninterference harness before feature work. Order 0 proves the harness with paired allowed/forbidden fixtures; each owning feature adds its real Account, evidence, Block, report, moderation, risk, message, and Open To projections before those surfaces ship.

### Delay caches, queues, and provider topology

Launch foundation reads for Profiles and content are dynamic. Next.js cache directives, ISR, tag invalidation, CDN object caching, and in-memory cross-request caches require a later approved policy with subtractive invalidation and multi-instance tests. Correct removal and anonymity transitions matter more than early read optimization.

No distributed queue is selected. Future delivery, expiry, retention, and media jobs may consume an atomic Postgres outbox through a worker entrypoint only when the feature tasks require it. Authentication, email, object storage, scanning, and hosting providers—and the ports that isolate them—are selected by their owning changes when at least two justified adapters make a real seam; no secrets or external resource mutation belongs in this proposal.

### Migrate the existing site through parity

The current static landing and Cooked Quiz are user-visible behavior, not disposable scaffold. The first server-rendered route reproduces them before static files are removed. URL, fragment compatibility, accessibility, visuals, CSP, share behavior, and the four current deterministic tests become regression inputs. Network CSP changes are route-specific and allowlisted; the public acquisition page does not gain broad third-party access merely because authenticated routes need it.

The static landing's optional local subject image, live case-file preview, and
Town Board entry are acquisition parity. Its Cloudflare Functions/KV/R2/D1
case creation, persisted-case retrieval, publishing, feed, and comment-thread
operations are not: Order 0 keeps those providers and their production
workflow intact, links to `/board`, and preserves fragment-only local reports
in the Next route. Moving provider-backed cases or threads requires an owning
feature change and separately authorized provider acceptance.

## Verification architecture

The root command interface is stable even if tools change:

```text
pnpm format
pnpm format:check
pnpm lint
pnpm typecheck
pnpm build:app
pnpm test:all
pnpm test:integration
pnpm test:e2e
pnpm check:architecture
pnpm check:file-sizes
pnpm openspec:validate
```

During the compatibility period, unqualified `build` and `test` preserve the
existing Cloudflare static production workflow. `build:app` and `test:all` are
the canonical foundation gates until that deployment path is explicitly cut
over.

`pnpm format` is the local formatter and `pnpm format:check` is the non-mutating gate. Prettier owns formatting; type-aware ESLint owns unsafe TypeScript, Promises, React, complexity, nesting, and parameters; a TypeScript-aware dependency check owns cycles and direction; Vitest owns domain/component tests; disposable Postgres owns persistence integration; Playwright owns critical user journeys. Pull-request CI installs from the frozen pnpm lockfile and runs the whole clean-checkout gate.

Repository proof ends at reproducible artifacts and tests. Preview deployment, database migration application, crawler unfurls, auth/email/storage providers, and production health remain separately authorized acceptance layers.

## Explicit exclusions

- No Account, Profile, Review, Feed, messaging, Open To, or moderation product behavior is implemented.
- No production auth, database, storage, email, CDN, queue, hosting, DNS, or secret provider is chosen or mutated.
- No Sift brain, RAG, pgvector, Markdown-record, agent, connector, or AWS rule is copied.
- No early cache, Edge runtime, microservice, monorepo package, generic repository, or shared UI library is introduced.
