# fuckmycofounder.com

A dependency-free static satire site and privacy-first cofounder incident-report generator.

## Production deploys

Pushes to `main` auto-deploy to Cloudflare Pages via [`.github/workflows/deploy-production.yml`](.github/workflows/deploy-production.yml) (tests → `npm run build` → `wrangler pages deploy dist`). Manual ship:

```bash
export CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=c982ff5aa7f77c62715b25611839a9ff
npm run build
npx wrangler pages deploy dist --project-name=fuckmycofounder --branch=main
```

Required GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

### Asset fingerprinting

`npm run build` ([`scripts/build.mjs`](scripts/build.mjs)) copies the site into `dist/` with every JS and CSS file renamed to `name.<content-hash>.ext`, rewriting each import specifier and `<link>`/`<script>` reference to match. Hashes are computed leaves-first, so editing a deep module (`shared/case-limits.js`, `report.js`) also changes the hash of everything that imports it — the whole graph busts, not just the entry point.

That makes every URL content-addressed, so [`_headers`](_headers) can mark JS/CSS `immutable` and no deploy can leave a browser on a stale module. HTML always revalidates; images and icons keep stable filenames because their URLs appear in social-preview metadata.

Never hand-write a `?v=` query string on an import; the build owns cache busting.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`. The source tree runs unbuilt — references are unhashed, so edits show up on reload. Persisted cases (optional mugshots + PNG cards) require Cloudflare Pages Functions with KV and R2 bindings.

### Cloudflare bindings (one-time)

1. Create KV namespace `FMC_CASES`, R2 bucket `fmc-cases`, and D1 database `fmc-threads`.
2. In Pages → **fuckmycofounder** → Settings → Functions, bind:
   - `FMC_CASES` → KV namespace
   - `FMC_R2` → R2 bucket `fmc-cases`
   - `FMC_DB` → D1 database `fmc-threads`
3. Paste IDs into [`wrangler.toml`](wrangler.toml) for local Functions dev.
4. Apply thread schema: `npx wrangler d1 migrations apply fmc-threads --remote`

Local static preview (`python3 -m http.server`) serves the UI only; `POST /api/cases` needs `wrangler pages dev` or a deployed Pages preview.

```bash
npx wrangler pages dev . --kv FMC_CASES --r2 FMC_R2 --d1 FMC_DB=fmc-threads
```

## Retention and takedown

Nothing on the Town Board expires. Cases and feed keys are written to KV with
no `expirationTtl`, and the D1 comment threads have no expiry either, so a
filing and its corroboration stay consistent with each other indefinitely.
Rate-limit counters (`rl:` keys) still expire after two hours — they are a
counter, not content.

**There is no unpublish.** Posting is deliberately one-way: the report dialog
arms the button and states that the post is permanent before the second click
commits it. That means removal is an operator action, not a user-facing one.
To take a filing down:

```bash
export CLOUDFLARE_ACCOUNT_ID=c982ff5aa7f77c62715b25611839a9ff
NS=f78cfdb2ee8f4e1ba6840926b4a673ad

# Find the feed key for the case (the feed key embeds an inverted timestamp).
npx wrangler kv key list --namespace-id=$NS --remote | grep FMC-XXXXXXX

# Remove it from the board, then remove the case record itself.
npx wrangler kv key delete "feed:<inverted-ts>:FMC-XXXXXXX" --namespace-id=$NS --remote
npx wrangler kv key delete "case:FMC-XXXXXXX" --namespace-id=$NS --remote

# The card PNG and mugshot live in R2, and the thread lives in D1.
npx wrangler r2 object delete fmc-cases/cards/FMC-XXXXXXX.png --remote
npx wrangler d1 execute fmc-threads --remote \
  --command "DELETE FROM comments WHERE case_id='FMC-XXXXXXX'; DELETE FROM threads WHERE case_id='FMC-XXXXXXX';"
```

Deleting only the `feed:` key pulls a case off the board while leaving its
permalink at `/c/<id>` working; delete the `case:` key too for a full removal.

## Structure

- `index.html` — semantic page shell and report dialog
- `board/` — dedicated Town Board page with per-case corroboration threads
- `assets/css/` — reset, tokens, shared components, and page layout
- `assets/js/modules/` — copy, validation, report generation, card rendering, sharing, and UI flow
- `functions/` — Pages Functions for case persistence (KV + R2), Town Board feed, and D1 comment threads (`GET/POST /api/cases/:id/comments`)
- `migrations/` — D1 SQL for `threads` + `comments`
- `shared/` — validation limits shared by client and edge handlers
- `scripts/` — the fingerprinting build that emits `dist/`
- `assets/images/` and `assets/icons/` — social preview and favicon
