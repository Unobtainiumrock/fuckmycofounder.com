# DESIGN.md — the F/MC visual system

Source of truth for every surface. The system already exists in the wild
(homepage, case-file dialog, share cards); this file makes it enforceable.

## Thesis

**Evidence, filed.** The site plays it straight: bureaucratic officialdom
applied to founder chaos. Every surface is a document — filed, stamped,
numbered, archived. The comedy comes from deadpan procedure, never from the
design winking at you. When in doubt: would a mid-century records office do
it? If yes, allowed. If it looks like a startup landing page, cut it.

## Palette (tokens.css — never invent colors)

| Token | Value | Role |
|---|---|---|
| `--paper` | `#f4eddf` | Ground. Aged file-folder stock, with dot-grid + grain overlays |
| `--ink` | `#151515` | Text, borders, inverted panels. Never pure black |
| `--red` | `#ff3b20` | Indictment + primary action. The loud voice — one per view |
| `--red-dark` | `#d82b15` | Error text, red's hover register |
| `--acid` | `#d8ff3e` | The verdict highlighter. Rarer than red — one strike per view |
| `--white` | `#fffdf8` | Input fields, raised paper |
| `--muted` | `#756e64` | Secondary text on paper |
| `--line` | `rgba(21,21,21,.26)` | Hairlines, table rules |

No gradients, ever. No new colors without updating this file. Elevation is
hard offset shadow (`8px 8px 0 var(--ink)`), never blur.

## Type — four voices, each with one job

1. **Display — `var(--display)` (Impact stack).** The headline voice:
   ALL CAPS, `letter-spacing: -0.03em` to `-0.055em`, `line-height: 0.77–0.9`,
   weight 900. Used huge or not at all — it never appears below 1.75rem.
2. **Mono — `var(--mono)`.** The bureaucracy voice: labels, stamps, case
   numbers, metadata, buttons. `0.58–0.72rem`, weight 800–900, uppercase,
   `letter-spacing: 0.02–0.11em`.
3. **Sans — `var(--sans)`.** Interface prose: ledes, descriptions, form
   copy. Weight 650–700 for emphasis lines, 400 for plain.
4. **Serif (reading voice — NEW):** `Charter, "Iowan Old Style", Georgia, serif`
   → token `--serif`. For testimony and any body text over ~2 lines: story
   statements, toolkit prose, quiz result narratives. `1–1.06rem`,
   `line-height: 1.55`, normal case. This is the deposition-transcript voice;
   without it the system has no way to be read, only shouted.

**Scale (use these steps only):** 0.58 / 0.65 / 0.72 / 0.85 / 1 / 1.2 /
1.45 / 1.75 / 2.6 / 4 / clamp-to-12rem (display only).

**Spacing ramp:** 0.25 / 0.5 / 0.75 / 1.1 / 1.5 / 2 / 3 / 5rem. Section
padding: `clamp(4rem, 9vw, 8rem)` vertical, `var(--page)` horizontal.

## Motifs

- **Stamps.** Mono caps in a 2px border or solid fill, rotated −1° to −7°,
  sometimes overlapping the thing they certify. Stamps are *applied to*
  documents, so they sit above content and clip is acceptable. Verdicts,
  severities, and statuses are stamps; navigation never is.
- **Rules.** 1px `--line` hairlines inside documents; 2–3px solid `--ink`
  for structural borders. Radius 2px max (`--radius`) — corners are cut
  paper, not pills.
- **File furniture.** Case numbers, dates, "FILED" lines — only where the
  data is real. Fake precision (decorative numbering, fake barcodes on
  interactive surfaces) is allowed only on *rendered artifacts* (share
  cards), never in UI chrome.
- **Rotation.** ±1–2° for paper-on-desk realism on static artifacts. Never
  rotate text people must read continuously.

## Layout rules

- **Ledger, not cards.** Lists render as dividered rows inside one bordered
  container. A border marks *the* document being worked on — the case file,
  the open story — never every item in a collection.
- **Horizontal hierarchy.** Purpose-built layouts per surface: master–detail
  (docket + open case), rail + document. Never a single stacked column of
  equal-weight blocks.
- **Density is brand.** Records offices are dense. Generous space belongs
  inside the open document; the index around it stays tight.
- **Reserve space.** Expanding/collapsing UI must not reflow neighbors —
  open detail in a dedicated pane or overlay, don't push the page around.
- **The Caseboard, not an X shell.** The application Feed uses a dense docket
  index and one generous active-document pane. Reviews render as filed
  assessments, Posts as named correspondence, and Comments as attached margin
  annotations. X may inform interaction and ranking, never the recognizable
  page silhouette.
- **Mixed objects stay visually distinct.** A Review, Post, Comment, and Profile
  are not four card variants. Each uses the document form that matches its
  meaning while preserving one navigable hierarchy.

## Motion

Tokens: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`;
`--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)`.

| Interaction | Spec |
|---|---|
| Press (any button) | `transform: scale(0.97)`, 140ms ease-out |
| Hover (fine pointers only) | translate(-2px,-2px) + hard shadow grow, 160ms |
| Open document / pane | 200–240ms ease-out, from `opacity 0, scale(0.98)` — never scale(0) |
| List entrance | stagger 40ms/row, translateY(6px)→0, first paint only |
| **Signature: the stamp-down** | verdict stamp enters `scale(1.4)→1` + opacity, 220ms ease-out, once per document open. The one theatrical moment; everything else stays quiet |
| Share Clip extraction | selected source text separates along a perforated edge with `clip-path`, 180ms ease-out; the artifact receives the existing stamp-down rather than introducing a second flourish |
| Keyboard-initiated actions | no animation |
| `prefers-reduced-motion` | keep opacity fades ≤200ms, remove all movement/scale |

Transitions over keyframes for anything re-triggerable. Animate only
`transform`/`opacity`/`clip-path`.

## Copy register

Deadpan procedural. Labels are filing vocabulary (CHARGE, STATEMENT,
DISPOSITION, DOCKET). The system never laughs at its own joke — no "lol",
no self-aware asides in chrome. Humor lives in user content and in the
verdict/disposition banks, delivered flat. Sentence case for interface
instructions; caps belong to mono labels and display headlines only.

## Anti-rules (instant rejection)

Gradients · blur shadows · rounded-2xl anything · icon-in-circle feature
grids · glassmorphism · emoji as section headers (emoji are data glyphs in
the charge taxonomy only) · system-ui as display face · decorative progress
bars · any element that couldn't plausibly exist on paper in a filing room.
