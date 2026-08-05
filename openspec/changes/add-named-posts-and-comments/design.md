## Context

Posts are the network's named, lower-friction participation layer; Reviews are its relationship-backed reputation layer. Comments attach discussion to either object. The foundation already separates Private Account Identity, Public Byline, anonymous attribution, policy decisions, blocks, reports, and moderation. This change must reuse those seams without creating a parallel identity or safety system.

## Decisions and rationale

### Posts cannot be a lightweight Review format

A Post may discuss startup work, products, companies, markets, events, resources, and industry ideas. It may identify a person incidentally for attribution, congratulations, news, or ordinary professional context. When its central purpose is to assess, accuse, warn about, or recount the author's working experience with an identifiable person, the composer preserves the draft and redirects the author to Profile search and the Review flow. This applies to praise and criticism so the distinction cannot be gamed by sentiment.

Posts never carry a Relationship Claim, Review Assessment, Review verification label, anonymous attribution, or Profile Subject Response. A published disguised Review is limited through moderation rather than silently converted, because conversion would invent attestations and relationship context the author did not submit.

### Named participation stays minimal

Publishing a Post or an ordinary Comment requires the foundation Public Byline: display name and optional photo, not a claimed Profile. A signed-out person may draft locally, but saving or publishing invokes progressive Account setup and on-demand byline creation. This preserves low-friction signup without weakening public accountability.

The sole exception is the Account-backed author of an anonymously attributed Review. Inside that Review's Comment Thread, the attribution seam returns **Review author** with no Public Byline, Profile link, message target, or stable identity. Other anonymous Comments are not supported. A named Review author comments through their Public Byline and may receive a contextual author marker.

### Content shapes are deliberately bounded

A Post contains at least text or one eligible image, supports up to 2,000 Unicode grapheme clusters and four ordered images, and renders normalized HTTP(S) links as external links. Other URL schemes, executable embeds, video, files, polls, and Comment attachments are excluded at launch. Post media uses safe decoding, derivative generation, metadata stripping, provenance or rights attestation, alt text, and object-specific moderation. Link preview failure never changes the source link or creates an executable embed.

Comments support up to 1,000 Unicode grapheme clusters and safe HTTP(S) links. Keeping Comment media out of launch reduces harassment, privacy, and moderation load while Reviews and Posts establish their richer media contracts.

### Publication, revision, and deletion are independent states

Posts use `draft`, `under review`, `changes required`, `published`, `limited`, `removed`, and `deleted`. Comments use `pending`, `published`, `limited`, `removed`, and `deleted`. Ordinary named material may publish after centralized risk checks; suspected impersonation, disguised Reviews, private data, unsafe media, harassment, spam, or coordinated activity can hold it for review. Policy unavailability fails closed for a new public revision while preserving the last eligible public revision.

Every public edit creates an immutable revision and displays `edited`; it cannot change author, parent, or canonical identifier. Author deletion removes the body immediately but preserves restricted safety history under foundation retention. A deleted Post withholds its attached Comment Thread. A deleted Comment becomes a tombstone only when replies need its structural place; otherwise its route is generically unavailable. Final Account deletion leaves compliant published material in its own state, makes ordinary named attribution noninteractive **Former member**, and keeps **Review author** only where the anonymous Review remains eligible.

### Threads have two visible levels and deterministic ordering

Each published Post or Review owns one Comment Thread. A Comment either attaches to the root object or replies within one top-level Comment thread. Replying to a reply records the selected reply target but renders the new Comment as another second-level reply under the same top-level Comment. Top-level Comments and their replies are ordered oldest-first with a stable identifier tie-breaker. This preserves conversational chronology without recursive indentation or an opaque ranking system.

The Profile Subject Response remains a separately moderated, separately versioned Review-owned object. It is not a Comment, cannot parent Comments, and does not enter chronological Comment ordering.

### Control is role-specific

Comment authors may edit or delete their own Comments. Post and Review authors may mute future discussion activity but cannot remove, reorder, lock, or slow critical Comments. A Profile subject gains no Comment moderation authority from being reviewed. Moderators may lock a whole thread, apply visible slow mode, limit or remove individual Comments, and preserve appeals. A lock prevents new Comments and replies but not author edits or deletes, reports, or moderator actions.

Blocks prevent direct replies and targeted discussion activity between the Accounts while preserving independently public content and anonymous-author isolation. Reports enter foundation Moderation Cases; raw report volume does not alter visibility.

### Posts launch without a lightweight reaction

Posts expose Comment count and stable future Feed/sharing hooks, but no Like, upvote/downvote, repost, poll, Verdict, or Award at launch. This keeps Review Vote, Verdict Vote, and Review Award meanings distinct and avoids adding a fourth judgment system before real use demonstrates a Post-specific need. A later proposal may modify `posts` with an earned reaction model.

### Content policy and projections sit behind deep seams

One content-publication policy interface accepts actor, object kind, proposed revision, target or thread context, blocks, and risk state, then returns publish, hold, deny, or changes-required without exposing hidden policy inputs. A thread-policy interface resolves parent normalization, lock or slow state, attribution projection, and recipient eligibility. Canonical public projections consume only eligible revisions and foundation attribution; Feed, sharing, and notification callers do not reconstruct lifecycle or anonymity rules.

## Prototype findings

A throwaway interaction-state prototype exercised ordinary authors without a byline, anonymous Review-author replies, replies to replies, unauthorized deletion, deleting a top-level Comment with replies, and creating while locked. Flattening reply-to-reply under the original top-level Comment retained the exact reply target and held the visible depth at two. Structural tombstones preserved live replies after parent deletion. Lock checks must precede attribution or target resolution, and authorization errors must stay generic so failures cannot reveal an anonymous author or block direction.

## Exclusions

- Feed ranking decides whether and how published Posts and Comments become candidate or discussion signals.
- The reactions change owns Review Votes, optional Verdict Votes, Awards, and notification delivery.
- The sharing change owns copy-link UX, external metadata, and Share Clips; this change supplies stable canonical objects and eligibility states.
- Social, messaging, and Open To changes may consume named authorship but cannot discover an anonymous Review author through Comment events.
