## ADDED Requirements

### Requirement: Every Post is named participation
The system SHALL require an active Account and current Public Byline to save or publish a Post, SHALL attribute every public Post through that Public Byline, and SHALL NOT require or create a Profile or Profile Claim.

#### Scenario: Signed-out visitor drafts a Post
- **WHEN** a signed-out visitor enters Post content before choosing save or publish
- **THEN** the system keeps the draft local and nonpublic, invokes progressive authentication only for the protected action, and returns the visitor to the preserved draft

#### Scenario: Account has no Public Byline
- **WHEN** an active Account without a Public Byline proceeds to save or publish a Post
- **THEN** the system requests only the foundation display name and optional photo, then returns to the Post without Profile onboarding

#### Scenario: Author has no claimed Profile
- **WHEN** an eligible Account with a Public Byline publishes a Post without a Profile Claim
- **THEN** the system shows the Public Byline without a Profile link or claimed marker and does not reduce Post eligibility

### Requirement: Posts and Reviews remain different objects
The system SHALL represent a Post without a Relationship Claim, Review Assessment, anonymous attribution, relationship-verification label, Run it back answer, or Profile Subject Response and SHALL NOT convert between Post and Review without the author completing the other object's required flow.

#### Scenario: Author publishes ordinary startup commentary
- **WHEN** a named author posts about startup work, products, companies, markets, events, resources, or industry ideas without substantially evaluating an identifiable person's working behavior
- **THEN** the system treats the publication as a Post under Post policy

#### Scenario: Draft substantially evaluates a person
- **WHEN** a draft's central purpose is to assess, accuse, warn about, praise, or recount the author's working experience with an identifiable person
- **THEN** the system does not publish it as a Post, preserves the draft, and offers Profile search and the relationship-backed Review flow

#### Scenario: Post mentions a person incidentally
- **WHEN** a Post names a person for ordinary attribution, congratulations, event context, or non-evaluative professional news
- **THEN** the system permits the mention subject to universal conduct rules and does not require a Relationship Claim merely because a person is named

#### Scenario: Disguised Review is found after publication
- **WHEN** moderation determines that a published Post materially bypasses Review attestation or relationship requirements
- **THEN** the system limits or removes the Post through foundation enforcement, explains the Review route to the author, and does not silently manufacture or convert relationship data

### Requirement: Posts support bounded text, images, and safe links
The system SHALL require at least nonempty text or one eligible image, permit up to 2,000 Unicode grapheme clusters and four ordered images, render normalized `http` or `https` links safely, and SHALL NOT support executable embeds, video, arbitrary files, polls, or other URL schemes at launch.

#### Scenario: Author publishes text and links
- **WHEN** the Post body is no more than 2,000 Unicode grapheme clusters and contains valid `http` or `https` links
- **THEN** the system preserves the authored text, renders each link as an external destination without executing remote content, and publishes after policy approval

#### Scenario: Author publishes images without body text
- **WHEN** the author supplies one to four eligible images with required alternative text and provenance or rights attestations
- **THEN** the system permits the Post after image processing and moderation without inventing a caption or lowering the Post's safety checks

#### Scenario: Content is empty or unsupported
- **WHEN** a draft contains only whitespace, more than four images, a disallowed URL scheme, an executable embed, video, or an arbitrary file
- **THEN** the system keeps the Post unpublished and identifies the exact content that must be removed or corrected

#### Scenario: Link preview cannot be produced
- **WHEN** remote link metadata is missing, unsafe, misleading, or temporarily unavailable
- **THEN** the system preserves a valid authored destination as a plain safe link and does not execute, replace, or block the Post solely because a preview failed

### Requirement: Post images are minimized and moderated
The system SHALL safely decode each Post image, strip location and other unnecessary metadata, create platform derivatives, require alternative text, and apply privacy, rights, intimate-imagery, impersonation, and manipulation policy before public display.

#### Scenario: Image is eligible
- **WHEN** an author uploads a supported image, confirms usable rights, and supplies required alternative text
- **THEN** the system stores a metadata-stripped derivative and keeps the original restricted only for the declared processing and moderation period

#### Scenario: One image cannot be made safe
- **WHEN** one image is malformed, rights-ineligible, confidential, non-consensually intimate, exposes private data, or cannot be safely processed
- **THEN** the system rejects or removes that image, preserves the rest of the draft, and offers a literal replacement or text-only path

#### Scenario: Published image receives a scoped dispute
- **WHEN** a credible report concerns only one Post image
- **THEN** the system may withhold that image immediately while keeping otherwise eligible Post text public and routes the decision through the foundation case and appeal contract

### Requirement: Post visibility and moderation states are explicit
The system SHALL represent Post visibility as `draft`, `under review`, `changes required`, `published`, `limited`, `removed`, or `deleted`, SHALL show the author a literal status, and SHALL expose only `published` revisions on ordinary public and downstream eligibility paths.

#### Scenario: Ordinary named Post passes policy
- **WHEN** a complete Post passes centralized Account, block, content, spam, and risk evaluation
- **THEN** the system commits one public revision, marks the Post `published`, and emits its canonical eligibility hook

#### Scenario: Post requires human review
- **WHEN** risk checks identify possible impersonation, disguised Review content, private data, unsafe media, harassment, spam, or coordinated manipulation without enough basis for an automatic decision
- **THEN** the system marks the Post `under review`, exposes no draft publicly, and gives the author a status without publishing hidden risk signals

#### Scenario: Post can comply through an edit
- **WHEN** moderation identifies a bounded correctable problem in an unpublished Post revision
- **THEN** the system marks the Post `changes required`, explains the required correction literally, and does not publish the replacement without a new policy decision

