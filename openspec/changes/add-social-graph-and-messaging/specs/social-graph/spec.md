## ADDED Requirements

### Requirement: Follow is one-way and targets a canonical Profile
The system SHALL let an active Account Follow or unfollow any published canonical Profile, including an unclaimed Profile, and SHALL NOT create a mutual Connection, Relationship Claim, message permission, endorsement, or reciprocal Follow.

#### Scenario: Account follows an unclaimed Profile
- **WHEN** an active Account follows a published unclaimed Profile
- **THEN** the system records one private Account-to-Profile Follow and does not create an Account, Profile Claim, Connection, or message action for the Profile subject

#### Scenario: Followed person does not follow back
- **WHEN** the followed Profile's claimant or any other Account takes no action
- **THEN** the Follow remains valid without implying mutuality or changing either Account's messaging eligibility

### Requirement: Public Byline Follow resolves only through an enabled verified Profile link
The system SHALL expose Follow from named content only when the current Public Byline explicitly links to a current verified Profile Claim and SHALL resolve the action to that canonical Profile rather than to the Public Byline or Account.

#### Scenario: Named Post author has an enabled Profile link
- **WHEN** a reader selects Follow from an eligible Post whose Public Byline links to a verified claimed Profile
- **THEN** the system follows the canonical Profile and presents the same state on the Profile and linked named surfaces

#### Scenario: Named author has no enabled Profile link
- **WHEN** a Public Byline is unlinked, its claim is absent or revoked, or its owner did not enable the link
- **THEN** the system offers no Follow target on that byline and does not create, discover, or infer a Profile from Account data

### Requirement: The launch graph is private and non-competitive
The system SHALL expose each Account's following list and Follow state only to that Account, SHALL show no public follower or following list or count, and SHALL NOT use graph size as a public credibility field, Profile Aggregate, Review weight, or people ranking.

#### Scenario: Profile claimant inspects followers
- **WHEN** a verified Profile claimant requests the Accounts or count following their Profile
- **THEN** the system returns no follower list or count and exposes only claimant capabilities governed by other specs

#### Scenario: Public client requests graph size
- **WHEN** a public client requests follower, following, mutual, or connection counts for an Account, Public Byline, or Profile
- **THEN** the system returns no graph data and does not substitute a rounded, bucketed, or inferred count

### Requirement: Following activity is current and safely scoped
The system SHALL make an Account eligible to receive its opt-in followed-Profile activity only for the current public Profile, newly published Reviews of it, and Posts whose Public Byline currently links to its verified claimant, without changing the launch Feed ranker or exposing private claim state.

#### Scenario: Followed Profile receives a Review
- **WHEN** an eligible Review publishes on a followed Profile and the follower enabled followed-Profile activity
- **THEN** the system emits a recipient-private activity event using only the Review's current public projection

#### Scenario: Unlinked author publishes a Post
- **WHEN** a Post author has no current enabled verified Profile link
- **THEN** that Post creates no followed-Profile event even if an Account privately suspects which Profile represents the author

### Requirement: Profile lifecycle preserves canonical Follow intent
The system SHALL deduplicate Follows onto the surviving Profile after a Profile Merge, SHALL preserve a Follow across claim verification or revocation, and SHALL remove it from active following state when the canonical Profile is removed.

#### Scenario: Two followed Profiles merge
- **WHEN** duplicate followed Profiles merge into one canonical Profile
- **THEN** the Account has exactly one Follow on the survivor without receiving duplicate activity or merge evidence

#### Scenario: Claim is revoked
- **WHEN** the followed Profile's verified Profile Claim becomes revoked
- **THEN** the Follow remains attached to the independent Profile while owner-linked Post activity and message actions stop

#### Scenario: Profile is removed
- **WHEN** a followed canonical Profile becomes removed
- **THEN** the system removes it from active following, suppresses future activity, and shows only a generic unavailable state without the removal reason

### Requirement: Blocks sever social edges without resurrection
The system SHALL apply the foundation Block before Follow reads, writes, activity, and targeted discovery; SHALL remove an existing Follow when the Block applies between the follower and current verified Profile claimant; and SHALL NOT restore the Follow automatically after unblock or claim change.

#### Scenario: Follower blocks the current claimant
- **WHEN** either Account creates a Block after a Follow exists on the claimed Profile
- **THEN** the system removes the Follow, suppresses activity and direct actions, and exposes no notification or block direction

#### Scenario: Block is later removed
- **WHEN** the blocking Account unblocks the other Account
- **THEN** no Follow, request, conversation permission, or activity subscription returns until a new explicit eligible action

### Requirement: Anonymous activity creates no graph path
The system SHALL NOT offer, recommend, create, or infer a Follow target from Anonymous Attribution, a `Review author` Comment, a Review Vote, a Review Award, a private notification recipient, or the restricted Account behind any of those actions.

#### Scenario: Reader opens an anonymous Review author's Comment
- **WHEN** the anonymous Review author participates as `Review author`
- **THEN** the Comment exposes no Follow control, Profile or Public Byline candidate, mutual indicator, message action, or stable graph identifier

#### Scenario: Hidden author follows a Profile
- **WHEN** the Account behind an anonymous Review also follows the reviewed Profile or another Profile
- **THEN** no public, claimant, analytics, notification, or suggestion surface reveals or confirms that Follow or the shared Account

### Requirement: Social graph mutations resist enumeration and automation
The system SHALL require centralized policy approval for Follow mutations, apply bounded Account and target churn controls, use idempotent pair operations, and return generic blocked, limited, removed, invalid, and temporarily unavailable outcomes without revealing hidden Accounts or claim state.

#### Scenario: Client repeats the same Follow
- **WHEN** an Account retries an already successful Follow because the receipt was lost
- **THEN** the system returns the same active state without creating duplicate edges or activity

#### Scenario: Policy evaluation is unavailable
- **WHEN** Follow or following-list authorization cannot be evaluated authoritatively
- **THEN** the system fails closed for mutation and private-list access while leaving independently public Profile browsing governed by the Profile contract

### Requirement: Following has literal empty and deletion states
The system SHALL provide Account-private loading, empty, end, invalid-cursor, removed-Profile, and unavailable states and SHALL delete active Follows when the follower's Account deletion finalizes subject only to minimized safety records and legal holds.

#### Scenario: Account follows nobody
- **WHEN** an authenticated Account opens its empty following list
- **THEN** the system shows a genuine empty state without fabricated suggestions, public counts, contact import, or forced onboarding

#### Scenario: Follower Account is deleted
- **WHEN** Account deletion finalizes
- **THEN** its active Follow edges and activity subscriptions are deleted without changing the followed Profiles or exposing the former graph
