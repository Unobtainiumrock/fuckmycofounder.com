## ADDED Requirements

### Requirement: Launch conversations are private one-to-one Account channels
The system SHALL create one Direct Message conversation for exactly two eligible Accounts only from an accepted Message Request, SHALL present each participant through the authorized Message Identity used for messaging, and SHALL NOT support groups, guests, unclaimed Profile targets, anonymous identities, or public conversation routes.

#### Scenario: Request is accepted
- **WHEN** an eligible Message Request is accepted concurrently more than once
- **THEN** the system creates exactly one Account-pair conversation and preserves the accepted introduction as its first message

#### Scenario: Public client probes a conversation
- **WHEN** a signed-out visitor or nonparticipant Account requests a conversation or message identifier
- **THEN** the system returns a comparable generic unavailable result without confirming the conversation, participants, messages, or Block state

### Requirement: Existing conversation permission is distinct from new requests
The system SHALL keep an accepted conversation active when a participant disables new Message Requests and SHALL require a Block, enforcement state, Account lifecycle state, or unavailable Message Identity to stop new messages.

#### Scenario: Recipient disables Profile requests
- **WHEN** a recipient disables every new-request entry after accepting a conversation
- **THEN** both eligible participants may continue that conversation without exposing a new request action elsewhere

#### Scenario: Conversation is archived
- **WHEN** one participant archives it
- **THEN** only that participant's inbox placement changes, messaging permission remains active, and a later eligible message returns it to that participant's active inbox

### Requirement: Accepted messages support bounded text and safe links
The system SHALL require substantive text of at most 2,000 Unicode grapheme clusters, allow no more than three normalized `http` or `https` links after acceptance, and SHALL NOT support images, video, audio, arbitrary files, location, contact cards, polls, payments, executable embeds, link previews, disappearing messages, or calls at launch.

#### Scenario: Participant sends ordinary text
- **WHEN** a participant submits eligible nonempty text within the bound
- **THEN** the system publishes the exact text once with sender Message Identity, sent time, and stable opaque identifier

#### Scenario: Participant sends safe links
- **WHEN** a message contains up to three allowed links that pass current link policy
- **THEN** the system renders literal destinations through a safety interstitial without fetching or displaying remote preview content

#### Scenario: Message includes unsupported content
- **WHEN** text is empty or over limit, a scheme is disallowed, link policy is unavailable, or the payload includes unsupported media or embeds
- **THEN** the system sends nothing and identifies the correction without publishing, uploading, or previewing the content

### Requirement: Message delivery is idempotent and does not imply reading
The system SHALL give each client send a stable idempotency key, represent participant-visible delivery only as `sending`, `sent`, or `failed`, retry safely without duplication, and SHALL NOT emit read receipts, typing indicators, online presence, screenshot signals, or recipient-attention analytics at launch.

#### Scenario: Send receipt is lost
- **WHEN** the sender retries the same accepted message after an ambiguous response
- **THEN** the conversation contains one message and returns its stable sent state

#### Scenario: Recipient opens the conversation
- **WHEN** a participant reads one or more messages
- **THEN** the other participant receives no read time, seen marker, notification, or derived attention state

### Requirement: Short-window edits are visible and versioned
The system SHALL let a sender edit only text and allowed links in their message for 15 minutes after successful send, show an `Edited` label and public edit time to both participants, preserve prior revisions only for restricted safety purposes, and SHALL NOT change sender, conversation, original sent time, or reply context.

#### Scenario: Sender corrects a typo in time
- **WHEN** an eligible edit passes policy within 15 minutes
- **THEN** the latest revision replaces the participant-visible body and displays `Edited` without exposing prior text

#### Scenario: Edit arrives after the window
- **WHEN** the sender attempts an edit more than 15 minutes after send
- **THEN** the system leaves the prior body unchanged and explains that the edit window closed

#### Scenario: Report references an edited message
- **WHEN** a participant reports a message after it was edited
- **THEN** the Moderation Case can preserve the reported revision and necessary prior revisions without making version history visible in the conversation

