## Why

The network needs a low-friction way to keep track of startup people and a controlled way to contact them without turning Profiles into open inboxes, treating follows as proof of relationship, or creating a route to identify anonymous Review authors. Social interest, recipient consent, and private conversation must remain separate.

## What Changes

- Add one-way **Follow** for canonical Profiles, including unclaimed Profiles. A Follow is private to its Account owner, creates no Connection, exposes no public counts or follower lists, and has no credibility meaning.
- Let a verified Profile claimant enable message requests from the claimed Profile and let an eligible named Post author separately enable requests from their Public Byline on Posts. Unclaimed Profiles and anonymous surfaces show no message action.
- Require a verified-contact sender with a Public Byline to send one short, text-only, link-free request carrying purpose and source context. Apply pair replay controls, transparent baseline quotas, risk limits, expiry, and recipient accept, decline, archive, block, and report controls.
- Move an accepted request into one private one-to-one Direct Message conversation without creating a Connection or Follow.
- Add bounded text and safe links after acceptance, labeled short-window edits, local deletion/archive, mutes, reporting, scam warnings, lifecycle retention, export, and literal failure states. Defer attachments, rich previews, read receipts, unsend, disappearing messages, and group chat.
- Modify the existing `notifications` capability for request, acceptance, message, and opt-in followed-Profile activity without creating a parallel delivery system.
- Apply Blocks and anonymous-attribution isolation before discovery, Follow, requests, DMs, notification delivery, suggestions, errors, logs, or analytics.

Explicitly out: mutual Connections, public graph counts/lists, contact import, people-you-may-know, Open To behavior, anonymous outreach, paid inbox access, group chat, calls, and end-to-end-encryption claims.

## Impact

- Adds `social-graph`, `message-requests`, and `direct-messages`; modifies `notifications`.
- Depends on Accounts, Public Bylines, Profile Claims, Profiles, Posts, Blocks, trust-safety, and current notification policy.
- Main risks are harassment, scams, unwanted repeat contact, block-direction disclosure, claim-revocation confusion, retained private content, and anonymous-author inference.
