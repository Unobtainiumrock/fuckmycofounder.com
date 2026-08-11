# Add Cooked Quiz, Prevention Toolkit, and Share v1 (Phase 1)

## Why

The site is currently a single-visit toy: one card generator, no reason to
return, no way to spread beyond a pasted link. Phase 1 of docs/features.md
adds the first viral artifact (the Cooked Quiz), the first bookmark-worthy
utility (the Toolkit), and the sharing plumbing both need — all shippable on
the current static stack with no backend.

## What Changes

- New `/cooked/` page: the Cooked Quiz — ~12 structured questions about the
  partnership, scored client-side by a weighted rubric. Result: Cooked Score %,
  condition label, top 3 risk factors, one "homework" link into the Toolkit.
- New `/toolkit/` section: index plus three treatments — Awkward Questions
  script, Cofounder Prenup checklist, Exit Conversation checklist — one per
  score band.
- Share v1: result links encoded in the URL fragment (client-side only);
  canvas-rendered result cards in 9:16 and 1.91:1; one share button (Web Share
  API with image on mobile, download + copy link on desktop); static per-page
  OG images for the new pages.
- Homepage: the dead "Spicy Mode" card becomes the quiz entry card; Toolkit
  links added to header and footer.

Explicitly out: LLM scoring (Phase 2), equity split calculator (Phase 2),
per-result dynamic OG unfurls (needs the Phase 2 short-link service),
archetype illustrations (separate design track), any backend.

## Impact

- Specs: new capabilities `cooked-quiz`, `toolkit`, `share-cards`.
- Code: new HTML pages; new quiz engine + rubric modules; extension of the
  fragment codec and canvas card-renderer patterns; nav edits to index.html.
- Constraints honored: CSP stays `connect-src 'none'`; docs/adr/0001 (the quiz
  diagnoses the partnership, never a person; no archetypes in results).
- Risk: quiz result copy quality decides whether results feel personal or like
  a horoscope — the copy bank keyed to answer combinations is the main
  editorial effort and the thing to review hardest.
