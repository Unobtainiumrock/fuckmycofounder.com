## ADDED Requirements

### Requirement: Relationship Claims are Account-backed and first-hand
The system SHALL require an active Account to submit a Relationship Claim about a published Profile, SHALL require the reviewer to attest that they directly worked with the Profile subject, and SHALL reject self-review and hearsay-only claims.

#### Scenario: Signed-out visitor starts a Review
- **WHEN** a signed-out visitor selects a published Profile and begins relationship context
- **THEN** the system preserves the local draft, authenticates the visitor at save or submission, and returns them to the claim without creating a Public Byline or Profile

#### Scenario: Account reviews its own claimed Profile
- **WHEN** an Account is verified as the subject of the selected Profile or private identity controls establish self-review
- **THEN** the system denies the Relationship Claim without revealing hidden identity-linking or risk data

#### Scenario: Reviewer knows the subject only indirectly
- **WHEN** the reviewer cannot attest to direct work and supplies only reputation, observation, friendship, or another person's account
- **THEN** the system does not accept the Relationship Claim or permit a Review submission

### Requirement: Relationship type is directional and canonical
The system SHALL require exactly one current directional relationship type from the launch taxonomy and SHALL explain the direction in a complete sentence.

#### Scenario: Reviewer selects the launch taxonomy
- **WHEN** the reviewer states how they worked with the Profile subject
- **THEN** the system records one of `We were cofounders or business partners`, `I reported to this person`, `This person reported to me`, `We were peers or teammates`, `I invested in or advised this person`, `This person invested in or advised me`, or `We worked together as clients, vendors, or external partners`

#### Scenario: Relationship direction is missing
- **WHEN** the selected context does not establish the reviewer's direction relative to the Profile subject
- **THEN** the system keeps the claim incomplete and asks a literal directional question instead of inferring a role

### Requirement: Relationship Claims contain bounded temporal context
The system SHALL collect an approximate start, end or ongoing state, and duration for the direct work; SHALL reject impossible or materially contradictory periods; and SHALL derive a coarse public duration without publishing exact dates by default.

#### Scenario: Relationship is ongoing
- **WHEN** the reviewer marks the engagement ongoing and supplies a plausible start
- **THEN** the system records an open-ended period and derives the applicable public duration bucket

#### Scenario: Dates are contradictory
- **WHEN** the end precedes the start, the period is in the future, or the duration materially conflicts with the dates
- **THEN** the system does not submit the claim and identifies the field that must be corrected

### Requirement: Claim acceptance precedes Review publication
The system SHALL represent a Relationship Claim as `draft`, `submitted`, `accepted`, `rejected`, or `revoked`, SHALL require launch moderation and policy acceptance, and SHALL permit Review publication only while the claim is `accepted`.

#### Scenario: Complete self-attested claim passes review
- **WHEN** an Account submits a plausible, first-hand, nonduplicative claim that passes policy review without independent verification evidence
- **THEN** the system may mark it `accepted` with public evidence state `Self-attested` and allow its linked Review to continue through moderation

#### Scenario: Claim remains under review
- **WHEN** claim review has not reached an accepted outcome
- **THEN** the system keeps the linked Review nonpublic and shows the author a plain `under review` status without showing private risk rules

#### Scenario: Accepted claim is revoked
- **WHEN** later evidence establishes impersonation, fabrication, duplicate evasion, or no qualifying first-hand relationship
- **THEN** the system marks the claim `revoked`, immediately limits its published Review pending scoped enforcement, records the transition, and gives the affected Account a reason and appeal path

### Requirement: Verification is distinct from acceptance and Review truth
The system SHALL publish only `Self-attested` or `Relationship verified` as the evidence state, SHALL assign `Relationship verified` only after independent support establishes the people, direction, and approximate period, and SHALL NOT describe either state as verification of the Review's testimony or assessment.

#### Scenario: Independent evidence is sufficient
- **WHEN** authorized review confirms the relationship through mutual confirmation, an authoritative public professional record, or minimized private professional records that support both people, direction, and period
- **THEN** the system may mark the accepted claim `Relationship verified` while retaining only the derived public state and minimum decision record

