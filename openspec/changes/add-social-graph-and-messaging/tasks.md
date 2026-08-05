## 1. Walking skeleton

- [ ] 1.1 Follow one published Profile, opt its verified claimant into requests, send and accept one text-only request from a verified-contact Public Byline, exchange one Direct Message, and deliver one safe in-app Notification end to end (test: browser and authorization contract).
- [ ] 1.2 Put Follow, Message Identity, request permission, and conversation permission behind centralized policy interfaces that fail closed and never expose Private Account Identity or anonymous-author linkage (test: interface and outage fixtures).
- [ ] 1.3 Apply one Block across Follow, pending request, accepted conversation, and queued Notification without revealing direction or resurrecting state after unblock (test: transition timeline).

## 2. Private Profile Follow

- [ ] 2.1 Add idempotent Account-to-canonical-Profile Follow and unfollow with Account-private following pagination and no target-side count or list (test: duplicate, empty, cursor, and unauthorized cases).
- [ ] 2.2 Resolve linked Public Byline Follow actions to the verified claimed Profile while denying unlinked byline, Account, and anonymous-content targets (test: claim/link/attribution matrix).
- [ ] 2.3 Handle Profile merge deduplication, claim verification and revocation, Profile removal, Account deletion, and Block pruning without public graph leakage or automatic restoration (test: lifecycle matrix).
- [ ] 2.4 Emit opt-in followed-Profile activity hooks only for current public Reviews and currently linked claimant Posts without changing Feed ranking (test: source and preference fixtures).

## 3. Message Identity and recipient settings

- [ ] 3.1 Add default-off, independently controlled Profile-claim and named-Post request settings with verified contact, current Message Identity, policy, and entry-point checks (test: claimant/byline/Post eligibility matrix).
- [ ] 3.2 Add progressive sender Account, verified-contact, and Public Byline gating that preserves the draft and never creates or requires a Profile (test: signed-out and incomplete-identity flow).
- [ ] 3.3 Remove entry points immediately on claim revocation, byline/Post loss, Block, Account restriction, or policy outage without disabled-button enumeration or private fallback (test: concurrent transition fixtures).

## 4. Message Request ledger

- [ ] 4.1 Add 300-grapheme link-free introductions with purpose and canonical source context; reject attachments, media, URL-like text, and second messages before acceptance (test: Unicode and hostile-payload corpus).
- [ ] 4.2 Implement pending, accepted, declined, canceled, expired, blocked, and removed transitions plus recipient-local archive/restore and exactly-once conversation creation (test: state-machine and race fixtures).
- [ ] 4.3 Enforce one unresolved pair request, three new recipients per rolling day, ten per rolling week, decline replay prevention, canceled/expired cooldown, and lower risk limits (test: boundary clocks and coordinated-outreach cases).
- [ ] 4.4 Add request report, Block, safe sender outcomes, 30-day expiry, 90-day body deletion, and foundation safety-retention integration (test: privacy, deletion, report, and legal-hold matrix).

## 5. Direct Message ledger

- [ ] 5.1 Add one Account-pair conversation with 2,000-grapheme messages, at most three safe HTTP(S) links, no rich preview fetch, idempotent sends, and `sending`/`sent`/`failed` states (test: duplicate, Unicode, link, and storage-failure cases).
- [ ] 5.2 Add 15-minute labeled edits with restricted revisions and participant-local message/conversation deletion without unsend or recall claims (test: edit-window, revision, and asymmetric-delete matrix).
- [ ] 5.3 Add per-participant archive and mute, no read/presence telemetry, identity-loss pause, Account deletion `Former member`, and fresh-request requirement after unblock (test: two-party projection timeline).
- [ ] 5.4 Add conversation export and retention: shared copy while either participant retains, 30-day primary purge after both delete, 90-day backup expiry, and case-scoped reported evidence (test: export/privacy/retention matrix).

## 6. Messaging safety

- [ ] 6.1 Add per-Account and per-conversation rate controls, duplicate/bulk outreach detection, suspicious-link interstitial or withholding, and scam, harassment, sexual-content, impersonation, private-data, and evasion policy (test: abuse corpus and safe false-positive appeal).
- [ ] 6.2 Make every request, message, and conversation reportable with proportionate adjacent context, reporter confidentiality, Block, enforcement, notice, and appeal behavior (test: moderation case fixtures).
- [ ] 6.3 Audit every Follow, request, conversation, notification, suggestion, error, log, analytics, export, and Block path for anonymous Review, `Review author`, Vote, and Award inference (test: cross-capability noninterference suite).

## 7. Existing Notification policy

- [ ] 7.1 Extend the notification-policy module with request, acceptance, message, and opt-in followed-Profile events using current identity, Block, mute, preference, and source checks (test: recipient/event matrix).
- [ ] 7.2 Add message-category and conversation-mute preferences, in-app defaults, opt-in email, generic body-free previews, idempotent retries, and stale-intent suppression (test: channel, privacy, and failure fixtures).
- [ ] 7.3 Verify no notification for Follow, decline, cancel, archive, mute, read, Block, report, or individual Review Vote and no hidden actor or action inference (test: negative event matrix).

## 8. Close-out

- [ ] 8.1 Add literal empty, loading, archived, declined, expired, identity-unavailable, blocked, removed, invalid-cursor, quota, policy-outage, and storage-failure states with accessible keyboard and assistive-technology behavior (test: state and accessibility matrix).
- [ ] 8.2 Run unit, integration, authorization, concurrency, privacy, retention, export, moderation, abuse, accessibility, and browser tests, then complete deployment network/CSP checks, threat-model review, moderation runbook, and live notification/provider acceptance before rollout.
