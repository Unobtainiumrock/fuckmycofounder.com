## Context

The application has canonical public objects and a Caseboard visual language, but the current static share card cannot safely project mutable Profiles, anonymous Reviews, Comments, or moderated media. Sharing must use current authorized public state, yet downloaded images and third-party unfurl caches are inherently outside platform control.

## Decisions and rationale

### Canonical links identify sources, not sharers

Published Profiles, Reviews, Posts, and Comments receive stable first-party HTTPS Share links. An approved Profile Subject Response receives a stable deep link that opens the response inside its canonical Review; it is not promoted into a standalone content kind. A Profile Aggregate has no independent URL because it is derived, versioned Profile state. Its visible summary may be reached through the Profile's summary anchor or included in an eligible Profile Clip.

Copied URLs contain no sharer, recipient, campaign, destination, or anonymous-author token. Incoming marketing parameters never alter canonical metadata. Coarse share telemetry may record source kind, format, and outcome class, but not a recipient or claimed external publication.

### A public share projection is the only metadata and Clip input

One deep **share-projection module** accepts a canonical source, viewer class, requested use, and presentation choices. It resolves redirects, current source revision, parent context, attribution, Profile and aggregate eligibility, blocks, media rights, and policy state, then returns an allowed public projection or a literal unavailable reason. Metadata and Clip renderers cannot query private Account or raw source records themselves.

This keeps anonymous isolation, suppression, deletion, and block behavior local. Profile Subject Responses and Comments always retain their Review or Post context. A Post gets a correspondence-style link preview, not a filed-assessment Clip.

### Exact excerpts are immutable inputs, not generated summaries

Review Clips select one contiguous 20–360-grapheme span from one current approved qualitative response; a shorter complete response may be used whole. Comment Clips use the whole Comment through 360 graphemes or one contiguous 20–360-grapheme span from a longer Comment. Selections cannot split a grapheme or word, preserve punctuation and order, show omission marks where context was removed, and remain labeled **Exact excerpt**. Comment Clips add up to 180 exact graphemes of required parent or reply-target context.

The renderer, not the sharer, supplies mandatory Profile, relationship, attribution, object type, edited state, source date, domain, and case identifier. There is no generated paraphrase. This preserves the tear-off interaction while making quote-mining and accidental mislabeling harder.

### Each object keeps its own document grammar

- **Review Clip:** filed assessment with reviewed Profile, relationship direction and verification state, exact testimony, attribution mode, and canonical source. A single **Community context** switch includes net Review Vote, Award count, and Comment count together; it is off by default and cannot hide an unfavorable net score while retaining favorable counts. Run it back may be included as its exact Review answer.
- **Profile Clip:** dossier extract with name, current photo or placeholder, Review volume, safe relationship mix, and up to two complete eligible aggregate panels. Denominators, **Early signal**, **Concentrated perspective**, distribution shape, and suppression travel with the selected panel; a stale or unavailable aggregate is omitted rather than frozen.
- **Comment Clip:** margin annotation with exact Comment attribution and enough root or reply-target context to identify what it answers. A Post-rooted Comment may carry brief Post context without creating a Post Clip.

Square (1080×1080), story (1080×1920), and link-preview (1200×627) PNG presets reflow the same projection. Required text, domain, and case identifier occupy locked safe areas. Square and story include a redundant first-party QR by default; link-preview may omit it. Layout choices are bounded templates, and cropping changes only an eligible photo or Exhibit background, never source text or mandatory context.

### Media inclusion is exceptional

Profile photos may appear through the Profile's existing redistribution contract. Public Byline photos are omitted from Clips. Review Exhibits are excluded by default and can be added only by an active signed-in Account through explicit selection of one current approved Exhibit whose rights attestation permits redistribution. The system uses the redacted derivative, labels it as an Exhibit, and preserves the quote/context foreground. Rights, privacy, safety, or source changes immediately make it ineligible.

### Rendering is deterministic and revocable at the platform edge

The **clip-renderer module** is a pure renderer over the authorized projection, format preset, presentation choices, font/assets version, and render-policy version. Identical inputs produce identical bytes and a provenance record. The visible case identifier and encoded provenance reference resolve to the canonical source, not an editable or third-party short link.

Hosted preview assets are versioned and publicly fetchable without expiring signatures. Subtractive source changes revoke generation and serving before the application exposes the new state, then trigger best-effort crawler/CDN purges. Old revision Clips do not silently regenerate from old words. The source route shows its current state or a generic unavailable result. The product explicitly warns that downloaded files, screenshots, and third-party caches cannot be recalled.

### Delivery is progressive enhancement

**Share** uses the native Web Share API only from a user gesture and only when the exact URL or file payload is supported; file sharing additionally requires `canShare` for the actual file. Cancellation is neutral. **Copy link**, a selectable canonical URL, **Download clip**, and **Copy suggested alt text** remain available. Clipboard denial leaves selectable text; render failure never removes link sharing.

The parallel text contract contains clip type, subject/root context, exact excerpt, public attribution, and canonical destination. The UI renders this as real text beside the preview and supplies `og:image:alt`; it does not claim it can set alt text in a destination app.

## Prototype findings

A throwaway three-variant UI probe compared source-first tear-off, inspector-first, and mobile bottom-sheet structures. Source-first best preserved the causal connection between selected words and artifact; the inspector made mandatory context look optional, while the mobile sheet confirmed that format, media, and delivery controls fit after the locked preview rather than beside it. The specification therefore keeps selection in the active document, moves only safe presentation controls into the composer, and uses one full-screen sheet on mobile. The prototype was deleted after these findings were captured.

## Research and acceptance boundary

The primary-source note is [`docs/research/share-clips-primary-sources.md`](../../../docs/research/share-clips-primary-sources.md). It establishes Web Share's HTTPS, transient-activation, and file-support checks; OGP's required fields; LinkedIn's 1200×627 public preview; supported launch aspect ratios; and the need for real text beside QR/image output.

Repository tests can prove deterministic bytes, dimensions, excerpts, policy projections, metadata, and fallbacks. Deployment tests must prove HTTPS plus anonymous crawler access. Launch acceptance must test deployed URLs and assets in current X, LinkedIn, Instagram, and supported/unsupported Web Share environments because destination rendering and caches are provider behavior, not repository proof.

## Exclusions

No ranking, reactions, DMs, referral tracking, creator rewards, external-account OAuth publishing, arbitrary canvas, editable quote, generated testimony summary, Post Clip, or Profile Subject Response Clip is introduced.
