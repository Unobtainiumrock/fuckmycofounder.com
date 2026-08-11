## Context

This change introduces the first private Account-to-Profile graph and the first Account-to-Account content channel. It must consume canonical Profiles, Message Identities, centralized policy, Blocks, and notification projections without turning Private Account Identity or Anonymous Attribution into a discoverable person graph. The repository is currently static; implementation will require an authenticated backend, durable private storage, and a changed network/CSP boundary, but this proposal does not select providers.

## Decisions and rationale

### Follow, Connection, and messaging are separate

Launch has one social edge: an Account privately **Follows** a canonical Profile. Follow works for claimed and unclaimed Profiles, survives claim changes, and canonicalizes through merges. A linked Public Byline is only an entry point to the Profile; an unlinked byline is not another followable identity. There are no public counts or lists and no graph-size rank signal.

A mutual Connection is omitted. Current needs are already expressed by Follow for content interest and recipient-controlled Message Requests for contact. Acceptance opens messaging only; it is not evidence that people know one another and does not create a Follow, Relationship Claim, or Open To permission. First-party LinkedIn guidance likewise distinguishes content subscription from known mutual relationships and applies friction to unwanted invitations.

### Message Identity is the only addressing projection

Messaging never addresses an unclaimed Profile, private Account record, anonymous Review author, or `Review author` Comment. A recipient explicitly opts in through either a verified claimed Profile or an eligible named Post Public Byline. The sender must use a current Public Byline and verified contact. This gives the recipient interpretable public context without forcing every Account into the Profiles directory.

Claim revocation, byline loss, Blocks, Account enforcement, or policy failure removes new entry immediately. An existing conversation pauses if it cannot present a valid Message Identity; it never guesses another identity or falls back to private fields.

### First contact is deliberately scarce

One request contains a purpose, source context, and at most 300 grapheme clusters of link-free text. It has no attachment or second message. Baseline quotas are three new recipients per rolling day and ten per rolling week, with one unresolved request per pair. Risk policy may lower—not raise—the baseline. Decline prevents sender replay; cancel or expiry imposes a 30-day pair cooldown.

Request lifecycle is:

| Current | Actor action | Result |
|---|---|---|
| none | eligible sender sends | pending |
| pending | recipient accepts | accepted + one conversation |
| pending | recipient declines | declined; privately restorable for 30 days |
| pending | sender cancels | canceled |
| pending | 30 days elapse | expired |
| pending/declined | either Account Blocks or policy removes | blocked/removed |

Archive is recipient-local queue placement, not shared lifecycle. A request sender never receives view, read, archive, decline, report, or Block telemetry.

### Accepted conversation state stays small

Launch conversations are one-to-one. They support 2,000-grapheme text and up to three safe HTTP(S) links through an interstitial, but no remote preview fetches, attachments, groups, calls, read receipts, typing/presence, unsend, or disappearing content. Text and links may be edited for 15 minutes with an `Edited` marker and restricted revisions. Delete is local and never promises recall.

Archive and mute are per-participant inbox projections. Disabling new requests does not close an accepted conversation. A Block closes permission immediately; unblocking does not resurrect it. A fresh accepted request is required.

Ordinary content remains while either participant retains the shared transcript. Once both delete, primary content is purged within 30 days and backups within 90 days. A deleting Account cannot erase another participant's retained shared copy; its interactive identity becomes `Former member`. Reported evidence follows the foundation's safety-retention and access rules. The product makes no launch end-to-end encryption or screenshot-prevention claim.

### Anonymous isolation is an invariant, not a renderer cleanup

Follow, request, conversation, notification, suggestion, analytics, error, and Block policy consume only authorized public Message Identity or generic anonymous projections. They cannot ask for the Account behind an anonymous Review, `Review author` Comment, Vote, Award, or private Notification recipient. An Account may independently self-disclose in message text, but the platform neither supplies nor confirms that disclosure.

## Deep module seams

The **social graph policy module** owns Follow pair idempotency, Profile canonicalization, private projections, claim-linked activity, Block pruning, and deletion. Its interface accepts actor, canonical Profile, intended mutation or view, and policy context; it never returns follower identities or counts to target-side callers.

The **messaging policy module** owns Message Identity authorization, recipient settings, request quotas and transitions, Account-pair permission, Block closure, content constraints, and safe state projection. Request, conversation, and notification callers receive decisions and authorized projections, not raw Account, claim, anonymous-author, report, or block records.

The **conversation ledger module** owns idempotent sends, immutable revisions, edit window, local archive/mute/delete projections, shared retention, and export. Delivery and safety adapters sit behind internal seams; callers cannot mutate counts or hard-delete another participant's copy.

The existing **notification policy module** remains the only delivery seam. It is modified to consume request and conversation events and emit safe recipient intents; raw message bodies never become email or notification-adapter payloads.

## Research and logic-prototype findings

Primary-source review found consistent separation between unknown-sender requests and accepted inboxes, private decline, media restrictions before acceptance, request filtering, report and Block, and limits for unwanted outreach. The time-boxed state probe exercised request, acceptance, local archive, new-message reactivation, and Block. It confirmed that request history, conversation permission, local inbox placement, and Follow are four distinct states; Block must close permission and remove the targeted Follow without rewriting accepted request history.

## Operational boundaries and exclusions

Rate and abuse thresholds beyond the public baseline are versioned policy, not client logic. Sensitive operations fail closed when policy, identity, Block, or durable storage is unavailable. Logs and analytics contain opaque object identifiers and coarse outcomes, not message text, private contacts, anonymous linkage, or block direction.

No mutual Connection, public graph metric, contact import, recommendations, group chat, calls, media attachment, rich preview, payments, read receipt, presence, unsend, disappearance, paid reach, or Open To behavior is introduced. Open To may later consume existing Account-pair eligibility and Block/DM seams, but it cannot weaken them or infer romantic consent from Follow or accepted messaging.
