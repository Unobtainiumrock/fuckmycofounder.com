# fuckmycofounder.com

A dependency-free static satire site and privacy-first cofounder incident-report generator.

## Production deploys

Pushes to `main` auto-deploy to Cloudflare Pages via [`.github/workflows/deploy-production.yml`](.github/workflows/deploy-production.yml) (tests → `wrangler pages deploy`). Manual ship:

```bash
export CLOUDFLARE_API_TOKEN=… CLOUDFLARE_ACCOUNT_ID=c982ff5aa7f77c62715b25611839a9ff
npx wrangler pages deploy . --project-name=fuckmycofounder --branch=main
```

Required GitHub Actions secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`. Static assets have no build step. Persisted cases (optional mugshots + PNG cards) require Cloudflare Pages Functions with KV and R2 bindings.

### Cloudflare bindings (one-time)

1. Create KV namespace `FMC_CASES` and R2 bucket `fmc-cases`.
2. In Pages → **fuckmycofounder** → Settings → Functions, bind:
   - `FMC_CASES` → KV namespace
   - `FMC_R2` → R2 bucket `fmc-cases`
3. Paste the KV namespace id into [`wrangler.toml`](wrangler.toml) for local Functions dev.

Local static preview (`python3 -m http.server`) serves the UI only; `POST /api/cases` needs `wrangler pages dev` or a deployed Pages preview.

```bash
npx wrangler pages dev . --kv FMC_CASES --r2 FMC_R2
```

## Structure

- `index.html` — semantic page shell and report dialog
- `assets/css/` — reset, tokens, shared components, and page layout
- `assets/js/modules/` — copy, validation, report generation, card rendering, sharing, and UI flow
- `functions/` — Pages Functions for case persistence (KV + R2)
- `shared/` — validation limits shared by client and edge handlers
- `assets/images/` and `assets/icons/` — social preview and favicon
