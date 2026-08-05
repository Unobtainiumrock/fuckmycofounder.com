# fuckmycofounder.com

The founder-network product begins with the Caseboard landing experience and
Cooked Quiz, served by the same Next.js application that will own later
Profiles, Reviews, Posts, Feed, messaging, and trust features.

## Local development

Use Node 24.18.0 and Corepack, then install and run the app:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:3000`. Local startup has no database dependency unless
`REQUIRE_DATABASE=true` and an explicit safe `DATABASE_URL` are supplied.

## Repository map

- `app/` — Next.js composition, pages, metadata, and Route Handlers
- `src/modules/` — framework-neutral domain/application modules
- `src/platform/` — server-only runtime adapters and policy enforcement
- `src/shared/` — small primitives with demonstrated cross-module reuse
- `tests/` — unit, contract, Postgres, production HTTP, and browser proof
- `openspec/` — accepted product and engineering change contracts

Read `AGENTS.md` before implementation. The full reproducible gate and its
disposable Postgres prerequisite are documented in `openspec/README.md`.
