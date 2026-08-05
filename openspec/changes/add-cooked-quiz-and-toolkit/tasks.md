# Tasks

## 1. Walking skeleton
- [ ] 1.1 /cooked/ page renders on the shared stylesheets with the first
      question visible and site navigation present
- [ ] 1.2 Quiz engine module: question flow (answer → next), rubric scoring to
      a Cooked Score (unit tests: known answer sets → known scores)
- [ ] 1.3 Minimal result view: score % + condition label render from a
      completed answer set (end-to-end slice done here)

## 2. Result depth
- [ ] 2.1 Risk-factor derivation: worst three clusters → copy bank lines keyed
      to answer combinations (tests: cluster selection + copy lookup)
- [ ] 2.2 Homework mapping: every score band / risk factor resolves to a
      toolkit URL (test: exhaustive — no combination maps to a missing page)
- [ ] 2.3 Quiz fragment codec (new payload version, answers-not-results,
      fail-closed; tests: round-trip + malformed + oversized)

## 3. Toolkit content
- [ ] 3.1 /toolkit/ index + awkward-questions + prenup + exit pages, complete
      written content on shared styles
- [ ] 3.2 Header/footer Toolkit links on all pages

## 4. Share v1
- [ ] 4.1 Canvas result cards: 9:16 and 1.91:1 renderers over shared drawing
      primitives (test: blob dimensions)
- [ ] 4.2 Share button: Web Share API with files where supported, else
      download + copy link (manual test on iOS/Android Safari/Chrome)
- [ ] 4.3 Static OG images + meta tags for /cooked/ and all toolkit pages

## 5. Homepage integration
- [ ] 5.1 Replace the Spicy Mode placeholder card with the Cooked Quiz entry
      card (remove dead disabled-button styles if orphaned)

## 6. Close-out
- [ ] 6.1 Full suite green; sweep for dead CSS/copy; manual mobile pass on the
      quiz → result → share → toolkit path
