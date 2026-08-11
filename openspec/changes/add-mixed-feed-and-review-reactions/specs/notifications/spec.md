## ADDED Requirements

### Requirement: Notifications are Account-private projections
The system SHALL create a Notification only for one authorized recipient Account from a durable activity event, current canonical source, safe actor projection, recipient preferences, Blocks, mutes, and policy state and SHALL expose no public notification endpoint or cross-Account inbox data.

#### Scenario: Recipient opens the inbox
- **WHEN** an authenticated Account requests its Notifications
- **THEN** the system returns only that Account's eligible safe projections with read state and canonical actions

#### Scenario: Another Account requests the inbox
- **WHEN** an Account or public client requests another Account's Notifications
- **THEN** the system denies the request without revealing whether the recipient, event, source, or notification exists

### Requirement: Launch notification events have explicit recipients
The system SHALL notify the current verified Profile claimant when a Review publishes, the eligible Review or Post author when a top-level Comment publishes, the eligible parent Comment author when a reply publishes, and the eligible Review author when an Award becomes active; SHALL deduplicate a recipient who occupies multiple roles; and SHALL NOT create individual Review Vote notifications.

#### Scenario: Review publishes on a claimed Profile
- **WHEN** the Reviews capability emits its claimant-notice event and the current Profile Claim remains verified
- **THEN** the system creates one safe Notification linking to the canonical Review with public relationship context and response, correction, dispute, Block, and Report actions

#### Scenario: Comment author replies to themself
- **WHEN** the same Account is both source actor and only eligible recipient
- **THEN** the system does not create a self-notification

#### Scenario: Review receives Votes
- **WHEN** any number of eligible Accounts create, change, undo, or lose Review Votes
- **THEN** the system creates no individual Vote Notification and exposes no voter identity or direction through delivery

### Requirement: Anonymous Review authors receive isolated notices
The system SHALL deliver eligible Notifications to the private Account behind an anonymous Review while referring only to **your Review** or **Review author**, and SHALL NOT include a Public Byline, Profile link, message target, stable pseudonym, or data that lets another recipient infer the author.

#### Scenario: Anonymous Review receives a Comment
- **WHEN** a named Account comments on an eligible anonymous Review
- **THEN** the Review author's private inbox may say that someone commented on **your Review** and links to the thread without publishing an author identity

#### Scenario: Review author comments as Review author
- **WHEN** a thread event carries the isolated **Review author** projection
- **THEN** recipients see only that contextual label and never receive the author's Public Byline or Account identifier from notification data

### Requirement: Delivery channels and defaults are deliberate
The system SHALL deliver eligible community Notifications in-app by default, SHALL send claimed-Profile Review-publication email unless that content-alert email category is disabled, SHALL send discussion and Award email only after explicit opt-in, SHALL NOT support launch push delivery, and SHALL preserve required Account-security, moderation, enforcement, and appeal notices under their governing contracts.

#### Scenario: New Account takes its first action
- **WHEN** an Account is created for a protected action
- **THEN** the system applies launch defaults without interrupting the action with a general notification-settings prompt

#### Scenario: Comment event occurs for default Account
- **WHEN** an eligible discussion Notification is created and the recipient has not opted into community email
- **THEN** the system places it in-app and sends no community email

#### Scenario: Required enforcement notice occurs
- **WHEN** the foundation requires an Account to receive an enforcement or appeal notice
- **THEN** optional community mutes do not suppress the required notice, though channel safety and contact availability still govern delivery

### Requirement: Preferences and mutes have deterministic precedence
The system SHALL let an Account configure delivery by category and channel and mute discussion or Award activity for a specific canonical object or Comment Thread; SHALL apply Block and policy prohibitions first, object/thread mute second, category/channel preference third, and batching last; and SHALL NOT let a content author mute required safety notices or another person's inbox.

#### Scenario: Post author mutes a thread
- **WHEN** a new top-level Comment publishes after the Post author muted that Thread
- **THEN** the system suppresses the optional discussion Notification for that author without deleting the Comment or changing other eligible recipients

#### Scenario: Recipient has blocked the actor
- **WHEN** an otherwise eligible community event crosses a foundation Block
- **THEN** notification policy suppresses it before checking optional preferences and discloses neither the event nor block direction

### Requirement: Notification creation and delivery are idempotent
The system SHALL use stable event-recipient idempotency, SHALL create no more than one Notification per recipient and semantic event, SHALL batch repeated Award or discussion activity without changing source counts, and SHALL retry delivery failures without replaying the source action.

#### Scenario: Activity event is delivered twice
- **WHEN** the same durable event is consumed more than once
- **THEN** the recipient has one Notification or one correct batch membership and receives no duplicate email

#### Scenario: Email provider is unavailable
- **WHEN** an eligible email intent cannot be delivered
- **THEN** the system retains the in-app Notification, retries within a bounded policy, records channel failure privately, and does not undo the Review, Comment, or Award

### Requirement: Source state is checked before send and open
The system SHALL re-evaluate source eligibility, recipient eligibility, attribution, Block, and mute state before optional delivery, SHALL suppress queued optional intents whose source or relationship is no longer eligible, and SHALL show a literal unavailable state when a previously delivered target is later removed.

#### Scenario: Comment is removed before email send
- **WHEN** a queued discussion email references a Comment that becomes removed
- **THEN** the system suppresses the email and does not include cached text or a removal reason

#### Scenario: Review is removed after notification delivery
- **WHEN** a recipient later opens the prior Notification
- **THEN** the inbox may retain minimal non-sensitive history but the target action shows **Content unavailable** without stale testimony, anonymous identity, or case details

#### Scenario: Profile Claim changes before claimant notice
- **WHEN** the claimant event was emitted but the Profile Claim is no longer verified at send time
- **THEN** the system suppresses claimant delivery and does not redirect it to a former or guessed claimant

### Requirement: Notification content preserves confidentiality
The system SHALL exclude private Account identifiers, contacts, Review and Profile Claim evidence, anonymous-author linkage, reporter identity, block direction, risk features, moderation notes, and confidential case details from Notification projections, email subjects, previews, analytics, and delivery logs.

#### Scenario: Moderation notice references a confidential case
- **WHEN** an affected Account receives a required case or appeal Notification
- **THEN** it contains only the authorized rule, action, scope, safe reason, and appeal route and does not identify a reporter or anonymous author

#### Scenario: Lock-screen or email preview is generated
- **WHEN** a delivery adapter creates preview text for a community Notification
- **THEN** it uses the safe approved projection and does not add raw Comment, Review, actor, or Profile data absent from the intent

### Requirement: The inbox has stable pagination and literal states
The system SHALL order Notifications newest-first by creation time and stable identifier, paginate with an opaque Account-bound cursor, support individual and mark-all read state, and expose literal empty, end, loading, invalid-cursor, and temporarily unavailable states.

#### Scenario: Cursor is replayed by another Account
- **WHEN** an Account submits a cursor issued to a different recipient
- **THEN** the system rejects it without revealing the other inbox's size, events, or recipient

#### Scenario: Inbox is empty
- **WHEN** the authenticated Account has no eligible Notifications
- **THEN** the system shows a genuine empty state without fabricated activity or a prompt to enable every email category

#### Scenario: Notification policy is unavailable
- **WHEN** the system cannot authorize current inbox projections
- **THEN** it shows **Notifications temporarily unavailable** and does not fall back to raw event payloads or stale confidential previews