### Requirement: Deletion is local and does not promise recall
The system SHALL let each participant delete a message or conversation from only their own inbox, SHALL disclose before confirmation that the other participant may retain or have copied it, and SHALL NOT provide launch unsend, global recall, or remote-device deletion.

#### Scenario: Sender deletes a sent message
- **WHEN** the sender chooses Delete for me
- **THEN** the message leaves the sender's ordinary projection while remaining in the recipient's projection and any proportionate safety record

#### Scenario: Both participants delete the conversation
- **WHEN** neither participant retains the conversation and no active report, appeal, or legal hold requires it
- **THEN** primary message content is scheduled for deletion within 30 days and backups expire within 90 days

### Requirement: Participants control inbox placement and optional notices
The system SHALL let each participant independently archive, unarchive, mute, and unmute a conversation, SHALL continue receiving eligible messages while muted, and SHALL keep those controls private from the other participant.

#### Scenario: Participant mutes a conversation
- **WHEN** the other participant sends an eligible message
- **THEN** the message appears in the conversation without an optional Notification and the sender receives no mute signal

#### Scenario: Participant manually unarchives
- **WHEN** they restore an archived conversation
- **THEN** only their inbox placement changes and no message, request, Follow, or Notification is created

### Requirement: Blocks stop messaging immediately and do not resurrect permission
The system SHALL apply the foundation Block before message send, delivery, inbox projection, participant discovery, notification, and link handling; SHALL stop new messages and close active permission; and SHALL NOT reopen the conversation automatically after unblock.

#### Scenario: Block occurs during a conversation
- **WHEN** either participant blocks the other
- **THEN** no later message or optional Notification is delivered, pending sends fail generically, existing content remains available only as allowed for local deletion, report, and retention, and block direction is not disclosed

#### Scenario: Block is removed
- **WHEN** the Block later ends
- **THEN** prior messaging permission remains closed until a fresh eligible Message Request is accepted

### Requirement: Message Identity loss pauses interaction safely
The system SHALL reauthorize both Message Identities before send and current conversation rendering, SHALL pause new messaging when a required claim, Public Byline, Account, or policy state becomes ineligible, and SHALL NOT fall back to Private Account Identity or infer another public identity.

#### Scenario: Profile Claim used for messaging is revoked
- **WHEN** a participant loses the verified Profile Claim that supplied their Message Identity and has no independently selected eligible Public Byline
- **THEN** new messaging pauses and the other participant sees `Identity unavailable` without claim reason, contact data, or a guessed byline

#### Scenario: Participant establishes another eligible Message Identity
- **WHEN** the Account later explicitly selects a current Public Byline or verified claimed Profile and passes policy
- **THEN** the conversation may resume with the new current identity and a visible identity-updated marker without public previous-name history

#### Scenario: Account deletion finalizes
- **WHEN** a participant's Account becomes deleted
- **THEN** new messaging stops, retained shared messages show noninteractive `Former member`, and no Profile, Public Byline, private contact, or new Account is inferred

### Requirement: Direct Messages resist spam, scams, harassment, and manipulation
The system SHALL apply per-Account and per-conversation rate limits, duplicate and bulk-text detection, link-risk checks, impersonation and off-platform scam signals, prohibited-contact and sexual-harassment policy, enforcement-evasion controls, and literal retry behavior without treating ordinary disagreement or a report count as proof.

#### Scenario: Account sends repetitive outreach
- **WHEN** timing, recipient diversity, text similarity, declines, blocks, reports, or links indicate bulk unsolicited messaging
- **THEN** the system slows or denies sends, may close outbound permission or limit the Account, and withholds thresholds and recipient actions useful for evasion

#### Scenario: Link resembles credential theft or payment fraud
- **WHEN** current checks identify a suspicious destination or urgent request for credentials, money, sensitive identity data, or off-platform transfer
- **THEN** the system withholds the message or places a clear warning before access, preserves report and Block controls, and never labels the destination safe merely because it uses HTTPS

#### Scenario: Rate policy is unavailable
- **WHEN** an authoritative decision for a message mutation cannot be obtained
- **THEN** the system fails closed, preserves the unsent text locally when safe, and offers retry without creating a partial or duplicate message

