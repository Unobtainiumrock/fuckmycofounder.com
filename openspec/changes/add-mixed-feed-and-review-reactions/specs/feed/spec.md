## ADDED Requirements

### Requirement: Public Feed browsing requires no Account
The system SHALL let signed-out and signed-in visitors browse **Trending** and **Latest** Feed views through **All**, **Reviews**, and **Posts** filters and SHALL NOT require onboarding or present a learned or interest-based **For you** view at launch.

#### Scenario: Signed-out visitor opens Trending
- **WHEN** a signed-out visitor opens the default public Feed
- **THEN** the system renders eligible public Reviews and Posts without an Account, notification prompt, or personalized identity state

#### Scenario: Visitor filters to Reviews
- **WHEN** any visitor selects **Reviews**
- **THEN** every returned item is a Review and the filter does not silently include Posts, Comments, Profiles, or Profile Subject Responses

### Requirement: Feed items are projections of canonical objects
The system SHALL represent each Feed item as a current eligible projection of one canonical published Review or Post, SHALL open that source object's canonical route, and SHALL NOT create an independent Feed-content object or rank Comments and people as items.

#### Scenario: Eligible Review is hydrated
- **WHEN** a `published` Review has an accepted Relationship Claim, public Profile, eligible current revision, safe attribution projection, and policy approval
- **THEN** the Feed may show its Profile subject, relationship context, excerpt, eligible Exhibit thumbnails, Assessment signal, Run it back answer, Review Vote net score, Award count, Comment count, and publication time

#### Scenario: Eligible Post is hydrated
- **WHEN** a `published` Post has an eligible current revision, Public Byline projection, and policy approval
- **THEN** the Feed may show its named byline, body excerpt, eligible media, Comment count, sharing hook, and publication time without Review context or reactions

#### Scenario: Source projection is unavailable
- **WHEN** the system cannot authorize the current source, attribution, Profile, Relationship Claim, or policy projection
- **THEN** it omits the candidate and exposes no cached body, hidden state, anonymous identity, block direction, or moderation detail

### Requirement: Latest is stable reverse chronology
The system SHALL order Latest by original publication time descending with stable opaque identifier as a tie-breaker, SHALL NOT reset that position for an edit, reaction, Comment, or moderation restoration, and SHALL paginate from an opaque snapshot cursor.

#### Scenario: Published object is edited
- **WHEN** an approved revision replaces the public Review or Post revision
- **THEN** Latest renders the approved current revision at the object's original publication position with an eligible `edited` indicator

#### Scenario: Two objects share a publication time
- **WHEN** eligible objects have the same original publication time
- **THEN** their stable identifiers determine a repeatable order across page requests

#### Scenario: New object publishes between pages
- **WHEN** a visitor requests the next page from an existing Latest cursor after another object publishes
- **THEN** the new object does not shift or duplicate the cursor's snapshot and appears when the visitor refreshes into a new snapshot

### Requirement: Trending uses an inspectable launch policy
The system SHALL rank Trending through a versioned deterministic pipeline that gathers eligible candidates, hydrates approved signal classes, scores them, applies safety and composition rules, and records a restricted explanation for each served position.

#### Scenario: Review has few early votes
- **WHEN** a Review has insufficient eligible Vote volume for a confidence-adjusted quality estimate
- **THEN** raw net score does not create a large Trending boost and the exploration pool supplies its bounded discovery opportunity

#### Scenario: Public methodology is viewed
- **WHEN** a visitor opens the Trending methodology
- **THEN** the system explains candidate pools, signal families, time decay, caps, diversity, exploration, and the current policy version without disclosing private fraud thresholds or viewer data

#### Scenario: Ranking policy changes
- **WHEN** authorized operators activate a new score or composition version
- **THEN** new Feed snapshots record that version and old snapshots never mix scores from two versions

### Requirement: Trending signals reward useful reading rather than outrage
The system SHALL bound and time-decay freshness, confidence-adjusted Review Vote quality, Review Awards, meaningful discussion, expanded reading, and relationship-evidence context; SHALL apply hides, reversals, confirmed safety outcomes, and suspected coordination as restricted negative integrity inputs; and SHALL NOT positively rank raw views, raw Comments, raw reports, sentiment, negativity, media presence, Profile Aggregate values, or Profile popularity.

#### Scenario: Review receives a Comment pile-on
- **WHEN** a burst of short, duplicative, or coordinated Comments increases raw activity without meaningful discussion
- **THEN** the capped discussion feature does not turn that volume into proportional Trending rank