#### Scenario: Surface attributes are the only support
- **WHEN** the reviewer supplies only a shared email domain, matching name, image, contact-list edge, social follow, or the subject's silence
- **THEN** the system does not grant `Relationship verified` and does not imply that acceptance is proof

#### Scenario: Subject refuses confirmation
- **WHEN** a Profile subject declines or ignores an optional relationship confirmation
- **THEN** the system neither verifies from silence nor gives the subject a veto over an otherwise eligible self-attested claim

#### Scenario: Reviewer intends anonymous publication
- **WHEN** a Relationship Claim supports a Review intended for anonymous publication
- **THEN** the system does not ask the Profile subject to confirm it or send a timing signal that could reveal the author and instead offers non-subject evidence review

### Requirement: Relationship evidence is optional, minimized, and private
The system SHALL allow optional private evidence for verification, request only fields needed to establish the professional relationship, provide redaction guidance, restrict evidence to authorized roles, and SHALL NOT publish the evidence, method, organization, project, exact dates, or Account linkage.

#### Scenario: Evidence contains unnecessary sensitive data
- **WHEN** a document includes private contact, government identifier, financial account, health, precise location, unrelated third-party, ownership-percentage, or confidential business data not needed for verification
- **THEN** the system requires redaction or rejects the upload without placing the sensitive data in public output or ordinary logs

#### Scenario: Public Review requests relationship context
- **WHEN** an accepted Relationship Claim is rendered with its Review
- **THEN** the system exposes only the canonical directional label, coarse duration, optional moderator-approved coarse year range, and `Self-attested` or `Relationship verified`

#### Scenario: Raw evidence reaches expiry
- **WHEN** 90 days have passed after the final verification decision with no active appeal or legal hold
- **THEN** the system deletes the raw evidence, retains only the minimum restricted decision record and derived state, and requires fresh evidence for later re-verification

### Requirement: One continuous relationship produces one active Review
The system SHALL permit at most one active Review for one Account, Profile, and continuous or overlapping relationship period, SHALL treat role changes within that period as updates, and SHALL route suspected relabeling or date manipulation to abuse review.

#### Scenario: Reviewer submits the same engagement twice
- **WHEN** an Account submits another claim for the same Profile with overlapping dates or materially the same work
- **THEN** the system opens the existing Review for revision and does not create a second active Review

#### Scenario: Role changes during continuous work
- **WHEN** a peer later reports to the Profile subject without a material break in the engagement
- **THEN** the system updates the existing claim's contextual history and Review rather than treating the new direction as another vote

#### Scenario: People work together again later
- **WHEN** the reviewer submits a non-overlapping later engagement and moderation establishes that it is materially distinct rather than duplicate or enforcement evasion
- **THEN** the system may accept a separate Relationship Claim and Review while privately retaining the shared Account-to-Profile history for abuse controls

### Requirement: Claim policy handles blocks, restricted Profiles, and failures safely
The system SHALL evaluate Relationship Claim creation and publication through the foundation policy interface and Profile lifecycle, SHALL preserve compliant public Reviews independently from later Blocks, and SHALL fail closed for mutations when authoritative policy or Profile state is unavailable.

#### Scenario: Block exists before submission
- **WHEN** the reviewer and a claimed Profile owner have an Account Block
- **THEN** the system denies the new targeted Review action with a generic safe outcome and does not reveal block direction or anonymous-author identity

#### Scenario: Block occurs after publication
- **WHEN** either Account blocks the other after an otherwise compliant Review is published
- **THEN** the system removes direct interaction and targeted discovery while applying the Review's independent public visibility state without revealing which Account blocked

#### Scenario: Profile is merged
- **WHEN** the Profile registry merges the subject into a canonical Profile
- **THEN** the system rebinds the Relationship Claim to the canonical opaque identifier without changing its author, type, period, evidence state, or audit history

#### Scenario: Profile is removed or policy is unavailable
- **WHEN** the subject Profile is removed or the system cannot obtain authoritative Profile or policy state for submission
- **THEN** the system withholds new acceptance and Review publication, preserves a safe retry or case path, and does not expose the Profile's removal reason or hidden policy state