### Requirement: Every message and conversation is reportable
The system SHALL let either participant report one message or the conversation for bounded safety reasons, preserve the selected content and proportionate adjacent context privately, route it through the foundation Moderation Case contract, and keep Block available without revealing the reporter.

#### Scenario: Recipient reports one message
- **WHEN** the recipient reports harassment, threat, private data, impersonation, spam, scam, sexual content, or another documented violation
- **THEN** the system records the selected revision, necessary context, reporter, reason, and time privately and returns a receipt without notifying the sender who reported

#### Scenario: Reporter locally deleted the conversation
- **WHEN** an Account reports through an available safety-history path after local deletion and before ordinary retention expiry
- **THEN** the platform may use the retained reportable copy without restoring it to the ordinary inbox or expanding staff access

### Requirement: Conversation retention and export are explicit
The system SHALL keep ordinary message content while at least one participant retains the conversation, let an Account export the messages and participant-visible identity context it is authorized to see, delete primary content within 30 days after both participants delete or both Accounts finalize deletion, expire backups within 90 days, and retain only reported evidence under the foundation safety class or legal hold.

#### Scenario: One participant requests export
- **WHEN** a recently reauthenticated Account exports its Direct Messages
- **THEN** the export contains its participant-visible transcript, message and edit times, local archive or mute state, and current visible Message Identities without another Account's contact, block direction, report, risk, anonymous-author link, or hidden revision history

#### Scenario: One Account deletes while the other retains messages
- **WHEN** Account deletion finalizes but the other participant retains the conversation
- **THEN** the shared bodies may remain in that recipient's authorized copy with minimized `Former member` identity, while the deleted Account's private identity and active permissions follow the foundation erasure schedule

### Requirement: Private messaging makes no end-to-end confidentiality promise
The system SHALL describe Direct Messages as visible to the participants and accessible to authorized platform systems or trained safety roles for delivery, abuse prevention, reports, valid legal process, and declared retention, and SHALL NOT claim launch end-to-end encryption, disappearing secrecy, screenshot prevention, or recall.

#### Scenario: Account begins its first conversation
- **WHEN** the accepted request opens the DM composer
- **THEN** concise privacy copy explains participant copying, platform safety access, report behavior, and launch exclusions without interrupting every later send

#### Scenario: Unauthorized staff role requests a transcript
- **WHEN** a role without the required purpose and permission attempts access
- **THEN** the system denies the request and records the denied reveal attempt under the foundation audit contract

### Requirement: DM inbox and conversation failures are literal and private
The system SHALL provide Account-bound stable pagination and loading, empty, archived, muted, identity-unavailable, participant-deleted, blocked, message-failed, invalid-cursor, policy-unavailable, and storage-unavailable states without stale raw payload fallback.

#### Scenario: DM inbox is empty
- **WHEN** an Account has no retained accepted conversations
- **THEN** the system shows a genuine empty state without fabricated messages, contact import, or a prompt to enable open requests

#### Scenario: Conversation storage is unavailable
- **WHEN** current messages or a mutation cannot be durably read or committed
- **THEN** the system shows a stable unavailable or failed state, sends no false receipt, and does not reconstruct the transcript from Notifications, analytics, or cached private events

### Requirement: Anonymous Review authorship never crosses messaging
The system SHALL NOT use anonymous Review authorship, `Review author` Comments, Vote or Award activity, isolated recipient events, Blocks involving hidden authors, or moderation records to create DM targets, suggestions, shared-context labels, eligibility, warnings, or identity hints.

#### Scenario: Existing DM participant authored an anonymous Review
- **WHEN** one participant privately authored an anonymous Review visible to the other participant
- **THEN** the conversation adds no authored-by marker, Review context, special ordering, notification, safety hint, or confirmatory error unless the author independently types a self-disclosure that the platform does not verify to the recipient

#### Scenario: Participant shares the anonymous Review's public link
- **WHEN** either participant sends its Canonical Share Link after acceptance
- **THEN** the message renders only the link and Review's authorized public projection and does not reveal which participant, if any, authored it