#### Scenario: Review contains an image
- **WHEN** two otherwise equal Reviews differ only because one has an Exhibit
- **THEN** media presence alone does not increase the imaged Review's rank

#### Scenario: Reports arrive in a burst
- **WHEN** Accounts file many Reports but no scoped safety or integrity decision has validated the concern
- **THEN** raw Report count does not directly lower rank or visibility and intake follows the foundation Moderation Case contract

### Requirement: Trending All preserves object and source diversity
The system SHALL, when enough eligible alternatives exist, reserve at least half of the first 20 Trending All positions for Reviews, include at least one exploration item per ten positions, allow no more than three consecutive items of one type, and allow no more than two Reviews of one Profile or two objects from one author Account in any ten positions.

#### Scenario: Posts dominate raw scores
- **WHEN** eligible Posts would occupy more than half of the first 20 positions while enough eligible Reviews exist
- **THEN** the system mixes Reviews into at least ten of those positions without changing either object's underlying score or type

#### Scenario: Anonymous author has several candidates
- **WHEN** one Account has authored multiple anonymously attributed Reviews
- **THEN** the system may apply the author-diversity rule through restricted identity while exposing no public continuity or author reason

#### Scenario: Candidate supply is sparse
- **WHEN** the available eligible candidates cannot satisfy one or more composition constraints
- **THEN** the system serves the honest smaller or less-diverse set and records which rule lacked alternatives rather than fabricating content

### Requirement: Viewer controls are transparent and private
The system SHALL apply current Account Blocks and explicit object hides for signed-in viewers, SHALL let a viewer undo a hide, SHALL use recent-seen state only for fatigue rather than public scoring, and SHALL NOT reveal block direction, hidden actors, or another Account's controls.

#### Scenario: Viewer hides an item
- **WHEN** a signed-in viewer selects **Hide this item**
- **THEN** the system removes that canonical object from their Feed, offers an undo, and does not change public visibility or tell the author

#### Scenario: Block affects targeted Feed discovery
- **WHEN** a signed-in viewer and a named source Account have a foundation Block
- **THEN** the system omits prohibited targeted Feed presentation and interaction using generic filtering without identifying who blocked whom

#### Scenario: Visitor is logged out
- **WHEN** the otherwise public object is requested in a logged-out Feed
- **THEN** Account-specific Blocks and hides are not described as global takedowns and ordinary public eligibility governs display

### Requirement: Feed lifecycle changes fail safe
The system SHALL recheck source and safety eligibility before render, SHALL immediately exclude withdrawn, limited, removed, deleted, revoked-Claim, nonpublic-Profile, or policy-ineligible objects, and SHALL NOT serve a stale projection after a subtractive state change.

#### Scenario: Review is removed after page selection
- **WHEN** the Review becomes ineligible before the selected page renders
- **THEN** the system omits it, may return a shorter page, and exposes no prior excerpt or removal reason

#### Scenario: Review Vote or Award changes
- **WHEN** an eligible Review's public net score or Award count changes
- **THEN** the canonical count projection updates without creating a duplicate Feed item, changing Latest publication time, or bypassing Trending's versioned scoring refresh

#### Scenario: Feed policy is unavailable
- **WHEN** current eligibility or ranking policy cannot be evaluated and no authorized current-version snapshot is available
- **THEN** the system shows **Feed temporarily unavailable** with retry and does not present stale or fabricated items as current

### Requirement: Feed pagination is duplicate-safe and accessible
The system SHALL use opaque, expiring cursors that bind view, filter, policy version, safety/source version, and snapshot; SHALL prevent duplicate items within a snapshot; and SHALL expose literal empty, end, expired, loading, and unavailable states with keyboard- and assistive-technology-readable object types.

#### Scenario: Cursor is reused with another filter
- **WHEN** a client submits a Posts cursor to a Reviews or All request
- **THEN** the system rejects it as expired or invalid without leaking candidate counts or hidden objects

#### Scenario: Filter has no eligible items
- **WHEN** a valid Feed query completes with zero eligible objects
- **THEN** the system shows a genuine filter-specific empty state and offers Profile search or another Feed filter without fabricating engagement

#### Scenario: Cursor expires
- **WHEN** a visitor requests another page after the cursor's bounded lifetime or policy version ends
- **THEN** the system offers a fresh first page and does not silently splice a new ordering into the old snapshot
