## ADDED Requirements

### Requirement: Ordinary Comments are Account-backed and named
The system SHALL require an active Account and current Public Byline to publish an ordinary Comment and SHALL NOT offer anonymous or pseudonymous Comment attribution to unrelated participants.

#### Scenario: Account comments for the first time
- **WHEN** an active Account without a Public Byline proceeds to publish an ordinary Comment
- **THEN** the system requests only the foundation display name and optional photo, returns to the preserved Comment, and does not require a Profile Claim

#### Scenario: Signed-out visitor attempts to comment
- **WHEN** a signed-out visitor enters a Comment and chooses publish
- **THEN** the system keeps it local and nonpublic, invokes progressive Account setup, and returns to the pending Comment after successful authentication

#### Scenario: Commenter requests anonymity
- **WHEN** an Account that is not using the Review-author exception attempts to omit or replace its Public Byline
- **THEN** the system does not publish the Comment and explains that ordinary Comments are named

### Requirement: Anonymous Review authors have one isolated Comment identity
The system SHALL let the Account-backed author of an anonymously attributed Review comment within that Review's Comment Thread as `Review author` and SHALL expose no Public Byline, Profile link, message target, stable pseudonym, or Account identifier through that projection.

#### Scenario: Anonymous author comments on their Review
- **WHEN** the private Review author adds an eligible Comment anywhere in that Review's thread
- **THEN** the system renders `Review author` through the foundation isolation seam without creating or revealing a Public Byline

#### Scenario: Same Account comments elsewhere
- **WHEN** that Account comments on another Review or any Post
- **THEN** the system requires its Public Byline and does not reuse the `Review author` label or reveal that it authored an anonymous Review

#### Scenario: Named Review author comments
- **WHEN** the author of a named Review comments in that Review's thread
- **THEN** the system renders the current Public Byline and may add a non-identity-bearing contextual `Review author` marker

#### Scenario: Attribution projection is unavailable
- **WHEN** the system cannot produce the authorized named or Review-author projection
- **THEN** it publishes no Comment and preserves a safe retry path rather than falling back to Private Account Identity

### Requirement: Comments attach only to published Posts and Reviews
The system SHALL attach each Comment Thread to one published Post or Review and SHALL attach each Comment either to that root object or within one top-level Comment thread.

#### Scenario: Reader comments on a published object
- **WHEN** an eligible Account submits a Comment against a published Post or Review with an open thread
- **THEN** the system records the root object and publishes a top-level Comment after policy approval

#### Scenario: Parent object is unavailable
- **WHEN** the Post or Review is draft, under review, withdrawn, limited, removed, deleted, or otherwise ineligible before Comment publication commits
- **THEN** the system publishes no Comment and returns a generic parent-unavailable outcome without revealing hidden lifecycle details

#### Scenario: Comment targets another object kind
- **WHEN** a client attempts to attach a Comment directly to a Profile, Profile Subject Response, Exhibit, Post image, Assessment, or Feed item
- **THEN** the system rejects the unsupported parent and points to the owning Post or Review thread when one is publicly eligible

### Requirement: Profile Subject Responses remain distinct from Comments
The system SHALL render and govern a Profile Subject Response through the Review capability, SHALL NOT insert it into Comment ordering or counts, and SHALL NOT grant its claimant author Comment moderation powers.

#### Scenario: Verified claimant responds through the Review contract
- **WHEN** an approved Profile Subject Response exists on a Review
- **THEN** the system renders it in a clearly labeled section separate from the Comment Thread and does not represent it as a top-level Comment

#### Scenario: Profile subject joins ordinary discussion
- **WHEN** the Profile subject chooses to Comment on the Review in addition to or instead of a Profile Subject Response
- **THEN** the system applies ordinary Public Byline, policy, ordering, and author-control rules without a special moderation role

#### Scenario: Comment attempts to change Review data
- **WHEN** any commenter refers to or disputes the Review, relationship, Assessment, attribution, or Subject Response
- **THEN** the system stores only discussion text and does not mutate those Review-owned objects or substitute for their correction, dispute, or appeal flows

### Requirement: Threads stop at two visible levels
The system SHALL render top-level Comments and one reply level only, SHALL keep each reply in its top-level Comment thread, and SHALL retain the selected reply target without recursively increasing visible depth.

