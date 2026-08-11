# Design Notes

Decisions an implementer needs that the specs don't carry:

## Scoring rubric shape
Questions group into five clusters: money/equity, commitment, conflict,
exit-terms, communication. Each answer contributes a weighted value to its
cluster; the Cooked Score is the normalized weighted sum. Risk factors = the
three worst clusters, each rendered from a copy bank keyed to the *specific
answer combination* in that cluster (not just the cluster id) — this is what
makes results feel read rather than bucketed. Copy bank and weights live in a
content module (like content.js), separate from the engine, so editorial
iteration never touches logic.

## Fragment codec
Reuse the existing codec.js approach with a distinct payload version for quiz
results (case-file links stay v1). Encode answers, not derived results —
score/label/risk factors recompute on open, so rubric fixes retroactively
correct shared links. Same fail-closed length/shape limits as case files.

## Card rendering
Extend the card-renderer.js canvas pattern with layout functions per ratio
(1080x1920, 1200x630) over shared drawing primitives. No new dependencies.

## Static OG images
Pre-rendered at authoring time via the same headless-Chrome-from-SVG pipeline
used for share-card.png; committed as assets. Not generated at runtime.
