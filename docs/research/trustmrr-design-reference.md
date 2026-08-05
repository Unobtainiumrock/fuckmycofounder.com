# Design reference — trustmrr.com (extracted 2026-08-03)

Distilled token system from trustmrr.com, researched as a candidate direction
for the feed redesign. This documents *their* system as observed; if this
direction wins, DESIGN.md gets rewritten as our own adaptation, not a clone.

**Stack fingerprint:** Next.js + Tailwind v4 + shadcn/ui (neutral theme) + lucide.

## Color

Light default. Stock shadcn neutral — zero-chroma grays; color used only
semantically, never decoratively.

| Role | Value |
|---|---|
| Page background | `#F5F5F5` (oklch 97% 0 0) |
| Surface (cards, table, inputs) | `#FFFFFF` |
| Text primary | `#0A0A0A` |
| Text secondary | `#737373` |
| Primary (buttons) | `#171717` near-black |
| Border | `#E5E5E5`, 1px everywhere |
| Focus ring | `#A3A3A3` |
| Positive / negative | green-600 `#16A34A` / red-600 `#DC2626` |
| "For sale" badge | amber-100 `#FEF3C7` bg / amber-700 `#B45309` text |

Elevation: near-none. White-on-gray + 1px borders; `shadow-xs`
(`0 1px 2px rgba(0,0,0,.05)`) on inputs/avatars only. Hover = border tint or
bg change, not shadow-lift. Secondary cards `bg-white/60` → solid on hover.

## Type

- **Sitewide font: Inconsolata** (variable 200–900). The single biggest
  personality decision — whole site reads like a groomed terminal.
- Money/data: `font-mono` + semibold/bold, tabular feel. Numbers are the
  loudest elements on the page.
- Scale: H1 30→48px bold, tracking -0.025em; section H2s deliberately small
  and gray (14–18px); body/table 14px; descriptions 12px; micro-labels
  **9px uppercase +0.05em semibold gray**. Hierarchy inversion: headings
  whisper, data shouts.

## Space & shape

- Radius: base 10px; buttons/inputs 8px; big cards 14px; avatars full.
  Nested radii done correctly (outer 14 / inner 8–10).
- Container: max-w 64rem (1024px), narrow center column.
- Rhythm: sections `mt-8/12`; table cells `p-2`, ~40px rows — data-table
  density, not marketing density.

## Layout anatomy

No navbar — centered lockup → H1 → gray subhead → search + black button →
dot-separated micro-nav. Then: horizontal snap rails of 220px cards (with
dashed-border "browse all" ghost card), the leaderboard as a white 14px-radius
card with small filter selects + dense 5-column table, a trust caption under
it, masonry update feed, category chip cloud, 4-column footer.

Leaderboard row: rank (medal emoji top 3) → 32px logo + name + 1-line gray
desc → 24px avatar + founder → **bold mono value right-aligned** → green/red
mono delta. Whole row is a link; hover `bg-muted/50`.

## Components

- 220px listing card: 1px border, `p-3`, amber corner ribbon, 3-col stat grid
  of 9px-label-over-bold-12px-value.
- Buttons: solid near-black, `h-10 px-6 rounded-md text-sm font-medium`.
- Filters as bordered selects, not tabs. Verification = shield icon + caption.
- Confidential rows: `blur(3px)` teaser device.

## Motion

Utilitarian: `.15s cubic-bezier(.4,0,.2,1)` color/border transitions on hover;
.25s opacity fade-in on load. No scroll animation, no springs.

## The portable recipe

Gray-97 page + white cards + 1px #E5E5E5 borders + 10px radius + one
mono-flavored typeface + bold tabular numbers + semantic-only color + tight
14/12/9px ladder + hover = border-tint instead of shadow-lift.

## Our adaptation notes (variant D of prototype/feed.html)

- Verdict counts play the role MRR plays there: the bold mono numbers.
- Semantic mapping: NTP green, YTP red, ESH amber, NBD gray.
- Medal ranks → "most judged this week" docket.
- Amber corner ribbons → ADVICE ASK / CLOSED case markers.
- Trust caption → our pseudonymity/takedown line.
