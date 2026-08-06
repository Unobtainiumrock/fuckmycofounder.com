# Foundation verification record

Status: the repository foundation was verified on 2026-08-05. Reconciliation
with later static-production work reopened acquisition parity and final review.

## Pinned toolchain

| Layer                              | Exact version                          |
| ---------------------------------- | -------------------------------------- |
| Node.js runtime and container base | 24.18.0 LTS                            |
| pnpm                               | 9.15.4                                 |
| Next.js                            | 16.2.11 Active LTS                     |
| React / React DOM                  | 19.2.8                                 |
| TypeScript                         | 5.9.3                                  |
| PostgreSQL test image              | 17.10-alpine (`sha256:742f40ea…52193`) |
| `pg`                               | 8.22.0                                 |
| `node-pg-migrate`                  | 9.0.0                                  |
| Vitest                             | 4.0.18                                 |
| Playwright                         | 1.58.2                                 |
| ESLint                             | 9.39.2                                 |
| Prettier                           | 3.6.2                                  |
| dependency-cruiser                 | 17.3.8                                 |
| Knip                               | 5.83.1                                 |
| OpenSpec CLI                       | 1.6.0                                  |

The lockfile is the package-level authority. `.nvmrc`, `package.json`, the CI
workflow, and `Dockerfile` independently pin the runtime. The final container
smoke test verified Node 24.18.0, the non-root `node` user, liveness, readiness,
and the framework's bounded request-draining SIGTERM path. The PostgreSQL CI
service is pinned by manifest digest; update its documented patch version and
digest together.

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

## Acquisition parity reconciliation

The 2026-08-05 static-production reconciliation compared the current static
`/` build and the production-built Next route at a 1440×900 desktop viewport.
Both rendered the same 1440×3078 full-page landing after the Next route
incorporated the current content, Town Board entry, optional browser-local
subject image, live case-file preview, validation, deterministic report,
responsive dialog, fragment restoration, and client-side share/download
controls. The prior macOS Playwright baseline was 1440×2633 while the
then-current Next result was 1440×2659; it was obsolete rather than a
threshold issue. The replacement body-locator baseline is 1440×3081 (the
three-pixel body raster difference from the full-page measurement is expected)
and was regenerated only after the static/Next visual comparison. It is
rechecked by the production-build Playwright journey.

The provider boundary is intentional: the Next route retains the `/board`
entry and fragment-only local reports, while the static Cloudflare case
creation, persisted-case loading, publishing, feed, and thread paths remain
unchanged and outside Order 0. The Next board-key form therefore names that
retrieval remains on the static production surface rather than attempting a
partial provider migration.

## Explicitly deferred evidence

The foundation work selected or mutated no production database, authentication,
email, object storage, scanning, CDN, hosting, queue, analytics, DNS, or secret
provider. Current `main` independently contains a Cloudflare static deployment
with Pages Functions, KV, R2, and D1; this record supplies no provider read-back,
preview, live migration, crawler-unfurl, or acceptance evidence for that system.
Those external checks require separate authority.

## Clean-checkout gate record

The clean checkout at `176215b230e685298f0381c55d038bbd0be2e522` used the
downloaded pinned Node.js 24.18.0 runtime, Corepack pnpm 9.15.4, PostgreSQL
17.10-alpine, and the exact `fmcf_test` database/user identity on local port
54329. The default 5432 host port belonged to an unrelated local service, so
the disposable container was recreated on 54329 before connecting; the guard
accepted the URL and no non-test identity was contacted.

| Command | Result |
| --- | --- |
| `pnpm format:check` | pass |
| `pnpm lint` | pass |
| `pnpm check:architecture` | pass (17 contracts) |
| `pnpm check:unused` | pass |
| `pnpm typecheck` | pass |
| `pnpm build:app` | pass |
| `pnpm test:all` | pass (22 legacy + 77 Vitest assertions) |
| `pnpm test:integration` | pass (4 Postgres + 4 production HTTP assertions) |
| `pnpm test:e2e` | pass (3 production-built browser journeys) |
| `pnpm check:file-sizes` | pass |
| `pnpm openspec:validate` | pass |
| `pnpm test:container` | pass |
| `pnpm build` | pass (legacy static fingerprint build) |
| `pnpm test` | pass (22 legacy assertions) |
