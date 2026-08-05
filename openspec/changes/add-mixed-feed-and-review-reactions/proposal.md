## Why

Published Reviews and Posts need a common discovery loop without becoming the same object or letting casual Post volume bury the product's relationship-backed reputation layer. Reviews also need legible community judgment, but raw engagement would reward dogpiles against real people. The launch Feed and reaction system must therefore be public before signup, inspectable rather than learned, and safe across anonymity, moderation, blocks, edits, and coordinated manipulation.

## What Changes

- Add public **Trending** and **Latest** Feed views with **All**, **Reviews**, and **Posts** filters. Latest is stable reverse chronology; Trending uses a versioned candidate, scoring, safety, diversity, and exploration pipeline.
- Keep Reviews and Posts visually and behaviorally distinct. Reviews retain relationship context, Review Assessment signals, Votes, Awards, and Comments; Posts retain named authorship and Comments but receive no launch reaction.
- Add one Account-backed Review Vote per Account and Review. A voter may upvote, downvote, change, or undo; public display is the net score only.
- Add a scarce Review Award. An eligible Account receives at most one Award Credit per global Monday-to-Monday UTC period; unused credit expires and never banks.
- Require Award eligibility to include a verified contact, seven full Account days, an eligible Account state, and current risk approval. Awards cannot be bought, transferred, self-given, or repeatedly given by one Account to one Review.
- Defer the optional Verdict Vote at launch. Usefulness Votes and scarce Awards remain; a situation poll may return only through a later proposal after interaction testing.
- Add privacy-safe in-app notifications, preferences, batching, canonical targets, claimant publication alerts, discussion alerts, and Award alerts. Individual Review Votes do not notify.

Explicitly out: learned or interest-based **For you**, Profile or real-person ranking, generic Post reactions, reposts, paid Awards, Share Clips, follows, Direct Messages, and Open To.

## Impact

- Adds `feed`, `review-votes`, `review-awards`, and `notifications`; depends on the validated Accounts, safety, Profiles, Reviews, Posts, and Comments contracts.
- Introduces versioned Feed-policy, reaction-ledger, Award-period, and notification-delivery seams without selecting queue, email, or ranking vendors.
- Main risks are outrage amplification, Sybil votes, Award farming, anonymous-author leakage, stale Feed cards, notification harassment, and pagination that changes meaning mid-session.