#### Scenario: Publication policy is unavailable
- **WHEN** the system cannot obtain or durably record an authoritative policy decision for a new Post
- **THEN** it publishes nothing, preserves a safe retryable draft, and does not show a false success or expose internal policy state

### Requirement: Post edits create immutable revisions
The system SHALL record every submitted Post edit as an immutable revision, SHALL preserve author and canonical identity, and SHALL display `edited` and the latest public edit time when an accepted edit replaces a published revision.

#### Scenario: Published author edits text or images
- **WHEN** the authenticated author submits a change to a published Post
- **THEN** the system evaluates the new revision and keeps the last eligible revision public until the replacement is accepted

#### Scenario: Edit is accepted
- **WHEN** policy accepts a Post revision
- **THEN** the system atomically makes it current, displays an edited indicator, and retains the prior revision only in restricted history

#### Scenario: Edit is rejected or processing fails
- **WHEN** a proposed edit fails policy, media processing, or durable storage
- **THEN** the system leaves the prior eligible revision unchanged and gives the author a safe correction or retry path

### Requirement: Authors may delete Posts without erasing safety history
The system SHALL let the authenticated author immediately delete a Post from public, Feed-eligibility, reaction, sharing-source, and Comment paths while preserving restricted revisions, reports, and audit history only under foundation retention or hold rules.

#### Scenario: Author deletes a published Post
- **WHEN** the author confirms deletion
- **THEN** the system marks the Post `deleted`, withholds its body, images, and Comment Thread, and returns a generic unavailable state at canonical Post and dependent Comment routes

#### Scenario: Deleted Post had an open Moderation Case
- **WHEN** a Post is deleted while a report, appeal, or legal hold is active
- **THEN** the system keeps the minimum restricted snapshot needed for that purpose without restoring or exposing the public Post

#### Scenario: Author later wants the Post back
- **WHEN** an author attempts to restore a deleted Post
- **THEN** the system does not silently republish it and requires a new Post subject to current policy and limits

### Requirement: Canonical Post identity survives mutable presentation
The system SHALL assign each Post a stable opaque canonical identifier, keep its canonical route unchanged across edits, Public Byline changes, and Account enforcement, and return state-appropriate public projections without revealing private lifecycle reasons.

#### Scenario: Public Byline changes
- **WHEN** the foundation accepts a change to the author's Public Byline
- **THEN** the same canonical Post route renders the current authorized byline without changing Post identity or exposing previous names by default

#### Scenario: Author Account deletion finalizes
- **WHEN** a compliant published Post remains after its Account is deleted
- **THEN** the system keeps the Post in its independent visibility state, replaces the interactive byline with `Former member`, and disables author-only interaction without exposing deleted Account data

#### Scenario: Post is limited or removed
- **WHEN** enforcement makes the Post ineligible for ordinary public display
- **THEN** the canonical route returns a generic limited or unavailable state and downstream hooks expose ineligibility without moderator notes, report counts, or hidden actors

### Requirement: Posts launch without lightweight reactions
The system SHALL NOT offer Likes, upvotes, downvotes, reposts, polls, Verdict Votes, Review Awards, or Review Vote controls on Posts at launch and SHALL keep Post discussion and canonical eligibility distinct from Review-only judgment signals.

#### Scenario: Reader opens a published Post
- **WHEN** an eligible reader views a Post
- **THEN** the system offers the Post's Comment entry point and stable canonical source hook but no lightweight reaction or Review-specific judgment control

#### Scenario: Downstream client requests Review reaction fields
- **WHEN** a Feed or other public client renders a Post projection
- **THEN** the system omits Review Vote, Verdict, Award, Assessment, relationship, and Run it back fields rather than returning zero-valued substitutes

### Requirement: Posts are reportable and abuse-resistant
The system SHALL make Post text, links, and individual images reportable; route them through foundation Moderation Cases; rate-limit risky creation and editing; and use spam, duplicate, impersonation, harassment, evasion, and coordinated-activity signals without treating sentiment, popularity, or raw report volume as proof.

#### Scenario: Account reports one Post image
- **WHEN** an Account reports privacy, rights, intimate imagery, impersonation, or manipulated context in one image
- **THEN** the system records the exact image revision privately and permits a scoped image decision without requiring otherwise eligible text to be removed

#### Scenario: Accounts coordinate repeated Posts
- **WHEN** timing, text similarity, links, device, network, or Account signals indicate spam or coordinated harassment
- **THEN** the system slows or holds the risky actions, groups related cases, and preserves individual notices and appeals without increasing public reach

#### Scenario: Post author blocks a commenter
- **WHEN** the Post author or another Account establishes a foundation Block
- **THEN** the system suppresses prohibited direct replies and targeted activity while leaving independently public Post visibility governed by the Post state and not revealing block direction

### Requirement: Post failures expose no hidden state
The system SHALL provide safe empty, restricted, removed, deleted, blocked, media-unavailable, attribution-unavailable, and policy-unavailable behavior without falling back to private identity or stale revisions.

#### Scenario: Public attribution cannot be generated
- **WHEN** the foundation cannot produce the Post author's authorized Public Byline projection
- **THEN** the system withholds the Post or its attribution rather than exposing Private Account Identity or guessing from cached data

#### Scenario: Post route does not exist
- **WHEN** a visitor opens an unknown, deleted, or confidential Post identifier
- **THEN** the system returns a comparable generic unavailable result that does not reveal whether the object, author, report, or Moderation Case exists
