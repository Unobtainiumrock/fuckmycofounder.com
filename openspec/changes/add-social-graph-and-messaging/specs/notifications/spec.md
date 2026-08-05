## MODIFIED Requirements

### Requirement: Launch notification events have explicit recipients
The system SHALL notify the current verified Profile claimant when a Review publishes, the eligible Review or Post author when a top-level Comment publishes, the eligible parent Comment author when a reply publishes, the eligible Review author when an Award becomes active, the recipient when a Message Request becomes pending, the sender when that request is accepted, and the other participant when an eligible Direct Message is sent; SHALL deduplicate a recipient who occupies multiple roles; SHALL NOT create individual Review Vote, Follow, decline, cancel, archive, mute, read, Block, or report notifications; and SHALL create followed-Profile Review or linked-Post activity only for followers who explicitly enable that category.

#### Scenario: Message Request becomes pending
- **WHEN** a new request remains eligible after current recipient, Message Identity, Block, risk, and request-setting evaluation
- **THEN** the system creates one recipient-private in-app Notification with the safe sender Message Identity, purpose, source context, and accept, decline, Block, and Report actions

#### Scenario: Request is accepted
- **WHEN** the recipient accepts and the conversation opens
- **THEN** the system creates one sender Notification linking to the conversation without creating a Connection, Follow, or attention history

#### Scenario: Message arrives in an accepted conversation
- **WHEN** an eligible participant sends a Direct Message and the recipient has not muted the conversation
- **THEN** the system creates one safe recipient Notification without a message-body or link preview outside the private conversation

#### Scenario: Recipient declines or blocks
- **WHEN** a recipient declines, archives, blocks, reports, or merely reads a request or message
- **THEN** the system creates no sender Notification and exposes no action, reason, time, or block direction

#### Scenario: Followed Profile has activity
- **WHEN** an eligible Review publishes on a followed Profile or an eligible Post publishes from its currently linked verified claimant
- **THEN** only a follower who explicitly opted into followed-Profile activity may receive one in-app Notification from the current public object projection

### Requirement: Delivery channels and defaults are deliberate
The system SHALL deliver eligible community and messaging Notifications in-app by default, SHALL send claimed-Profile Review-publication email unless that content-alert email category is disabled, SHALL send discussion, Award, Message Request, request-acceptance, Direct Message, and followed-Profile email only after explicit category opt-in, SHALL NOT include Direct Message bodies or link destinations in email subject or preview, SHALL NOT support launch push delivery, and SHALL preserve required Account-security, moderation, enforcement, and appeal notices under their governing contracts.

#### Scenario: First request arrives under defaults
- **WHEN** a recipient has not changed messaging notification preferences
- **THEN** the request appears in the private request inbox and in-app Notifications and sends no email or push

#### Scenario: Recipient opts into messaging email
- **WHEN** an eligible request or message event occurs for an Account that enabled that email category
- **THEN** email says that a request or message is waiting and links to the authenticated inbox without including request text, message body, links, anonymous-author hints, or hidden safety state

#### Scenario: Conversation is muted
- **WHEN** an eligible Direct Message arrives in a conversation muted by its recipient
- **THEN** the message remains in the private conversation and no optional in-app or email Notification is delivered

### Requirement: Preferences and mutes have deterministic precedence
The system SHALL let an Account configure delivery by category and channel and mute discussion or Award activity for a specific canonical object or Comment Thread and message activity for a specific conversation; SHALL apply Block and policy prohibitions first, source or conversation eligibility second, object/thread/conversation mute third, category/channel preference fourth, and batching last; and SHALL NOT let a content author, message participant, or request sender change another Account's inbox or required safety notices.

#### Scenario: Recipient has blocked the actor
- **WHEN** an otherwise eligible Follow, Message Request, or Direct Message event crosses a foundation Block
- **THEN** notification policy suppresses it before optional preferences and discloses neither event nor block direction

#### Scenario: Messaging category is disabled but conversation is not muted
- **WHEN** an eligible Direct Message arrives
- **THEN** it remains available in the DM inbox while optional Notification delivery follows the disabled category setting

### Requirement: Source state is checked before send and open
The system SHALL re-evaluate source eligibility, recipient eligibility, attribution or Message Identity, Block, mute, request or conversation state, and policy before optional delivery; SHALL suppress queued optional intents whose source or relationship is no longer eligible; and SHALL show a literal unavailable state when a previously delivered target is later removed.

#### Scenario: Request is canceled before delivery
- **WHEN** a queued request Notification references a request that becomes canceled, expired, declined, blocked, or removed
- **THEN** the system suppresses optional delivery and includes no cached request text, sender identity, recipient action, or hidden reason

#### Scenario: Message Identity becomes unavailable
- **WHEN** claim revocation, byline removal, Account state, or policy makes a conversation identity unavailable before send
- **THEN** the system suppresses the optional Notification and does not fall back to Private Account Identity, another byline, a Profile guess, or stale preview

#### Scenario: Prior Notification is opened after Block
- **WHEN** the recipient opens an earlier request or DM Notification after either Account blocks the other
- **THEN** its action resolves to a generic unavailable state without revealing block direction or resurrecting the request or conversation

### Requirement: Notification content preserves confidentiality
The system SHALL exclude private Account identifiers, contacts, Review and Profile Claim evidence, anonymous-author linkage, reporter identity, block direction, risk features, moderation notes, confidential case details, Direct Message bodies, request text outside the private authenticated request projection, and private link destinations from Notification projections, email subjects, previews, analytics, and delivery logs.

#### Scenario: Anonymous Review author is also a message participant
- **WHEN** an event concerns an Account that privately authored an anonymous Review or `Review author` Comment
- **THEN** Notification content contains no cross-object identity, Follow, Message, mutual, or activity hint that confirms or denies the linkage

#### Scenario: Delivery adapter receives a DM intent
- **WHEN** an adapter prepares in-app or email delivery for an eligible message
- **THEN** it receives only conversation identifier, safe current Message Identity, generic event copy, and authorized action, not raw message text, link targets, hidden revisions, or participant Account fields
