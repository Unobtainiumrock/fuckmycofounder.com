## ADDED Requirements

### Requirement: Recipients explicitly enable each launch request path
The system SHALL default message requests off and SHALL let an eligible Account independently enable them through its current verified claimed Profile and through its Public Byline on eligible named Posts, without making an unclaimed Profile or standalone Public Byline messageable.

#### Scenario: Verified claimant enables Profile requests
- **WHEN** an active Account with a verified contact and verified Profile Claim enables Profile message requests
- **THEN** the claimed Profile exposes Message while that claim, setting, Account, and policy eligibility remain current

#### Scenario: Named Post author enables requests
- **WHEN** an active Account with a current Public Byline and at least one eligible Post enables Post-author requests
- **THEN** eligible Posts may expose Message through that Public Byline without adding the byline to Profile search or creating a Profile

#### Scenario: Profile is unclaimed or requests are disabled
- **WHEN** a Profile has no verified claimant or its claimant disables requests
- **THEN** Message is absent rather than rendered as a disabled invitation or an Account-existence hint

### Requirement: A sender uses an accountable Message Identity
The system SHALL require an active Account, verified sign-in contact, current Public Byline, recent policy approval, and current recipient entry point to send a Message Request, while preserving a signed-out visitor's intent through progressive Account and Public Byline setup.

#### Scenario: Eligible Account sends first contact
- **WHEN** an active verified-contact Account with a Public Byline passes policy and submits from a current Profile or Post entry point
- **THEN** the recipient sees that Public Byline and only an explicitly enabled verified Profile link, never Private Account Identity

#### Scenario: Sender lacks a Public Byline
- **WHEN** a signed-in Account attempts a Message Request without a Public Byline
- **THEN** the system asks only for the foundation display name and optional photo, preserves the draft, and does not require a Profile Claim

#### Scenario: Anonymous author enters from their Review
- **WHEN** an Account attempts to use an anonymous Review, `Review author` Comment, Vote, Award, or isolated Notification as the sender or recipient identity
- **THEN** the system denies the path without confirming the hidden Account or offering a Public Byline fallback from that activity

### Requirement: First contact is one bounded contextual text
The system SHALL require one substantive text of at most 300 Unicode grapheme clusters, one purpose from `Connect`, `Collaborate`, `Invest`, `Hire`, or `Other`, and the canonical Profile or Post entry context; SHALL reject links and URL-like text; and SHALL NOT accept images, video, audio, files, rich previews, contact cards, polls, or additional messages before acceptance.

#### Scenario: Sender submits a valid introduction
- **WHEN** the request contains an allowed purpose, substantive bounded text, and current source context
- **THEN** the system creates one pending request showing the sender's Message Identity, purpose, exact text, source context, sent time, and recipient controls

#### Scenario: Sender includes a link or attachment
- **WHEN** the pending request contains a URL, URL shortener, attachment, executable embed, unsupported media, or more than 300 grapheme clusters
- **THEN** the system keeps it unsent and identifies the exact text-only correction required

### Requirement: Message Request lifecycle is explicit
The system SHALL represent a request as `pending`, `accepted`, `declined`, `canceled`, `expired`, `blocked`, or `removed`; SHALL expire pending requests after 30 days; and SHALL authorize transitions by role without treating inbox archive as shared lifecycle.

#### Scenario: Recipient accepts a pending request
- **WHEN** the recipient accepts while both Accounts, Message Identities, Blocks, and policy state remain eligible
- **THEN** the request becomes accepted exactly once and opens one Direct Message conversation containing the introduction as its first message

#### Scenario: Recipient privately declines
- **WHEN** the recipient declines a pending request
- **THEN** it becomes declined, leaves the active request queue, and gives the sender only a generic no-longer-pending outcome without the action, reason, read state, or time

#### Scenario: Sender cancels before decision
- **WHEN** the sender cancels a pending request
- **THEN** it becomes canceled, leaves the recipient's active queue, and cannot be accepted

#### Scenario: Pending request reaches 30 days
- **WHEN** a request remains pending at its expiry
- **THEN** it becomes expired, emits no decline signal, and creates no conversation

### Requirement: Recipient controls do not signal attention
The system SHALL let the recipient accept, decline, archive, restore, block, or report a pending request without exposing request views, archive state, decline reason, hidden-folder placement, or read receipts to the sender.

#### Scenario: Recipient archives a pending request
- **WHEN** the recipient archives without accepting or declining
- **THEN** only that recipient's queue placement changes, the request remains pending until another transition or expiry, and the sender receives no event

#### Scenario: Recipient restores a recent decline
- **WHEN** the recipient restores and accepts a declined request within 30 days and no Block or enforcement prohibits it
- **THEN** the request becomes accepted and opens the same single conversation without allowing the sender to resend

