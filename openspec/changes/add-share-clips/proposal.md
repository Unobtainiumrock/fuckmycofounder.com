## Why

Profiles and public content need to travel outside the Caseboard without turning anonymous authorship, stale moderation state, or cropped fragments into misleading social artifacts. Plain URLs must unfurl reliably, while the product's distinctive clipping interaction should make useful excerpts easy to share without creating a repost system or an editable quote generator.

## What Changes

- Add stable, tracking-free canonical Share actions for published Profiles, Reviews, Posts, Comments, and approved Profile Subject Responses; responses open in their Review context and Profile Aggregates remain part of the Profile rather than standalone objects.
- Serve current, public, crawler-readable social metadata and branded link previews without leaking private Account identity, anonymous-author linkage, blocks, reports, or suppressed aggregate data.
- Add deterministic **Share Clips** for Profiles, Reviews, and Comments in square, story, and link-preview formats using object-specific dossier, filed-assessment, and margin-annotation layouts.
- Lock Clips to exact current source text and mandatory context. Sharers may choose an eligible excerpt, preset, crop, and optional context modules, but cannot rewrite source words, remove required labels, or deceptively crop evidence.
- Exclude Review Exhibits by default; include one only after explicit selection, rights eligibility, redaction, current moderation approval, and a higher-trust Account-backed action.
- Provide native device sharing as progressive enhancement with permanent copy-link, download, selectable-link, and accessibility-text fallbacks.
- Invalidate hosted previews and Clip generation when sources are edited, anonymized, limited, withdrawn, removed, deleted, merged, or lose parent context, while warning that files and third-party caches already distributed cannot be recalled.

Explicitly out: Post Clips, Profile Subject Response Clips, editable quotations, generated testimony summaries, reposts, rankings, reactions, Direct Messages, referral incentives, and destination-specific publishing integrations.

## Impact

- Adds `canonical-sharing` and `share-clips`; depends on validated Profiles, Reviews, Posts, Comments, Profile Aggregates, Feed reactions, Public Bylines, and trust-safety contracts.
- Introduces public metadata, source-projection, deterministic rendering, image-delivery, and cache-invalidation seams.
- Main risks are anonymous-author re-identification, stale or decontextualized excerpts, redistributed private or copyrighted media, third-party preview caching, and accessibility loss when text becomes an image.
