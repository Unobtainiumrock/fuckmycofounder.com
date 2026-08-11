# Application foundation stack — primary-source research

Researched: 2026-08-05
Scope: server-rendered TypeScript application foundation for FMCF. This compares
framework capabilities, not hosting, identity, database, or media providers.
Only official framework documentation, official source repositories, and the
official documentation of the PostgreSQL client used as a transaction example
are cited.

## Recommendation

Use a **TypeScript modular monolith on the current Active LTS Next.js 16 App
Router, running on the Node.js runtime and packaged as a standalone container**.
At the research date, the Next.js team identifies **16.2.11 as Active LTS** and
15.5.21 as Maintenance LTS
([Next.js July 2026 security release](https://nextjs.org/blog/july-2026-security-release)).
Pin the exact patched release in the lockfile and upgrade deliberately; do not
use a canary release for the foundation.

Next.js wins narrowly for this product because Profiles, Reviews, and Share
Clips are not merely pages that happen to be server-rendered. They require a
coherent public-object contract: server-visible per-object metadata, canonical
URLs, crawler-compatible Open Graph tags, and dynamic preview images. The App
Router has first-party `generateMetadata`, metadata file conventions,
`opengraph-image.tsx`, and `ImageResponse`; it also keeps metadata blocking for
HTML-limited social crawlers such as `facebookexternalhit`
([metadata and OG images](https://nextjs.org/docs/app/getting-started/metadata-and-og-images),
[generated OG images](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image),
[`generateMetadata` crawler behavior](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)).
Neither React Router nor SvelteKit has an equivalent built-in dynamic image
pipeline; both can implement one with an ordinary resource/endpoint route.

The recommendation is conditional on four guardrails:

1. Keep domain logic, authorization, state transitions, public projections,
   transaction orchestration, ranking, and clocks outside React components and
   Next.js route files. Pages, Server Functions, and Route Handlers are adapters.
2. Use `server-only` on every database, authentication, moderation, anonymous
   attribution, and private-projection module. Return named public DTOs rather
   than ORM records. This follows Next.js's own DAL/DTO authorization guidance
   ([authentication guide](https://nextjs.org/docs/app/guides/authentication),
   [`server-only`](https://nextjs.org/docs/app/getting-started/server-and-client-components#preventing-environment-poisoning)).
3. Do not opt sensitive data into framework caching initially. Add public-page
   caching only after removal, withdrawal, blocking, claim revocation, and
   moderation invalidation tests exist. Multi-instance cache and tag
   invalidation are explicit self-hosting concerns
   ([self-hosting](https://nextjs.org/docs/app/guides/self-hosting)).
4. Treat async Server Components as an E2E boundary. Unit-test domain modules
   and projection functions without Next.js; test rendered routes, crawler
   metadata, and mutations against a running production build. Next.js states
   that Vitest does not currently support async Server Components and recommends
   E2E tests for them
   ([Next.js Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest)).

React Router 8 Framework Mode is a sound fallback if the team values a smaller,
more explicit Web-standard server surface and easier deployment portability
more than built-in metadata/OG support. Do not choose between the two based on
Postgres, authentication, or transaction capability; those belong behind the
same application interfaces in either framework.

## Version and stability snapshot

- **Next.js:** the official security channel identifies 16.2.11 as Active LTS.
  Next.js 16 requires Node 20.9+ and TypeScript 5.1+
  ([Next.js 16 upgrade guide](https://nextjs.org/docs/app/guides/upgrading/version-16)).
  Use the App Router and stable APIs only. Do not make the alpha/experimental
  adapter or navigation features architectural dependencies.
- **React Router:** 8.3.0 is the latest release in the official repository as
  of the research date
  ([official releases](https://github.com/remix-run/react-router/releases/tag/react-router%408.3.0)).
  Version 8 requires Node 22.22+, React 19.2.7+, Vite 7+, and is ESM-only
  ([v8 release notes](https://reactrouter.com/home/changelog#v800)). Do not use
  its experimental React Server Components mode; conventional Framework Mode
  SSR already covers the requirements.
- **SvelteKit:** SvelteKit 2 is actively maintained and is materially credible,
  with SSR by default, server actions, server-only modules, Web-standard
  endpoints, and a standalone Node adapter
  ([official releases](https://github.com/sveltejs/kit/releases),
  [page options](https://svelte.dev/docs/kit/page-options),
  [Node adapter](https://svelte.dev/docs/kit/adapter-node)). It is included as
  the third comparison because its technical fit is real, not because a move
  away from React is recommended.

## Capability comparison

| Requirement | Next.js 16 App Router | React Router 8 Framework Mode | SvelteKit 2 |
|---|---|---|---|
| Crawlable Profiles and Reviews | Server Components render public dynamic routes on the server. Dynamic metadata has special blocking behavior for HTML-limited crawlers. | `ssr: true` renders routes on the server; selected routes may also be prerendered. Loaders run on the server for SSR. | SSR is on by default, and dynamic or selected routes can be prerendered. Official SEO guidance recommends leaving SSR enabled. |
| Per-object metadata | First-party `generateMetadata`; dynamic route params and fetched object data can drive title, description, canonical, robots, and OG fields. | Route components can render React 19 `<title>` and `<meta>` elements, or use a route `meta` export driven by loader data. The application owns composition. | `load` data can drive `<svelte:head>` in the page or root layout. The application owns composition. |
| Dynamic OG image | First-party `opengraph-image.tsx` and `ImageResponse`, with dynamic route params and automatic head tags. | Implement a resource route returning an image `Response`, then point an OG meta tag at it. No first-party image renderer. | Implement a `+server.ts` endpoint returning an image `Response`, then point an OG meta tag at it. No first-party image renderer. |
| Authenticated mutation | Server Functions/Actions and Route Handlers. Official docs require authentication and authorization inside every Server Function. | Server `action`s receive a `Request`, support forms/fetchers, and automatically revalidate route loader data. Sessions/cookies are handled in loaders/actions or auth middleware. | `+page.server.ts` form actions receive a `RequestEvent`; auth cookies may be checked in server hooks and placed in `locals`. |
| Public/private boundary | `server-only` creates a build-time import error; official guidance explicitly recommends a DAL and DTOs that return only allowed fields. | `.server.ts` and `.server/` modules are excluded from client bundles; the build fails if they enter the client graph. Loader return values still cross to the client and must be treated as public projections. | `.server.ts` and `$lib/server` are protected from public imports; server loads still serialize returned data to the client. Illegal-import detection is disabled under the test environment, which needs a separate architecture check. |
| Postgres transaction compatibility | Node runtime can use a normal Postgres client inside a server-side domain transaction. No framework transaction primitive. | Same. The official Node/Postgres Docker template demonstrates SSR plus Postgres, but the database boundary remains application code. | Same. `+page.server.ts`, actions, hooks, and endpoints can call server-only database modules. |
| Upload/media path | Route Handlers use standard `Request`/`Response`; `request.formData()` is available. Server Actions default to a 1 MB body limit, so they are a poor default for media. | Official upload guidance supports streaming multipart parsing with `@remix-run/form-data-parser` inside an action. Resource routes can stream media responses. | Actions/endpoints can read `request.formData()`. The Node adapter defaults to a 512 KB body limit, configurable by `BODY_SIZE_LIMIT`. |
| Deployment portability | `next start` runs all features on a Node server; `output: 'standalone'` creates a minimal deployable server. Multi-instance caching, Server Function keys, deployment IDs, and version skew require care. | Official Node/Docker, custom-server, and Node/Postgres templates can run on any Docker host. Route APIs are based on Web `Request`/`Response`; custom server ownership is explicit. | `adapter-node` produces a standalone Node server and exposes a handler for a custom Node server. Other platform adapters exist. |
| Deterministic testing | Domain code is straightforward to unit-test, but async Server Components require running-app E2E coverage. Cache behavior and crawler rendering need integration tests. | Loaders/actions are ordinary server functions, and `createRoutesStub` supports contextual component tests. Official docs recommend running-app integration/E2E tests for complete typed route modules. | Domain/server modules are straightforward to unit-test, and the ecosystem uses Vite/Vitest. Because server-only import enforcement is disabled under `TEST`, production builds must separately prove the boundary. |

Sources for the table:

- Next.js: [metadata](https://nextjs.org/docs/app/api-reference/functions/generate-metadata),
  [OG image convention](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image),
  [mutating data](https://nextjs.org/docs/app/getting-started/mutating-data),
  [Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers),
  [Server Action body limit](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions),
  [standalone output](https://nextjs.org/docs/app/api-reference/config/next-config-js/output),
  [deployment requirements](https://nextjs.org/docs/app/guides/deploying-to-platforms).
- React Router: [rendering strategies](https://reactrouter.com/start/framework/rendering),
  [route modules](https://reactrouter.com/start/framework/route-module),
  [sessions and cookies](https://reactrouter.com/explanation/sessions-and-cookies),
  [server modules](https://reactrouter.com/api/framework-conventions/server-modules),
  [file uploads](https://reactrouter.com/how-to/file-uploads),
  [resource routes](https://reactrouter.com/how-to/resource-routes),
  [deployment templates](https://reactrouter.com/start/framework/deploying),
  [testing](https://reactrouter.com/start/framework/testing).
- SvelteKit: [SSR and prerendering](https://svelte.dev/docs/kit/page-options),
  [SEO](https://svelte.dev/docs/kit/seo),
  [`<svelte:head>`](https://svelte.dev/docs/svelte/svelte-head),
  [routing and server endpoints](https://svelte.dev/docs/kit/routing),
  [form actions](https://svelte.dev/docs/kit/form-actions),
  [auth integration points](https://svelte.dev/docs/kit/auth),
  [server-only modules](https://svelte.dev/docs/kit/server-only-modules),
  [Node adapter](https://svelte.dev/docs/kit/adapter-node).

## Requirement analysis

### Crawlable public objects and social metadata

All three frameworks can send complete HTML on the first request. That is the
minimum requirement for public Profile and Review pages; an SPA-only mode is
not acceptable for these routes.

Next.js provides the strongest convention. `generateMetadata` is server-only,
can read dynamic route params and object data, and generates head tags. The
framework streams metadata for capable bots but blocks the response for
HTML-limited bots and puts the metadata in `<head>`. The latter matters for
social share crawlers that do not execute application JavaScript
([`generateMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)).
The dynamic OG image convention also receives route params and can fetch object
data before returning an `ImageResponse`
([`generateImageMetadata`](https://nextjs.org/docs/app/api-reference/functions/generate-image-metadata)).

React Router's SSR is explicit and sufficient. A loader runs on the server
before the route is rendered, and route metadata can use its returned data.
React 19 `<title>`/`<meta>` elements are the current recommended mechanism;
the older route `meta` export remains available. A resource route can return an
image, PDF, JSON document, or other `Response`
([route modules](https://reactrouter.com/start/framework/route-module),
[resource routes](https://reactrouter.com/how-to/resource-routes)). The missing
piece is not capability but convention: FMCF would own image rendering,
caching, content type, dimensions, and OG tag composition.

SvelteKit similarly renders on the server by default and lets page load data
drive `<svelte:head>`. `+server.ts` provides full control over a `Response`, so
it can serve generated images
([SEO](https://svelte.dev/docs/kit/seo),
[routing](https://svelte.dev/docs/kit/routing#server)). It does not materially
surpass the React choices for this requirement.

### Authenticated server mutations and projections

Framework mutation entry points are public endpoints, not authorization
boundaries. Next.js explicitly says to verify authentication and authorization
inside every Server Function
([mutating data](https://nextjs.org/docs/app/getting-started/mutating-data)).
Its authentication guide recommends a centralized DAL and DTOs that return
only necessary fields. That maps directly to FMCF's required split between
private Account/attribution records and public Profile/Review projections.

React Router actions are equally capable and somewhat more explicit: they take
a Web `Request`, run on the server, and cause loader revalidation after forms or
fetchers mutate data. `.server` modules provide a build-time barrier
([route actions](https://reactrouter.com/start/framework/route-module#action),
[`server` modules](https://reactrouter.com/api/framework-conventions/server-modules)).
Because loader return values become route data, every loader must return a
public/viewer-specific DTO, never a raw persistence record.

SvelteKit has the same rule: a `+page.server.ts` load function may query a
database, but its return value is serialized for client navigation. Its
server-only module enforcement is strong during normal builds, though the docs
state that enforcement is disabled when `process.env.TEST === 'true'`
([routing](https://svelte.dev/docs/kit/routing#page-page.server.js),
[server-only modules](https://svelte.dev/docs/kit/server-only-modules)).

### Postgres and transaction boundaries

None of the frameworks should own transaction semantics. A domain command must
acquire one database client, authorize, lock/read the relevant records, apply
all state changes and audit writes, commit, then publish any after-commit work.
The node-postgres documentation emphasizes that all statements in a transaction
must use the same client instance; `pool.query` cannot safely represent a
multi-statement transaction
([node-postgres transactions](https://node-postgres.com/features/transactions)).

This makes Postgres a neutral criterion among the frameworks when they use the
Node runtime. Avoid making an Edge runtime part of the initial architecture:
it introduces driver and runtime constraints without helping the stated
requirements.

### Upload and media paths

Do not use framework local disk as durable media storage. Put a storage adapter
behind the application boundary and decide later whether a client uploads
directly after obtaining an authenticated upload intent or streams through a
server endpoint. In either design, the server must authorize the intent,
validate declared and detected media type/size, and make publication a separate
moderated state transition.

For Next.js, use a Route Handler for multipart/media traffic, not a Server
Action. Route Handlers use the Web Request API; Server Actions have a default
1 MB request-body limit
([Route Handlers](https://nextjs.org/docs/app/getting-started/route-handlers),
[Server Action configuration](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions)).
React Router has the best documented streaming path: its official upload guide
uses `@remix-run/form-data-parser` to handle file parts as streams
([file uploads](https://reactrouter.com/how-to/file-uploads)). SvelteKit actions
can read `request.formData()`, but `adapter-node` defaults to a 512 KB request
limit, so the limit must be intentionally configured or uploads routed directly
to the future storage adapter
([form actions](https://svelte.dev/docs/kit/form-actions),
[Node adapter](https://svelte.dev/docs/kit/adapter-node#environment-variables-body_size_limit)).

### Deployment portability

Next.js is portable to a normal Node server or container. The official docs say
a single `next start` process handles Server Components, Server Actions, ISR,
PPR, and Cache Components, and `output: 'standalone'` produces a minimal server
that can be deployed without a full `node_modules` installation
([deploying to platforms](https://nextjs.org/docs/app/guides/deploying-to-platforms),
[`output: standalone`](https://nextjs.org/docs/app/api-reference/config/next-config-js/output)).
The cost appears when scaling beyond one process: cache coordination, Server
Function encryption keys, deployment IDs, and rolling-deploy version skew must
be configured deliberately
([self-hosting](https://nextjs.org/docs/app/guides/self-hosting)).

React Router makes the portable shape more obvious. Its official templates
include generic Node/Docker, custom Node server, and Node/Postgres variants and
state that the containers can run on any Docker-capable platform
([deployment](https://reactrouter.com/start/framework/deploying)). SvelteKit's
`adapter-node` likewise creates a standalone Node server and exposes a handler
for a custom server
([Node adapter](https://svelte.dev/docs/kit/adapter-node)).

Portability therefore favors React Router, but not enough to outweigh the
public-object metadata advantage for FMCF. The foundation should preserve an
exit by keeping domain/application modules free of `next/*`, React Server
Component types, framework cookies, and cache APIs.

### Deterministic testing

Determinism is primarily an application-design choice:

- inject clock, ID, randomness, ranking version, and external service ports;
- unit-test state machines, policy decisions, projections, and rankers without
  rendering a route;
- run database integration tests against real Postgres transactions;
- use a production server build for route, auth, CSP, upload, metadata, and
  anonymous-leakage integration tests;
- use browser E2E only for critical user flows and hydration behavior.

Next.js's explicit limitation is that Vitest cannot currently unit-test async
Server Components. React Router's `createRoutesStub` is useful for reusable
components, but the official testing guide warns that its generated Framework
Mode route types do not align with stubbed route trees and recommends E2E tests
for complete route modules
([Next.js testing](https://nextjs.org/docs/app/guides/testing/vitest),
[React Router testing](https://reactrouter.com/start/framework/testing)).
Neither limitation matters if route modules stay thin.

## Why not choose the alternatives

### React Router 8 Framework Mode

React Router is the strongest alternative and would be a defensible choice. It
is more explicit about request/response behavior, has first-party generic
Docker/custom-server templates, documents streaming uploads, and avoids making
React Server Components part of the default architecture. It loses on the one
capability central to FMCF's public distribution loop: Next.js supplies the
metadata and per-object OG image conventions that React Router requires the
application to assemble and maintain.

React Router 8 also has a higher runtime floor—Node 22.22+, React 19.2.7+, and
Vite 7+—and the project publishes yearly majors
([v8 release notes](https://reactrouter.com/home/changelog#v800),
[future changes](https://reactrouter.com/upgrading/future)). That is not a
reason to reject it, but it belongs in the upgrade budget.

### SvelteKit 2

SvelteKit is technically capable and mature: SSR is default, server form
actions are progressively enhanced, endpoints use Web `Request`/`Response`,
server-only imports are enforced, and `adapter-node` is portable. It would also
require adopting Svelte as the UI model and building the OG image convention
ourselves. No stated requirement gains enough from that ecosystem change to
justify it over either React option.

## Foundation decisions this research supports

The engineering-foundation proposal can safely specify:

1. **Runtime:** patched Next.js 16.2 Active LTS App Router on Node.js; strict
   TypeScript; Node runtime only at launch.
2. **Architecture:** modular monolith with `app/` route adapters calling
   framework-free domain/application modules; no browser-to-database writes.
3. **Data boundary:** Postgres behind repositories and an explicit transaction
   runner; every mutation uses one transaction client; durable invariants also
   live in database constraints.
4. **Privacy boundary:** `server-only` private modules and named public/viewer
   DTO projections; raw persistence records cannot cross to components, Route
   Handler responses, metadata, notifications, analytics, or logs.
5. **Public pages:** SSR Profile/Review pages with canonical metadata and
   dynamic `opengraph-image.tsx`; live crawler acceptance remains a deployment
   gate, not something repository tests alone can prove.
6. **Mutations:** thin Server Functions for ordinary form commands and Route
   Handlers for external APIs, webhooks, uploads, downloads, and non-UI
   responses; every entry point re-authenticates and authorizes.
7. **Media:** a provider-neutral storage/media-processing port; no durable local
   filesystem assumption and no large media through Server Actions.
8. **Caching:** uncached/dynamic correctness first. Caching public projections
   is a later, explicit capability with removal/invalidation and multi-instance
   tests.
9. **Deployment:** standalone Node container as the portability baseline;
   provider-specific adapters or edge runtimes are optional later layers.
10. **Testing:** framework-free unit tests, real-Postgres integration tests,
    production-build HTTP tests, and focused browser E2E. Async Server
    Components are not the unit-test boundary.

## Risks and unresolved decisions

- **Security patch cadence:** both Next.js and React Router had security-related
  patch activity shortly before this research snapshot. Exact patched versions
  must be resolved from official release/security channels during scaffold and
  on every dependency update; a remembered version number is not a release
  policy.
- **Next.js cache complexity:** multi-instance invalidation is not automatic
  across process-local caches. FMCF's deletion and moderation requirements make
  stale public content a correctness and safety failure, so caching must remain
  opt-in until coordinated invalidation is proved.
- **RSC testing surface:** async Server Components are not currently supported
  by Vitest. Thin route adapters and production-build integration tests are
  mandatory to avoid concentrating policy logic in an E2E-only layer.
- **OG renderer fidelity:** `ImageResponse` is built in, but font support,
  supported CSS, remote asset behavior, output size, and social crawler caches
  still require fixtures plus deployed acceptance. Framework support is not
  proof that third-party previews render correctly.
- **Upload topology:** this research does not decide proxy upload versus direct
  object-storage upload, media scanning/transcoding, or the storage provider.
  Those choices depend on maximum file sizes, moderation workflow, retention,
  and deployment limits.
- **Authentication implementation:** the frameworks expose secure integration
  points but do not settle the auth provider, session storage, recovery, or
  profile-claim proofing decisions.
- **Database toolkit:** Postgres is assumed, but driver, query builder/ORM, and
  migration tooling remain open. Selection must preserve explicit transactions,
  SQL constraints, deterministic migrations, and test database setup.
- **Deployment topology:** a single Node container is the portable baseline;
  multi-region, multi-instance, CDN, queue, and background-worker topology are
  intentionally not selected here.

## Decision checkpoint

Proceed with Next.js only if the engineering-foundation spec records the ten
decisions above as enforceable boundaries. If the team rejects RSC/E2E testing
cost or wants the application server to remain an explicitly owned generic
Node process, choose React Router 8 Framework Mode instead. Nothing in the
product requirements requires SvelteKit, an edge runtime, microservices, or a
provider-specific deployment model.