#### Scenario: Recipient reports the request
- **WHEN** the recipient reports spam, scam, impersonation, harassment, sexual content, private data, or another documented violation
- **THEN** the system preserves the request privately, creates or joins a Moderation Case, offers Block, and does not identify the reporter to the sender

### Requirement: Pair and Account quotas prevent repeated cold contact
The system SHALL allow at most one unresolved Message Request per Account pair, at most three new recipient Accounts per sender in a rolling 24 hours, and at most ten in a rolling seven days; SHALL let centralized risk policy lower or pause those limits; and SHALL NOT sell or award quota bypass.

#### Scenario: Sender reaches the baseline quota
- **WHEN** a sender attempts an eleventh distinct recipient within seven days or fourth within 24 hours
- **THEN** the system sends nothing and gives a literal next-eligible time without revealing recipient state or private risk signals

#### Scenario: Recipient declines
- **WHEN** a request is declined
- **THEN** the sender cannot send that Account another request unless the recipient later accepts the retained decline or independently initiates an eligible conversation

#### Scenario: Request is canceled or expires
- **WHEN** a request becomes canceled or expired
- **THEN** the sender must wait at least 30 days before another eligible request to that Account and the new attempt still consumes ordinary quota

### Requirement: Acceptance creates messaging permission only
The system SHALL make acceptance grant only one-to-one Direct Message permission between the two Accounts and SHALL NOT create a Follow, Connection, Relationship Claim, Profile Claim, contact export, Feed boost, Open To signal, or consent to off-platform, romantic, sexual, financial, or recruiting contact.

#### Scenario: Recipient accepts a collaboration request
- **WHEN** an eligible collaboration request is accepted
- **THEN** both Accounts may use the resulting conversation under Direct Message policy with no other social or reputation state change

#### Scenario: Sender interprets acceptance as broader consent
- **WHEN** later conduct violates harassment, scam, sexual-content, or other conduct rules
- **THEN** the system applies reporting and enforcement regardless of the prior request purpose or acceptance

### Requirement: Claim and byline changes fail closed for request entry points
The system SHALL reauthorize the recipient Account, Message Identity, claim or Post entry point, setting, Block, and policy before showing or committing a request and SHALL remove new-request entry immediately when any required state becomes ineligible.

#### Scenario: Profile Claim is revoked with pending requests
- **WHEN** a recipient's Profile Claim is revoked
- **THEN** Profile request entry disappears and pending requests through that Profile become generically removed without redirecting to a Public Byline or revealing another path to the same Account

#### Scenario: Public Byline or last Post becomes unavailable
- **WHEN** the recipient's byline is ineligible or no eligible Post remains
- **THEN** the Post-author entry point and pending requests through it become unavailable without falling back to Private Account Identity

### Requirement: Blocks close requests without revealing direction
The system SHALL apply a Block before request discovery, creation, viewing, acceptance, restoration, notification, and analytics; SHALL close pending requests and prevent new ones; and SHALL NOT resurrect them after unblock.

#### Scenario: Block occurs while request is pending
- **WHEN** either Account blocks the other
- **THEN** the request becomes blocked, leaves both actionable queues, emits no attention signal, and returns only generic interaction-unavailable behavior to the blocked side

#### Scenario: Hidden author is the blocked Account
- **WHEN** request policy detects that one participant also privately authored an anonymous Review or `Review author` Comment
- **THEN** the system enforces the Block without confirming that authorship through request visibility, eligibility, errors, timing, or logs exposed outside authorized case access

### Requirement: Closed request content has bounded retention
The system SHALL keep pending and recipient-restorable declined request content for no longer than 90 days after closure or expiry, minimize it thereafter, and retain only proportionate reported evidence or anti-abuse receipts under the foundation's 24-month safety class or a recorded legal hold.

#### Scenario: Ordinary declined request reaches 90 days
- **WHEN** no report, appeal, or legal hold applies 90 days after decline
- **THEN** the system deletes the request body and source snapshot and retains no sender-visible decline detail

#### Scenario: Reported request is under review
- **WHEN** a Moderation Case needs the request after ordinary expiry
- **THEN** authorized safety roles retain only the reported request and necessary context under the case retention contract without restoring it to either inbox

### Requirement: Request inbox states are literal and private
The system SHALL order active Message Requests newest-first with a stable Account-bound cursor and provide empty, archived, declined, expired, blocked, removed, invalid-cursor, rate-limited, and temporarily unavailable states without exposing another Account's queue or hidden status.

#### Scenario: Recipient has no active requests
- **WHEN** the recipient opens an empty request inbox
- **THEN** the system shows a genuine empty state without fabricated interest, suggested contacts, or a prompt to open requests publicly

#### Scenario: Request policy is unavailable
- **WHEN** current request authorization cannot be obtained
- **THEN** the system fails closed for request reads and mutations, preserves safe retry where possible, and never falls back to raw Account, claim, Block, or request records
