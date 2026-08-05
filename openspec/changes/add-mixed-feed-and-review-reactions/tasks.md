## 1. Walking skeleton

- [ ] 1.1 Serve one logged-out Trending page containing one Review and one Post, open each canonical object, authenticate in context, cast a Review Vote, spend one Award Credit, and receive one safe in-app notification (test: end-to-end browser and public/private projection contract).
- [ ] 1.2 Put Feed selection behind one versioned Feed-policy interface and Vote/Award state behind one reaction-ledger interface so clients cannot supply scores, counts, eligibility, or anonymous authorship (test: adapter and authorization contracts).
- [ ] 1.3 Consume one durable Review-publication or Comment hook through the notification-policy interface into an idempotent in-app intent and optional email adapter (test: event-to-recipient projection).

## 2. Feed eligibility and views

- [ ] 2.1 Add signed-out and signed-in **Trending** and **Latest** views with literal **All**, **Reviews**, and **Posts** filters and no Account gate or launch For-you state (test: complete view/filter/viewer matrix).
- [ ] 2.2 Hydrate only current eligible canonical Review and Post projections, applying Review Claim/Profile state, Post/Review lifecycle, attribution, Blocks, hides, removals, and policy state before ranking and render (test: source-state cross-product).
- [ ] 2.3 Add reverse-chronological Latest with original publication time, stable tie-breaker, snapshot cursor, deduplication, and removal-safe short pages (test: concurrent publish/edit/remove pagination timelines).
- [ ] 2.4 Render Caseboard docket rows and active documents with distinct Review/Post fields and actions, responsive mobile takeover, keyboard navigation, and literal empty/loading/error states (test: accessibility and responsive snapshots).

## 3. Inspectable Trending

- [ ] 3.1 Implement versioned new, strong, and exploration candidate pools plus deterministic freshness, confidence-adjusted Review Vote, capped Award, meaningful-discussion, expanded-read, relationship-context, hide, reversal, and integrity feature classes (test: golden rank fixtures).
- [ ] 3.2 Enforce the Review floor, exploration slice, object-type run, same-Profile, same-author, duplicate, fatigue, and recent-seen rules without exposing anonymous Account identity (test: adversarial composition tables).
- [ ] 3.3 Publish a plain methodology and record restricted per-position candidate, version, feature-class, filter, and post-ranking reasons without publishing fraud thresholds or private viewer data (test: explanation and telemetry schema).
- [ ] 3.4 Add object hides with undo, filter persistence, and safe rank feedback; prohibit raw views, raw Comment/report volume, sentiment, media, Profile Aggregates, and Profile popularity as launch boosts (test: forbidden-signal and control fixtures).

## 4. Review Votes

- [ ] 4.1 Add one eligible `up` or `down` Review Vote per Account/Review with protected-action authentication, self-vote denial, atomic replacement, undo, and no Post/Verdict path (test: uniqueness and action matrix).
- [ ] 4.2 Project only the eligible net score publicly while retaining positive/negative counts, Account linkage, reversals, and confidence-adjusted ranking state privately (test: public/private field matrix and negative scores).
- [ ] 4.3 Invalidate Votes from removed Reviews, finalized-deleted or ineligible Accounts, and coordinated manipulation; throttle brigades without using vote direction as guilt or exposing clusters (test: Sybil, burst, block, appeal, and restoration fixtures).

## 5. Weekly Review Awards

- [ ] 5.1 Implement global Monday 00:00 UTC Award periods, verified-contact plus seven-day eligibility, current risk approval, mid-period first eligibility, max-one balance, and non-banking refresh (test: timezone and boundary clock matrix).
- [ ] 5.2 Add atomic Award spending with self-award denial, one active Award per giver/Review lifetime, persistent public count, undisclosed giver list, and concurrent double-spend protection (test: transaction and anonymity fixtures).
- [ ] 5.3 Add same-period Credit-restoring retraction, later non-restoring retraction, Review removal, Account deletion, integrity invalidation, restoration, and appeal behavior (test: multi-period lifecycle table).
- [ ] 5.4 Keep Awards nonpurchasable, nontransferable, nonanonymous to the platform, and free of streak or nonuse punishment; show the next refresh in the viewer's local time with UTC source (test: rendered state and prohibited-action matrix).

## 6. Notifications

- [ ] 6.1 Add an Account-private, paginated, read/unread in-app inbox with canonical targets, stable identifiers, empty/loading/error states, and no public endpoint (test: recipient authorization and pagination).
- [ ] 6.2 Deliver publication notices to current verified Profile claimants, discussion notices to eligible object or parent authors, and batched Award notices to Review authors; send no individual Vote notices (test: event/recipient/dedupe matrix).
- [ ] 6.3 Add category/channel preferences, object and thread mutes, claimant content-email opt-out, opt-in community email, and required security/moderation notice precedence without a first-session prompt (test: preference precedence table).
- [ ] 6.4 Enforce block, lifecycle, deletion, anonymous-author, `Review author`, `Former member`, stale-target, and moderation confidentiality at event time and send time (test: timing and identity-leakage suite).
- [ ] 6.5 Add idempotent retry, batching, bounce/failure handling, delivery receipts, and restricted observability so notification failure never rolls back content or reactions (test: duplicate, outage, and recovery fixtures).

## 7. Safety and close-out

- [ ] 7.1 Add coordinated-vote/Award detection, device/network/risk rate limits, manipulation holds, count/rank recomputation, scoped notices, and appeals without public fraud accusations (test: positive, negative, reciprocal, burst, and farm fixtures).
- [ ] 7.2 Run unit, integration, authorization, privacy, cache/version, clock, accessibility, and browser tests across signed-out, empty, blocked, hidden, muted, stale, edited, withdrawn, limited, removed, deleted-Account, policy-outage, and delivery-outage states.
- [ ] 7.3 Complete ranking-methodology, threat-model, notification privacy, moderation-runbook, accessibility, and specialist legal review before enabling real-person Trending broadly.
