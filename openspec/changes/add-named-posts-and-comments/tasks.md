## 1. Walking skeleton

- [ ] 1.1 Publish one text Post through progressive Account and Public Byline setup, open its stable logged-out canonical route, add one named Comment, and render the Comment on the same route (test: browser and authorization contract).
- [ ] 1.2 Persist immutable Post and Comment revisions plus public projections so private Account fields never enter public payloads (test: response-shape and revision fixtures).
- [ ] 1.3 Route Post and Comment mutations through foundation policy, block, report, Moderation Case, enforcement, and audit seams (test: allow, hold, deny, unavailable-policy, and appeal outcomes).

## 2. Named Post publishing

- [ ] 2.1 Add local signed-out drafting, protected save or publish, on-demand Public Byline creation, and return to the pending Post without Profile onboarding (test: auth success, cancel, expiry, and provider failure).
- [ ] 2.2 Enforce the Post-versus-Review boundary in composition and moderation, preserving a draft while redirecting substantial real-person working-experience evaluations to Profile search and Review filing (test: neutral mention, praise, criticism, hearsay, and evasion fixtures).
- [ ] 2.3 Support bounded text, safe HTTP(S) links, and zero to four ordered images with preview, alt text, provenance, safe decoding, metadata stripping, derivatives, and scoped media moderation (test: text-only, image-only, invalid scheme, malformed media, rights, and private-data cases).
- [ ] 2.4 Implement Post states, risk-based publication holds, literal status and correction messages, and no lightweight Post reaction controls (test: lifecycle and rendered-action matrix).

## 3. Post lifecycle and canonical behavior

- [ ] 3.1 Add immutable Post editing with an `edited` indicator while retaining the last eligible public revision during a pending or failed edit (test: revision race and bait-and-switch moderation).
- [ ] 3.2 Add immediate author deletion, generic public tombstones, attached-thread withholding, and restricted retention through foundation rules (test: public, canonical, moderator, and expiry projections).
- [ ] 3.3 Preserve canonical Post identifiers across edits, byline changes, Account enforcement, and deletion; render compliant deleted-Account authorship as noninteractive `Former member` (test: URL and attribution transition matrix).

## 4. Comment identity and thread model

- [ ] 4.1 Add ordinary named Comments through Public Bylines and the isolated `Review author` projection only for the Account-backed author inside their own anonymous Review (test: attribution and cross-thread leakage matrix).
- [ ] 4.2 Add top-level Comments and one visible reply level, normalize reply-to-reply under the same top-level Comment while retaining its reply target, and order each level oldest-first with a stable tie-breaker (test: thread-shape and pagination fixtures).
- [ ] 4.3 Support bounded Comment text and safe HTTP(S) links while rejecting empty content, unsupported schemes, media, files, executable embeds, spam, private data, threats, and harassment (test: validation and moderation fixtures).
- [ ] 4.4 Keep Profile Subject Responses separately rendered and controlled, and prevent Comments from changing Review Assessment, relationship, attribution, or response state (test: object-boundary matrix).

## 5. Comment lifecycle and controls

- [ ] 5.1 Add immutable Comment edits, `edited` indicators, immediate author deletion, structural tombstones when replies remain, and generic unavailable routes otherwise (test: edit/delete/reply cross-product).
- [ ] 5.2 Add author mute settings, moderator thread locks and slow mode, individual Comment limitation or removal, and explicit denial of Post author, Review author, or Profile subject moderation powers (test: role/action matrix).
- [ ] 5.3 Enforce block-safe replies, rate limits, duplicate and coordinated-activity controls, report receipts, and scoped Comment enforcement without using report volume as a verdict (test: hidden-block, brigading, spam, and appeal cases).
- [ ] 5.4 Emit durable discussion-activity hooks with canonical targets and authorized attribution while honoring mute, block, lifecycle, and anonymous-author isolation; defer actual delivery (test: event payload and recipient-eligibility contract).

## 6. Close-out

- [ ] 6.1 Run unit, integration, authorization, retention, and browser tests for signed-out, empty, blocked, slow, locked, deleted-parent, removed, deleted-Account, attribution-unavailable, media-failure, policy-unavailable, and abuse states.
- [ ] 6.2 Complete accessibility, security, privacy, moderation-runbook, and responsive Caseboard review, including keyboard thread navigation and explicit external-link behavior.