#### Scenario: Account replies to a top-level Comment
- **WHEN** an eligible Account replies to a published top-level Comment
- **THEN** the system renders the new Comment at the second level under that top-level Comment and records the top-level Comment as its reply target

#### Scenario: Account replies to a reply
- **WHEN** an eligible Account selects Reply on a second-level Comment
- **THEN** the system renders the new Comment as another second-level reply under the same top-level Comment and retains the selected Comment as a reply-target reference

#### Scenario: Client attempts a deeper parent chain
- **WHEN** a client submits a parent structure that cannot resolve to one eligible top-level Comment and optional reply target in the same thread
- **THEN** the system rejects it without creating an orphan, cross-object reply, or hidden third level

### Requirement: Comment ordering is chronological and deterministic
The system SHALL order top-level Comments oldest-first and order replies within each top-level thread oldest-first, using a stable opaque identifier to break equal publication times.

#### Scenario: Comments have equal publication times
- **WHEN** two eligible Comments at the same level share the same publication timestamp
- **THEN** every public client uses the stable identifier tie-breaker and returns the same order

#### Scenario: New reply is published
- **WHEN** a Comment thread already has replies and a later reply publishes
- **THEN** the system appends it in chronological position without re-ranking older discussion or moving the top-level thread

#### Scenario: Comment is limited or deleted
- **WHEN** a state change replaces a Comment body with a structural tombstone
- **THEN** the tombstone retains the Comment's ordering position so eligible replies do not jump between contexts

### Requirement: Comments contain bounded text and safe links
The system SHALL require substantive nonempty text of no more than 1,000 Unicode grapheme clusters, SHALL render normalized `http` or `https` links safely, and SHALL NOT support images, video, arbitrary files, polls, executable embeds, or other URL schemes in Comments at launch.

#### Scenario: Account submits ordinary text
- **WHEN** a Comment contains substantive text of no more than 1,000 Unicode grapheme clusters and passes policy
- **THEN** the system publishes the exact text with its authorized attribution and canonical Comment identity

#### Scenario: Comment contains safe links
- **WHEN** Comment text contains valid `http` or `https` links
- **THEN** the system renders them as external destinations without executing remote content or treating linked claims as verified

#### Scenario: Comment is empty or contains unsupported content
- **WHEN** a Comment is whitespace-only, over the launch limit, contains a disallowed scheme, attachment, executable embed, or unsupported media
- **THEN** the system keeps it unpublished and identifies the exact correction required

### Requirement: Comment lifecycle and revisions are explicit
The system SHALL represent Comment visibility as `pending`, `published`, `limited`, `removed`, or `deleted`; SHALL store accepted edits as immutable revisions; and SHALL display `edited` and the latest public edit time without changing author, root object, top-level thread, or reply target.

#### Scenario: Comment publishes normally
- **WHEN** an eligible Comment passes Account, byline or Review-author attribution, block, thread, content, rate, and risk checks
- **THEN** the system marks it `published`, exposes its canonical projection, and emits an eligible discussion-activity hook

#### Scenario: Author edits a published Comment
- **WHEN** the authenticated author submits changed text
- **THEN** the system evaluates a new immutable revision and keeps the last eligible revision public until the edit is accepted

#### Scenario: Edit is accepted
- **WHEN** policy accepts the Comment revision
- **THEN** the system atomically makes it current, displays `edited`, and retains prior text only in restricted safety history

#### Scenario: Edit fails or requires review
- **WHEN** the edit fails validation, policy, or durable processing
- **THEN** the system leaves the prior public revision unchanged and provides a safe correction or retry path

### Requirement: Comment deletion preserves only necessary thread context
The system SHALL let a Comment author delete their Comment immediately, SHALL withhold its body and attribution, and SHALL render a generic structural tombstone only while eligible replies require its position.

#### Scenario: Author deletes a Comment with replies
- **WHEN** the authenticated author deletes a top-level Comment that has eligible replies
- **THEN** the system marks it `deleted`, renders `Comment deleted` without attribution or reason, and preserves the reply subtree and ordering

#### Scenario: Author deletes a Comment without replies
- **WHEN** the authenticated author deletes a Comment that has no eligible replies
- **THEN** the system removes it from the thread and returns a generic unavailable state at its canonical route

