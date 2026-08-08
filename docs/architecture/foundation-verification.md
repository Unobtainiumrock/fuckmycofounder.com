# Foundation verification record

Status: the repository foundation was reverified on 2026-08-07 after
reconciliation with later static-production work and a corrective acquisition
parity review.

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

The 2026-08-05 static-production reconciliation compared the current static `/`
build and the production-built Next route at a 1440×900 desktop viewport. The
current static landing measured 1440×3078 at full page. The final Next landing
has the same visual structure and self-contained interaction, with a 1440×3057
body-locator baseline. Its 21-pixel shorter final copy is intentional: it says
sharing is fragment-only and that live Town Board retrieval remains
static-production behavior, rather than falsely implying a provider migration.
The prior macOS Playwright baseline was 1440×2633 while the then-current Next
result was 1440×2659; it was obsolete rather than a threshold issue. The final
baseline was regenerated only after the static/Next visual comparison and is
rechecked by the production-build Playwright journey.

The provider boundary is intentional: the Next route retains the `/board` entry
and fragment-only local reports, while the static Cloudflare case creation,
persisted-case loading, publishing, feed, and thread paths remain unchanged and
outside Order 0. The Next board-key form therefore names that retrieval remains
on the static production surface rather than attempting a partial provider
migration.

## Independent final review

Two independent standards/spec reviews of `d15cb4f..0ad8335` found and then
verified fixes for truthful Town Board copy, progressive draft preview,
identifier redaction, local mugshot card/share behavior, and static card
crop/frame/text fitting. Their final re-reviews found no high or medium
findings. They also rechecked the public/restricted projection boundary,
disposable `_test` database guards, and provider-scope containment.

## Corrective parity closeout

A subsequent root review of `d15cb4f..bb04411` correctly reopened tasks 1.3,
7.1, and 7.2: the public document CSP blocked local `blob:` mugshots, malformed
claimed-PNG input could leave a broken preview, the reset stylesheet overrode
native `[hidden]`, Case File text fitting was missing, and mocked canvas calls
were being treated as primary visual proof. Commit `955b479` restores static
image ingestion: it decodes and square-normalizes accepted JPEG, PNG, and WebP
bytes before retaining a local URL, revokes transient URLs, preserves a safe
error, and makes unexpected card-image failures visible through the existing
safe toast. It adds route-local `blob:` image permission without widening
operational JSON CSP, restores post-render field fitting, and keeps the static
Cloudflare provider boundary unchanged.

Production-built Playwright now proves selected preview and final images have a
nonzero normalized width, malformed claimed-image bytes are rejected without a
visible broken preview, maximum unbroken text has no horizontal clipping on
desktop or mobile (and shrinks on mobile), and the downloaded card decodes in
the browser as a 1200×1500 PNG. The regenerated Case File snapshot was visually
reviewed after image decode; it shows the intended local mugshot, not a broken
placeholder. The strict snapshot reran twice consecutively before acceptance.

The corrective executable code-and-test proof commit was `480fe10`. Its clean
checkout used frozen dependencies, local Node 24.18.1, PostgreSQL 17.10-alpine
on `fmcf_test` at port 54329, and the pinned Node 24.18.0 container image. It
passed formatting, lint, architecture (17 contracts), unused exports, typecheck,
Next build, 22 legacy plus 79 Vitest tests, four Postgres tests, both
four-assertion production HTTP configurations, five Playwright journeys,
file-size policy, strict OpenSpec (11/0), container smoke, and legacy
`build`/`test`. The download assertion checks selected fixture-red pixels in the
decoded avatar region. Independent standards and Spec reviews of
`bb04411..480fe10` found no high- or medium-severity findings. Every later
branch commit through `e602517` is evidence-only: `bd0d644` closed tasks 1.3,
7.1, and 7.2 on that proof, and `e602517` reconciled the verification record.

## Post-closeout regression correction

A fresh review after `e602517` found one remaining parity regression: unlike the
static renderer, the Next renderer rejected the entire card operation when an
accepted avatar URL later failed to load. Commit `2cd3697` restores the static
fallback by omitting only the failed avatar and continuing to render the card. A
public renderer-seam regression test proves the fallback without mocking the
caller, and the same behavior protects both download and share because they use
that renderer.

The Playwright landing snapshot also depended on the wall-clock-derived case
ticker. Its journey now fixes browser time at `2026-08-06T12:00:00Z`; the
accepted screenshot was not regenerated, and the targeted screenshot passed
twice consecutively before the full browser suite passed. This is test-harness
determinism, not a product behavior change.

The final executable code-and-test proof commit is `2cd3697`. Its clean detached
checkout used frozen dependencies, local Node 24.18.1, PostgreSQL 17.10-alpine
on `fmcf_test` at port 54329, and the pinned Node 24.18.0 container image. It
passed formatting, lint, architecture (17 contracts), unused exports, typecheck,
Next build, 22 legacy plus 80 Vitest tests, four Postgres tests, both
four-assertion production HTTP configurations, five Playwright journeys,
file-size policy, strict OpenSpec (11/0), container smoke, and legacy
`build`/`test`. The checkout remained clean after the gate. The subsequent
verification-record commit is evidence-only. No provider, deployment, secret,
DNS, or live data mutation occurred during this pass.

## Explicitly deferred evidence

The foundation work selected or mutated no production database, authentication,
email, object storage, scanning, CDN, hosting, queue, analytics, DNS, or secret
provider. Current `main` independently contains a Cloudflare static deployment
with Pages Functions, KV, R2, and D1; this record supplies no provider
read-back, preview, live migration, crawler-unfurl, or acceptance evidence for
that system. Those external checks require separate authority.

## Clean-checkout gate record

The final clean checkout used local Node.js 24.18.1 with Corepack pnpm 9.15.4,
PostgreSQL 17.10-alpine, and the exact `fmcf_test` database/user identity on
local port 54329. The container smoke test separately used the repository-pinned
Node.js 24.18.0 image. The default 5432 host port belonged to an unrelated local
service, so the disposable container was recreated on 54329 before connecting;
the guard accepted the URL and no non-test identity was contacted.

| Command                   | Result                                          |
| ------------------------- | ----------------------------------------------- |
| `pnpm format:check`       | pass                                            |
| `pnpm lint`               | pass                                            |
| `pnpm check:architecture` | pass (17 contracts)                             |
| `pnpm check:unused`       | pass                                            |
| `pnpm typecheck`          | pass                                            |
| `pnpm build:app`          | pass                                            |
| `pnpm test:all`           | pass (22 legacy + 80 Vitest tests)              |
| `pnpm test:integration`   | pass (4 Postgres + 2 × 4 production HTTP tests) |
| `pnpm test:e2e`           | pass (5 production-built browser journeys)      |
| `pnpm check:file-sizes`   | pass                                            |
| `pnpm openspec:validate`  | pass                                            |
| `pnpm test:container`     | pass                                            |
| `pnpm build`              | pass (legacy static fingerprint build)          |
| `pnpm test`               | pass (22 legacy assertions)                     |
