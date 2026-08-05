# fuckmycofounder.com

A dependency-free static site where founders share cofounder horror stories as incident reports.

## Local preview

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173`. The site has no build step, backend, cookies, analytics, external fonts, or network calls. Share payloads live only in the URL fragment.

## Structure

- `index.html` — semantic page shell and report dialog
- `assets/css/` — reset, tokens, shared components, and page layout
- `assets/js/modules/` — copy, validation, report generation, card rendering, sharing, and UI flow
- `assets/images/` and `assets/icons/` — social preview and favicon