#### Scenario: Moderator removes one Comment
- **WHEN** enforcement removes a Comment while eligible replies remain
- **THEN** the system uses a generic unavailable tombstone, withholds the policy reason and prior body publicly, and keeps replies only when they remain understandable and eligible

#### Scenario: Retention expires
- **WHEN** deleted or removed Comment revisions reach their foundation retention deadline with no active appeal or hold
- **THEN** the system deletes or minimizes the restricted payload without changing any generic structural marker still needed by public replies

### Requirement: Discussion controls belong to authors and moderators by role
The system SHALL let Post and Review authors mute activity from their object's Comment Thread, let Comment authors mute replies to their Comment, and reserve thread lock, slow mode, Comment limitation, and removal for authorized moderators.

#### Scenario: Root author dislikes a critical Comment
- **WHEN** a Post author or Review author attempts to delete, hide, reorder, lock, slow, or otherwise moderate another Account's compliant Comment
- **THEN** the system denies the action while offering mute, report, and block controls

#### Scenario: Profile subject attempts Comment moderation
- **WHEN** the reviewed Profile subject or claimant attempts to control ordinary Review Comments
- **THEN** the system grants no special capability beyond ordinary Comment, mute, report, block, correction, dispute, and Profile Subject Response paths

#### Scenario: Moderator locks a thread
- **WHEN** an authorized moderator records a policy basis and locks a Post or Review thread
- **THEN** the system visibly marks the thread locked, rejects new Comments and replies, and continues to permit author edits or deletes, reports, appeals, and moderator actions

#### Scenario: Moderator applies slow mode
- **WHEN** an authorized moderator applies a documented per-Account interval to an escalating thread
- **THEN** the system shows the active delay literally, enforces it without revealing hidden risk signals, and automatically ends it at the recorded expiry unless reviewed

### Requirement: Comments respect Blocks without revealing identity
The system SHALL evaluate Blocks before publishing direct replies or discussion activity, SHALL suppress prohibited targeted interaction between the Accounts, and SHALL preserve independently public content and anonymous Review-author isolation.

#### Scenario: Blocked Account attempts a direct reply
- **WHEN** either Account has blocked the other and one attempts to reply directly to the other's Comment
- **THEN** the system publishes no reply, creates no targeted activity event, and returns a generic interaction-unavailable outcome without revealing block direction

#### Scenario: Blocked Accounts comment independently
- **WHEN** blocked Accounts separately add top-level Comments to the same otherwise eligible public object
- **THEN** the system applies each Account's signed-in visibility and interaction policy without treating the Block as global content removal

#### Scenario: Hidden Review author is one of the blocked Accounts
- **WHEN** enforcing the Block involves the private Account behind `Review author`
- **THEN** the system neither confirms nor denies that linkage through errors, ordering, attribution, events, or moderator-visible data outside authorized case access

### Requirement: Comment threads resist harassment and manipulation
The system SHALL apply per-Account and per-thread rate limits, duplicate and link-spam detection, harassment and private-data policy, thread slow or lock state, and coordinated-activity signals without treating criticism, disagreement, popularity, or report count alone as proof.

#### Scenario: Account floods one thread
- **WHEN** an Account exceeds the documented Comment or reply rate or repeats substantially duplicate text or links
- **THEN** the system slows or rejects the risky action, preserves eligible existing Comments, and provides a literal retry condition without exposing risk thresholds useful for evasion

#### Scenario: Thread becomes a pile-on
- **WHEN** timing, Account, invitation, text-similarity, report, or network signals indicate coordinated harassment or manipulation
- **THEN** the system routes the thread for review and may apply scoped slow mode, lock, limitation, or Account enforcement without increasing Feed eligibility or assuming the target's claims are true

#### Scenario: Comment contains prohibited material
- **WHEN** a Comment contains threats, targeted harassment, private contact or credential data, protected-class abuse, impersonation, spam, or enforcement evasion
- **THEN** the system withholds or removes the material through foundation enforcement and provides the affected Account the applicable notice and appeal path

### Requirement: Every Comment is reportable
The system SHALL make each available Comment reportable using bounded reasons, preserve the targeted revision privately, return a receipt, and route the report through the foundation Moderation Case contract without automatically changing visibility or order.

