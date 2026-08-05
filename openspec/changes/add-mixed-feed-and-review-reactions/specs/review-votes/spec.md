## ADDED Requirements

### Requirement: Review Votes judge Review usefulness only
The system SHALL offer one upvote or downvote control on every eligible published Review, SHALL describe it as judging whether the Review is useful, specific, and worth seeing, and SHALL NOT offer Review Votes on Posts, Comments, Profiles, Profile Subject Responses, or withdrawn, limited, or removed Reviews.

#### Scenario: Visitor sees an eligible Review
- **WHEN** an eligible published Review renders in Feed or at its canonical route
- **THEN** the system shows upvote, downvote, current eligible net score, and a literal usefulness explanation without presenting the controls as judgment of the Profile subject

#### Scenario: Visitor sees a Post
- **WHEN** a Post renders beside Reviews
- **THEN** the system shows no Review Vote, Award, Verdict, Like, or repost control

### Requirement: Review Votes are Account-backed protected actions
The system SHALL require an active Account with a verified sign-in contact and current policy eligibility to cast a Review Vote, SHALL preserve a signed-out visitor's intended direction through progressive authentication, and SHALL NOT create a Public Byline or Profile for voting.

#### Scenario: Signed-out visitor upvotes
- **WHEN** a signed-out visitor selects upvote
- **THEN** the system preserves the Review and direction, authenticates at the protected-action boundary, and applies the Vote only after current eligibility succeeds

#### Scenario: Vote policy is unavailable
- **WHEN** authoritative Account, Review, block, or risk policy cannot be evaluated
- **THEN** the system records no Vote or count change and returns a generic retryable failure without exposing hidden state

### Requirement: One Account has one mutable Vote per Review
The system SHALL store at most one current Review Vote per Account and Review, SHALL let the voter atomically change between `up` and `down` or undo the Vote, and SHALL NOT count retries or concurrent requests more than once.

#### Scenario: Voter changes direction
- **WHEN** an Account with an upvote selects downvote
- **THEN** the system replaces the upvote with one downvote atomically and updates the eligible net score by two

#### Scenario: Voter undoes
- **WHEN** an Account removes its current Vote
- **THEN** the system leaves no active Vote for that Account and Review and updates counts and rank input once

#### Scenario: Request is retried
- **WHEN** a client repeats the same idempotent Vote mutation
- **THEN** the system returns the current Vote without creating another count or audit event for the retry

### Requirement: Authors cannot vote on their own Reviews
The system SHALL deny a Review author from voting on their own named or anonymously attributed Review and SHALL determine authorship through restricted identity without exposing an anonymous Account or block relationship.

#### Scenario: Anonymous author attempts self-vote
- **WHEN** the Account behind **Anonymous reviewer** attempts to vote on that Review
- **THEN** the system denies the action with a generic self-interaction message and exposes no private author identifier in public or client payloads

#### Scenario: Block makes interaction ineligible
- **WHEN** current foundation policy prohibits the voter from interacting with the Review because of a Block
- **THEN** the system denies or removes the Vote without identifying block direction or confirming an anonymous author's Account

### Requirement: Public Vote display is net score only
The system SHALL display `eligible upvotes - eligible downvotes` as the public Review Vote score, including zero and negative values, and SHALL keep positive counts, negative counts, voter Accounts, timing, reversals, risk state, and confidence-adjusted ranking values nonpublic.

#### Scenario: Review has three upvotes and five downvotes
- **WHEN** all eight Votes are currently eligible
- **THEN** the public Review shows `-2` and does not expose the upvote rate or underlying `3` and `5` counts

#### Scenario: Public client requests voters
- **WHEN** an unauthorized client requests Vote directions, voter identities, or timing
- **THEN** the system returns none of those fields and does not confirm whether a specific Account voted

### Requirement: Ranking uses confidence-adjusted Vote quality
The system SHALL derive a versioned confidence-adjusted quality feature from eligible Vote directions and volume, SHALL treat insufficient volume as neutral rather than strongly positive or negative, and SHALL NOT rank from raw net score alone.

#### Scenario: New Review receives one upvote
- **WHEN** the Review has not reached the active ranking policy's documented minimum evidence volume
- **THEN** its Vote-quality feature remains neutral and discovery comes from freshness and exploration rather than a one-vote surge

#### Scenario: Upvote rate is stable at useful volume
- **WHEN** enough distinct eligible Accounts have voted without integrity holds
- **THEN** the versioned confidence method may contribute a bounded quality feature while public display remains net score only

### Requirement: Vote eligibility tracks source and Account integrity
The system SHALL exclude a Vote from public counts and ranking when its Review becomes ineligible, its voter Account reaches finalized deletion or an ineligible enforcement state, or scoped integrity review invalidates it, and SHALL restore it only through an authorized reversible outcome.

#### Scenario: Review is withdrawn
- **WHEN** an author withdraws the Review
- **THEN** the system stops accepting Votes and removes its Vote projection and rank contribution from public surfaces

#### Scenario: Coordinated voting is detected
- **WHEN** restricted device, network, timing, reciprocal, or Account-risk signals support a coordinated-manipulation hold
- **THEN** the system excludes affected Votes, recomputes counts and rank, groups safety review, and publishes no accusation or cluster detail

#### Scenario: Enforcement is overturned
- **WHEN** an appeal restores previously invalidated Votes and their source Review remains eligible
- **THEN** the system recomputes the net score and rank input once from current authoritative state without revealing which Accounts were affected

### Requirement: Vote changes create no individual notifications
The system SHALL NOT notify a Review author, Profile claimant, or another Account when an individual Review Vote is created, changed, undone, or invalidated.

#### Scenario: Review receives a downvote
- **WHEN** an eligible Account casts or changes to downvote
- **THEN** public aggregate state may update but no individual Vote notification, voter identity, direction, or timing is delivered
