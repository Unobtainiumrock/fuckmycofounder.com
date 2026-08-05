# ADR 0002: Postgres driver, migrations, and transaction ownership

- Status: accepted
- Change: `establish-application-engineering-foundation`
- Date: 2026-08-05

## Decision

Use `pg` 8.22.0 as the only application Postgres driver and
`node-pg-migrate` 9.0.0 as the migration toolkit. Keep SQL visible at the
module-owned persistence adapter rather than adding an ORM or generic
repository before a product schema exists.

Every durable intent owns exactly one transaction through the repository
transaction runner. The runner checks out one pooled client, begins the
transaction, sets a local five-second statement timeout, invokes one bounded
operation, commits on success, rolls back on failure, and always releases the
client. Nested transaction ownership is denied. Network/provider calls and
unbounded computation happen before or after this scope, never while locks are
held. Commands that lock multiple rows must use a stable ordering or one atomic
statement.

Database constraints—not preflight reads—own invariants. New timestamps use
`timestamptz`; strings use `text`; single-database internal identifiers default
to `bigint generated always as identity`. Externally exposed identifier choices
remain with their owning product changes.

Migrations are ordered, forward files named
`13-digit-order_description.mjs`. Timestamp collisions and out-of-order
manifests fail before connecting. Product migrations live in `migrations/`;
foundation constraint/concurrency proof remains test-only. The current CLI is
deliberately disposable-test-only. Production migration execution belongs to a
separately authorized deployment change and may not acquire a default URL.

## Required proof

The persistence foundation is accepted only when all of these pass:

- commit, rollback, nested-call denial, release, safe error, and connection
  failure tests through the transaction runner;
- empty-to-current and repeat migration runs against disposable Postgres;
- previous-schema-to-current upgrade and ordering-collision tests;
- a real constraint plus two concurrent compare-and-update attempts;
- an audit write in the same transaction, including proof that audit failure
  rolls the domain write back;
- disposable identity rejection for non-local, non-test, and production
  targets.

Typed query results are required at each owning adapter. The foundation does
not invent feature result types before those queries exist.

## Rejected alternatives

| Alternative | Why it is rejected now | Reconsider when |
| --- | --- | --- |
| Prisma ORM | Generates a second schema/type authority and a broad client before any product table exists. | A later schema demonstrates that generated relations and migration workflow reduce more complexity than they add. |
| Drizzle ORM/query builder | Adds a schema DSL and abstraction without a current query set to evaluate. | Several owning modules repeat type-safe SQL construction that cannot be kept local and clear. |
| Kysely query builder | Improves typed composition but still requires a parallel database type model and separate migrations. | Real cross-table query composition becomes a proven maintenance problem. |
| Raw `pg` connections per request | Exhausts database connections and makes transaction ownership ambiguous. | Never for the web application; bounded administrative tooling must justify its own lifecycle. |
| Generic repository/unit-of-work layer | Hides SQL and transaction boundaries behind speculative reuse. | Multiple real modules demonstrate the same stable intent-level interface. |
| In-memory or mocked persistence as integration proof | Cannot prove constraints, lock behavior, migration ordering, or rollback. | Never as the sole persistence proof; fakes remain appropriate only for deterministic module tests. |

## Consequences

The application has a small bounded pool and a visible transaction seam, while
feature SQL and production tables remain deferred. Callers receive typed safe
failures with correlation IDs; raw driver messages and credentials are not
public error data. Deployment and live-provider acceptance are explicitly not
proved by this ADR or its repository tests.