#### Scenario: Account reports a Comment
- **WHEN** an authenticated Account reports harassment, threat, private data, impersonation, spam, manipulated context, or another documented violation
- **THEN** the system records the Comment revision, reporter, reason, time, and optional context privately and returns a receipt without exposing the reporter

#### Scenario: Duplicate reports arrive
- **WHEN** one or many Accounts submit related reports about the same Comment
- **THEN** the system groups them for triage and abuse analysis and keeps visibility governed by evidence and policy rather than raw report count

### Requirement: Discussion activity emits privacy-safe hooks
The system SHALL emit durable activity hooks for an eligible new top-level Comment, reply, accepted edit, deletion, limitation, removal, lock, and slow-mode change; SHALL carry canonical object identifiers and an authorized public attribution projection; and SHALL evaluate mute, Block, lifecycle, and anonymous-author isolation before any later delivery.

#### Scenario: New reply publishes
- **WHEN** an eligible reply becomes public
- **THEN** the system records a hook for the root author and replied-to author with the canonical thread and Comment identifiers, public-safe excerpt, and authorized attribution without exposing private Account fields

#### Scenario: Anonymous Review author receives activity
- **WHEN** a Comment on an anonymous Review could later notify its private author
- **THEN** the restricted recipient association remains unavailable to public event consumers and the outward attribution remains `Review author` only when that author participates

#### Scenario: Thread author mutes activity
- **WHEN** a Post or Review author mutes its Comment Thread
- **THEN** later delivery eligibility excludes that recipient while Comments remain independently publishable and no commenter is told that the thread was muted

#### Scenario: Notification delivery is requested in this change
- **WHEN** a caller asks the Comments capability to choose channel, batch, timing, or send a notification
- **THEN** the system exposes only the durable eligible hook and defers delivery policy to the later notifications capability

### Requirement: Canonical Comment identity and counts remain stable
The system SHALL assign each Comment a stable opaque canonical identifier, preserve its route across edits and attribution changes, and count only publicly eligible Comments and replies in the root object's public Comment count.

#### Scenario: Comment is edited or its Public Byline changes
- **WHEN** an accepted edit or foundation Public Byline change updates a published Comment's presentation
- **THEN** the same canonical Comment route renders the current eligible revision and attribution without exposing prior text or names by default

#### Scenario: Thread contains tombstones and a Subject Response
- **WHEN** the system computes the public Comment count for a Post or Review
- **THEN** it includes each publicly eligible Comment and reply once and excludes deleted or removed tombstones, limited Comments, pending Comments, and the Profile Subject Response

#### Scenario: Canonical Comment loses its root context
- **WHEN** the owning Post or Review becomes unavailable
- **THEN** the Comment route returns a generic unavailable state rather than rendering the Comment without its source context

### Requirement: Comment state failures are safe and contextual
The system SHALL derive Comment availability from the current root object, Comment, attribution, Account, block, and thread states and SHALL return generic empty, locked, slowed, deleted-parent, removed, deleted-Account, and unavailable outcomes without exposing hidden actors or stale bodies.

#### Scenario: Root object becomes unavailable
- **WHEN** a Post is deleted or a Post or Review becomes limited, removed, withdrawn, or otherwise ineligible
- **THEN** the system withholds the attached Comment Thread and canonical Comment bodies consistently with the root decision

#### Scenario: Comment author Account deletion finalizes
- **WHEN** a compliant ordinary Comment remains after its Account is deleted
- **THEN** the system keeps the Comment in its independent visibility state, renders noninteractive `Former member`, and offers no author interaction or private Account detail

#### Scenario: Anonymous Review author Account deletion finalizes
- **WHEN** an eligible `Review author` Comment remains attached to its still-anonymous eligible Review after Account deletion
- **THEN** the system retains the noninteractive `Review author` label without exposing the former Account or creating cross-Review continuity

#### Scenario: Comment policy or storage is unavailable
- **WHEN** a publication, edit, deletion, lock, slow-mode, report, or activity-hook mutation cannot receive an authoritative decision or durable receipt
- **THEN** the system fails closed for the requested mutation, preserves the last eligible public state and safe retry data, and never shows a false success

#### Scenario: Thread has no Comments
- **WHEN** an eligible Post or Review has no published Comments
- **THEN** the system renders a literal empty discussion state and eligible Comment entry point without fake activity or hidden placeholders
