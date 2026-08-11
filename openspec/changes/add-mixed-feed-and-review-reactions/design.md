## Context

This change turns already-published Reviews and Posts into a public reading loop and activates stable activity hooks from Reviews and Comments. It consumes canonical public projections and the foundation policy seam; it must never reconstruct lifecycle, private Account identity, anonymous authorship, block direction, or moderation state from raw records.

## Decisions and rationale

### Launch Feed has two jobs, not one opaque timeline

**Latest** gives every new eligible object a transparent discovery path. It is reverse chronological by original publication time with stable opaque identifier as the tie-breaker. Approved edits update the rendered revision but do not reset publication time. A snapshot cursor fixes eligibility/order for that pagination session; objects that become unsafe disappear immediately even if this shortens a page.

**Trending** is a versioned deterministic policy, not a learned ranker. Candidate pools contain newly published objects, recently strong objects, and a deliberate low-exposure exploration slice. The score applies freshness to both object types; Review-specific confidence-adjusted Vote quality and capped, decayed Awards; capped meaningful discussion and expanded reading; a bounded relationship-evidence tie-breaker that is explicitly not testimony verification; and negative integrity signals such as hides, reversals, confirmed safety outcomes, and suspected coordination. Raw views, raw Comments, raw reports, sentiment, negativity, media presence, Profile Aggregates, and Profile popularity do not boost rank.

The public methodology names signal families, caps, windows, diversity rules, and policy version without publishing live fraud thresholds. Each served position records candidate source, eligible feature classes, score version, filters, and post-ranking reasons in restricted observability.

### Mixed composition protects the Review core

All, Reviews, and Posts are literal filters. When enough eligible candidates exist, Trending All keeps at least half of the first 20 positions for Reviews, includes at least one exploration candidate per ten, permits no more than three consecutive items of one type, and permits no more than two Reviews of the same Profile or two objects from the same author Account in any ten served positions. Anonymous author Account identity may enforce diversity but never enters the public projection. Latest remains strict chronology; its separate Reviews filter is the guaranteed escape from Post volume.

Feed items open the canonical Review or Post; they are not durable duplicate objects. Comments supply only a capped discussion feature and never become Feed candidates. Signed-out visitors receive the public feed without Account or personalized state. Signed-in launch behavior adds Blocks, explicit hides, recent-seen fatigue, and filter preference but no interest-based **For you**.

### Review Vote is usefulness; Review Award is scarcity

A Review Vote asks whether the Review is useful, specific, and worth seeing. An eligible Account has one current `up` or `down` choice per Review, may replace or remove it, and cannot vote on its own named or anonymous Review. Public surfaces show `eligible upvotes - eligible downvotes`, including zero and negative values. Upvote rate and underlying positive/negative counts stay nonpublic; Trending uses a confidence-adjusted quality estimate so one early vote does not dominate.

Award periods run Monday 00:00 UTC through the next Monday 00:00 UTC. An active Account with a verified sign-in contact becomes eligible after seven full days if centralized risk policy allows it. An eligible Account receives one Credit at refresh or when first becoming eligible within the period; the balance is capped at one. Spending creates one persistent Review Award while the Review and giver remain eligible. Unused Credit expires at the boundary.

One Account may have at most one active Award on a Review for its lifetime. A same-period retraction restores that period's Credit; a later retraction lowers the count but does not mint a current Credit. Removal or integrity invalidation behaves the same way. Awards expose counts, not giver lists, and cannot be bought, transferred, gifted, or streaked. This delays only the scarce action, not signup or ordinary voting.

The Verdict Vote is deferred. Three adjacent judgments were not required to answer the launch product's core questions, and the product document already prioritizes removing Verdict before usefulness Votes or Awards if hierarchy becomes confusing.

### Notifications are recipient projections, not raw event fan-out

The notification-policy module consumes a durable activity event plus current recipient, source, mute, block, attribution, and policy state and emits zero or one safe notification intent per recipient. Delivery adapters handle in-app and email behind a separate seam. Idempotency keys prevent duplicates; grouping may batch repeated Comments or Awards without changing counts.

Launch event ownership is explicit:

| Event | Recipient | Launch delivery |
|---|---|---|
| Review publishes | current verified Profile claimant | In-app; content-alert email unless disabled |
| Top-level Comment publishes | eligible Review or Post author | In-app; community email only if opted in |
| Reply publishes | eligible parent Comment author | In-app; community email only if opted in |
| Review Award becomes active | eligible Review author | In-app, batched, giver undisclosed |
| Review Vote changes | none | No individual notification |
| Security, moderation, or appeal notice | affected Account | Required channel under the foundation contract |

Object/thread mutes override optional discussion and Award delivery. Blocks suppress direct community notification without revealing direction. Anonymous Review authors receive account-private notices referring only to **your Review**; no Public Byline, Profile link, message target, or giver identity is synthesized. Removed or newly ineligible targets are suppressed before send and become literal unavailable states after prior delivery. Delivery failures retry idempotently and never roll back the source action.

## Deep module seams

The **Feed policy module** accepts viewer projection, view, filter, and opaque cursor and returns ordered canonical object projections plus a next cursor. Eligibility hydration, score versions, diversity, exploration, fatigue, and safe degradation stay behind that interface.

The **reaction ledger module** owns Review Vote replacement, public net projection, Award Credit periods, Award uniqueness, retraction, eligibility invalidation, and rank-safe aggregates. Callers never mutate counts directly.

The **notification policy module** owns recipient resolution, preferences, mutes, blocks, safe actor/source projection, grouping, and suppression. In-app and email adapters receive only approved intents; raw activity hooks are never delivery payloads.

## Logic-prototype findings

A throwaway state probe exercised mixed candidate eligibility, deterministic Latest ordering, same-Profile diversity, Vote replacement and undo, one weekly Credit, same-period Award retraction, removal, and blocked actors. It confirmed that source eligibility must be checked before ranking and again before render, that Vote is mutable state rather than an append-only count, and that Award Credit consumption and the persistent Review Award are separate ledgers.

## Operational boundaries and exclusions

Ranking constants, candidate windows, and abuse thresholds are versioned configuration with deterministic fixtures, not client logic. A policy outage may serve only a previously authorized page whose safety/source version remains current; otherwise Feed or reaction mutations fail closed. A delivery outage queues eligible notification intents and reports a separate channel failure without exposing private state.

No launch Verdict Vote, For you model, Post reaction, Profile leaderboard, cross-Profile rank, paid Award, push channel, Share Clip delivery, follow notification, DM notification, or Open To notification is introduced. Later changes modify `notifications` rather than bypassing its policy module.
