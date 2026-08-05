# Foundation verification record

Status: repository implementation complete for
`establish-application-engineering-foundation` on 2026-08-05.

## Pinned toolchain

| Layer | Exact version |
| --- | --- |
| Node.js runtime and container base | 24.18.0 LTS |
| pnpm | 9.15.4 |
| Next.js | 16.2.11 Active LTS |
| React / React DOM | 19.2.8 |
| TypeScript | 5.9.3 |
| PostgreSQL test image | 17-alpine |
| `pg` | 8.22.0 |
| `node-pg-migrate` | 9.0.0 |
| Vitest | 4.0.18 |
| Playwright | 1.58.2 |
| ESLint | 9.39.2 |
| Prettier | 3.6.2 |
| dependency-cruiser | 17.3.8 |
| Knip | 5.83.1 |
| OpenSpec CLI | 1.6.0 |

The lockfile is the package-level authority. `.nvmrc`, `package.json`, the CI
workflow, and `Dockerfile` independently pin the runtime. The final container
smoke test verified Node 24.18.0, the non-root `node` user, liveness, readiness,
and bounded SIGTERM shutdown.

## Repository proof

The clean-checkout gate comprises frozen installation, non-mutating formatting,
type-aware linting, dependency architecture, unused exports, strict TypeScript,
production build, legacy and Vitest suites, disposable Postgres integration,
production standalone HTTP tests, desktop/mobile Playwright, source-size policy,
strict validation of all OpenSpec changes, generated-tree cleanliness, and the
container smoke test. CI encodes the same fail-closed order with a 30-minute job
timeout and concurrency cancellation.

The Postgres proof uses only a local disposable `fmcf_test` identity. Test
migrations create foundation-only fixture tables, exercise an invariant under
concurrency, require an audit record in the same one-client transaction, and
prove rollback when that audit write fails. No product table or production
migration was introduced.

## Explicitly deferred evidence

No production database, authentication, email, object storage, scanning, CDN,
hosting, queue, analytics, DNS, or secret provider has been selected or mutated.
There is no preview deployment, live migration, crawler-unfurl, or provider
acceptance evidence. Those decisions and live checks belong to later owning
changes and require separate authority.
