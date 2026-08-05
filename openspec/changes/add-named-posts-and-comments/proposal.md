## Why

Reviews are intentionally high-friction, relationship-backed reputation records. The network also needs a lower-friction participation layer where startup people can publish in their own name and discuss both Posts and Reviews. Without a hard object boundary, Posts become an evasion path for unverified Reviews; without explicit Comment identity and thread controls, discussion creates a second anonymous-content system and a pile-on surface.

## What Changes

- Add named Posts authored through a Public Byline, with bounded text, up to four images, safe HTTP(S) links, stable canonical routes, revision history, author deletion, and risk-based moderation.
- Keep Posts distinct from Reviews: no Relationship Claim, Assessment, anonymous attribution, Profile Subject Response, or substantial evaluation of an identifiable person's working behavior.
- Add Account-backed Comments on published Posts and Reviews. Ordinary Comments require a Public Byline; only the author of an anonymous Review may appear as **Review author** inside that Review's thread.
- Limit discussion to top-level Comments plus one visible reply level, ordered oldest-first. Preserve reply targets while flattening replies-to-replies under their top-level thread.
- Define edit, deletion, tombstone, lock, slow-mode, report, block, muted-activity, deleted-account, and unavailable states.
- Defer lightweight Post reactions at launch. Posts support discussion and canonical-link hooks, but not Likes, votes, reposts, Verdicts, or Awards.

Explicitly out: Feed eligibility and ranking, Review Votes, Verdict Votes, Review Awards, notification delivery, Share Clip generation, follows, messaging, and Open To. The change emits stable content and discussion hooks for those later capabilities.

## Impact

- Adds capability specs `posts` and `comments`; depends on Accounts, Public Bylines, trust-safety, Profiles, and Reviews.
- Introduces durable Post, Comment, revision, thread-control, media, and activity-event records plus canonical public projections.
- Primary risks are Reviews disguised as Posts, edit bait-and-switch, anonymous-author leakage, unsafe media or links, harassment, spam, and deletion that destroys conversation context.
