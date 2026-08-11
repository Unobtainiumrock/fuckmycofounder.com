## 1. Walking skeleton

- [ ] 1.1 Serve one public Review with canonical metadata, select an exact excerpt, render a square Clip, and complete native-share or copy/download fallback without exposing its anonymous Account author (test: end-to-end browser and public/private projection contract).
- [ ] 1.2 Put canonical metadata and Clip generation behind one current-state share-projection interface and deterministic renderer so callers cannot supply attribution, aggregate values, metrics, source text, or eligibility (test: adapter and authorization contracts).
- [ ] 1.3 Invalidate one hosted Review preview and Clip after edit, named-to-anonymous conversion, withdrawal, limitation, and removal before stale state remains platform-served (test: source-transition timeline).

## 2. Canonical sharing

- [ ] 2.1 Add literal Share actions and stable tracking-free HTTPS links for published Profiles, Reviews, Posts, Comments, and approved Profile Subject Responses, including Profile merge and response-context resolution (test: object/state URL matrix).
- [ ] 2.2 Serve crawler-readable canonical, OGP, image, and image-alt metadata from current authorized public projections without session, expiring media URLs, or query personalization (test: metadata and anonymous-fetch fixtures).
- [ ] 2.3 Add object-specific Profile, Review, Post, Comment, and Subject Response previews that preserve attribution and parent context and omit private, suppressed, or unavailable fields (test: public/private snapshot matrix).
- [ ] 2.4 Add no-tracking copy links, strict outbound referrer behavior, minimized share telemetry, and no recipient or external-publication claim (test: URL, header, event, and log contracts).

## 3. Exact Clip projections

- [ ] 3.1 Add Review exact-span selection, locked relationship/attribution context, optional Run it back, and bundled off-by-default Community context (test: grapheme, omission, negative-net, edit, and anonymous cases).
- [ ] 3.2 Add Profile dossier projections with current photo/placeholder, volume, safe relationship mix, and at most two complete eligible aggregate panels carrying denominator and disclosure labels (test: suppression, early, concentrated, stale, and unavailable cases).
- [ ] 3.3 Add Comment exact-span projection with named or `Review author` attribution, root and reply-target context, and parent-state eligibility (test: Review/Post roots, long Comment, reply, tombstone, and anonymous-author cases).
- [ ] 3.4 Reject Post and Profile Subject Response Clip requests while preserving their canonical Share links and object-specific unfurls (test: supported-source allowlist).

## 4. Rendering and media

- [ ] 4.1 Render deterministic PNGs at 1080×1080, 1080×1920, and 1200×627 with embedded fonts/assets, locked safe areas, file-size bounds, and real case identifiers (test: golden bytes, pixels, safe zones, and 5 MB ceiling).
- [ ] 4.2 Implement dossier, filed-assessment, and margin-annotation layouts using the Caseboard tokens, perforated extraction and reduced-motion behavior without an X-post silhouette (test: visual, responsive, keyboard, and reduced-motion snapshots).
- [ ] 4.3 Keep domain and case identifier visible in every format; add first-party QR to square/story as redundant navigation with a plain canonical link and accessible description (test: QR payload, crop, contrast, and decode fixtures).
- [ ] 4.4 Add bounded layout and media-crop controls that cannot alter source words or remove mandatory context, attribution, labels, or provenance (test: deceptive-crop and tampered-client corpus).
- [ ] 4.5 Add explicit Account-backed selection of one currently redistribution-eligible Review Exhibit, default exclusion, redacted derivatives, scoped invalidation, and no Public Byline photo path (test: rights/privacy/media lifecycle matrix).

## 5. Delivery and accessibility

- [ ] 5.1 Add Web Share URL and file branches requiring a user gesture, secure context, exact-payload support checks, and neutral cancellation handling (test: supported, unsupported, hostile-file, lost-activation, and AbortError cases).
- [ ] 5.2 Keep Copy link, selectable URL, Download clip, and Copy suggested alt text available; preserve link sharing when rendering, clipboard, or native sharing fails (test: capability/failure matrix).
- [ ] 5.3 Render the full parallel text contract beside the preview, emit `og:image:alt`, announce render status accessibly, and make the full-screen mobile sheet keyboard and assistive-technology operable (test: accessibility tree and manual screen-reader pass).

## 6. Lifecycle, safety, and close-out

- [ ] 6.1 Version source revisions, render policy, assets, and presets; revoke stale hosted output and purge platform caches best-effort on edits, attribution changes, aggregate invalidation, merges, parent loss, limitation, withdrawal, removal, or deletion (test: concurrent state/version matrix).
- [ ] 6.2 Add Clip-aware report evidence and controls for harassment, doxxing, private data, copyright, misleading excerpts, impersonation, manipulated media, spam, and high-volume generation without creating a new public content object (test: abuse and appeal fixtures).
- [ ] 6.3 Add literal source-unavailable, parent-unavailable, metadata-unavailable, render-failed, clipboard-denied, native-share-unavailable, canceled, blocked, and policy-outage states without stale or private fallback (test: failure cross-product).
- [ ] 6.4 Run unit, integration, authorization, privacy, metadata, cache, accessibility, visual, and browser tests; then complete deployment crawler checks, live platform previews, current Web Share acceptance, threat-model, moderation-runbook, and specialist legal/rights review.
