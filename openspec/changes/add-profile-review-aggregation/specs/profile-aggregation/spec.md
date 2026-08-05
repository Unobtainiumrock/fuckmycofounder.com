## ADDED Requirements

### Requirement: A Profile Aggregate is derived from currently eligible Reviews
The system SHALL derive a Profile Aggregate without changing Profile identity or source Reviews and SHALL include only the current approved revision of a `published` Review whose Profile is public, Relationship Claim is `accepted`, Assessment version is supported, and trust-and-safety policy marks the input eligible.

#### Scenario: Eligible Review contributes
- **WHEN** a Review and all authoritative dependencies are currently eligible
- **THEN** its current approved Assessment contributes exactly once to the canonical Profile Aggregate under the active aggregation-policy version

#### Scenario: Source state is not eligible
- **WHEN** a Review is submitted, changes required, withdrawn, limited, removed, held for integrity review, attached to a revoked Claim, or attached to a nonpublic Profile
- **THEN** no value from that source contributes to a public aggregate or denominator

### Requirement: One Account cannot dominate through repeat engagements
The system SHALL count at most one current Assessment per Account and Profile in each aggregate and SHALL use the most recently approved eligible Review when that Account has multiple materially distinct engagements.

#### Scenario: Later engagement also has a Review
- **WHEN** two eligible Reviews for one Profile belong to the same Account
- **THEN** only the most recently approved eligible Assessment contributes while both Reviews retain their independent public histories

#### Scenario: Newer Review becomes ineligible
- **WHEN** the contributing newer Review is withdrawn or limited and an older Review remains otherwise eligible
- **THEN** the policy recomputes from authoritative state and uses the older Review only if the active policy explicitly permits fallback without exposing the transition or author

### Requirement: Every aggregate field clears its own five-reviewer threshold
The system SHALL require five distinct eligible reviewer Accounts for every displayed capability field, Run it back distribution, relationship-group breakout, and verification-state breakout and SHALL treat **Not enough exposure** as a non-observation rather than a score, zero, or midpoint.

#### Scenario: Profile has five Reviews but four Domain Expertise answers
- **WHEN** one eligible reviewer selected **Not enough exposure** for Domain Expertise
- **THEN** the system withholds that field as **Not enough exposure across reviews** while independently displaying any other field with five eligible answers

#### Scenario: Field reaches five answers
- **WHEN** a fifth distinct eligible reviewer supplies an observed answer
- **THEN** the system releases that field under all relationship, privacy, integrity, and source-version rules

### Requirement: Low volume is described as evidence coverage, not confidence
The system SHALL show each released field's eligible answer count and coverage against the eligible reviewer base, SHALL label five through nine answers **Early signal**, and SHALL describe results as what these reviewers reported rather than an objective trait or representative estimate.

#### Scenario: Six eligible answers release
- **WHEN** a field has six eligible answers
- **THEN** it displays `6` as the field denominator, its coverage against eligible reviewers, **Early signal**, and a methodology link explaining self-selection

#### Scenario: Viewer seeks a confidence claim
- **WHEN** a public surface presents a Profile Aggregate
- **THEN** it does not call the disclosure floor statistically confident, representative, predictive, or universally true

### Requirement: Capability summaries preserve ordinal meaning
The system SHALL show the five canonical response-position distribution for LARP, Domain Expertise, On Time, Taste, GTM, and Charisma when each field clears its threshold; SHALL show a categorical median only when the relationship evidence also clears the concentration rules; SHALL retain **Legit ↔ LARP** direction everywhere; and SHALL NOT publish a decimal mean, star rating, sum, percentile, cross-Profile comparison, or universal Founder Score.

#### Scenario: Eligible LARP answers display
- **WHEN** the LARP field clears eligibility and context rules
- **THEN** the system displays all five canonical positions, eligible denominator, categorical median, and visible **Legit ↔ LARP** anchors without combining LARP with another metric

#### Scenario: Distribution is polarized
- **WHEN** an eligible field has responses concentrated at opposite endpoints
- **THEN** the full distribution remains visible so its categorical median cannot be presented as consensus

#### Scenario: Even denominator has two middle categories
- **WHEN** an eligible non-concentrated field has an even answer count whose two middle answers occupy different response positions
- **THEN** the system shows the categorical median as that bounded two-category interval and does not average their numeric positions

### Requirement: Run it back remains its own categorical distribution
The system SHALL show Run it back using exactly **Absolutely**, **Maybe, with better paperwork**, and **Fuck no** with its own eligible denominator and SHALL NOT derive it from or combine it with capability fields.

#### Scenario: Capability pattern and verdict disagree
- **WHEN** eligible capability answers are favorable but Run it back answers are mixed or negative
- **THEN** the system preserves the independent three-category Run it back distribution without reconciling the two into one result

### Requirement: Relationship mix is visible without hidden reweighting
The system SHALL group public aggregate context as cofounders/partners, reporting relationships, peers/teammates, investor/advisor relationships, and clients/vendors/external partners; SHALL NOT invent equal weights across groups; and SHALL mark a field **Concentrated perspective** and withhold its categorical median when fewer than two groups contribute, the second-largest group has fewer than two reviewers, or one group supplies more than 80 percent of answers.

#### Scenario: Three peers and two investor relationships contribute
- **WHEN** five eligible answers span those two coarse groups
- **THEN** the system shows the cross-relationship distribution and median with the relationship mix

#### Scenario: One relationship group dominates
- **WHEN** one coarse group supplies more than 80 percent of an otherwise eligible field
- **THEN** the system shows the distribution, labels it **Concentrated perspective**, names the dominant coarse context when privacy rules permit, and withholds the cross-relationship median

#### Scenario: Relationship-specific view is requested
- **WHEN** a permitted coarse group has fewer than five distinct eligible reviewers
- **THEN** the system omits that breakout rather than showing a zero, partial bar, or inferred value

### Requirement: Verification context never becomes truth weighting
The system SHALL keep `Self-attested` and `Relationship verified` visible as relationship-evidence states, SHALL count their eligible answers equally in an overall distribution, and SHALL explain that Relationship Verification does not verify testimony or Assessment truth.

#### Scenario: Both evidence states contribute
- **WHEN** an overall field contains eligible self-attested and relationship-verified Reviews
- **THEN** the system identifies the included evidence states under safe-cell rules without increasing a verified answer's weight

#### Scenario: Verification-specific cell is sparse
- **WHEN** either requested evidence-state breakout has fewer than five distinct eligible reviewers or a neighboring total would reveal that sparse cell
- **THEN** the system withholds exact counts and the breakout under primary and complementary suppression

### Requirement: Named and anonymous Reviews have aggregate parity
The system SHALL apply identical eligibility and weight to named and publicly anonymous Reviews and SHALL NOT expose attribution-mode counts, filters, comparisons, stable pseudonyms, Account identifiers, or aggregate output that confirms an anonymous author's identity.

#### Scenario: Reviewer changes named attribution to anonymous
- **WHEN** an otherwise eligible named Review permanently becomes **Anonymous reviewer** without changing its approved Assessment
- **THEN** its aggregate contribution remains unchanged and no public aggregate event identifies which value changed attribution

#### Scenario: Viewer attempts attribution filtering
- **WHEN** a public client requests named-only, anonymous-only, or Account-linked aggregate output
- **THEN** the system denies or ignores the unsupported dimension and returns no private join key or differential count

### Requirement: Sparse and overlapping cells resist subtraction
The system SHALL apply a minimum cell size of five plus complementary suppression to every Profile page, public interface, metadata payload, export, notification, historical view, and later dependent public surface, and SHALL allow only predefined single-dimension breakdowns.

#### Scenario: Total would reveal a suppressed remainder
- **WHEN** one displayed relationship or verification count and the overall total would reveal another cell below five by subtraction
- **THEN** the system withholds an additional exact count, honestly pools categories, or omits the breakdown so the remainder cannot be calculated

#### Scenario: Viewer combines dimensions
- **WHEN** a request combines relationship group with verification state, attribution mode, year, organization, project, or another narrowing dimension
- **THEN** the system returns no combined aggregate even if each dimension would independently clear its threshold

### Requirement: Source changes invalidate aggregates consistently
The system SHALL version aggregation policy, Assessment scale, and the authoritative source set and SHALL advance or invalidate the source-set version on publication, approved revision, withdrawal, limitation, removal, Claim acceptance, revocation or evidence-state change, integrity hold, Profile merge, Profile removal, or restoration.

#### Scenario: Review is withdrawn
- **WHEN** an author withdraws a contributing Review
- **THEN** the system invalidates its contribution before the withdrawal is publicly observable and recomputes every affected denominator, distribution, median, and breakout

#### Scenario: Profile is merged
- **WHEN** source and canonical Profiles merge
- **THEN** the system recomputes against the canonical Profile, deduplicates shared Accounts, preserves no source-Profile comparison, and does not briefly double-count Reviews

### Requirement: Cached and unavailable summaries fail closed
The system SHALL serve a cached Profile Aggregate only when its policy, Assessment, and source-set versions match authoritative state and SHALL otherwise show a literal updating, temporarily unavailable, removed, or not-enough-data state without stale values or private failure details.

#### Scenario: Cache trails a removal
- **WHEN** a contributing Review, Claim, or Profile is limited or removed after a cache was produced
- **THEN** the system stops serving that projection immediately and does not trade safety correctness for cache availability

#### Scenario: Aggregation processing fails
- **WHEN** authoritative eligibility or recomputation is unavailable
- **THEN** eligible individual Reviews remain accessible when their own state permits, while the Profile summary says **Summary temporarily unavailable** and exposes no partial result

### Requirement: Integrity controls do not become public accusations
The system SHALL apply duplicate, coordinated-activity, enforcement, and integrity eligibility before aggregation and SHALL NOT reveal fraud scores, device or network links, identity evidence, cluster membership, or the reason a Review did not contribute.

#### Scenario: Coordinated Reviews target a Profile
- **WHEN** restricted signals indicate likely Sybil, duplicate, retaliatory, or coordinated activity
- **THEN** the system withholds affected inputs, recomputes safely, and routes review through trust-and-safety without publishing an accusation or changing results from raw report count alone

### Requirement: Removed and empty Profiles do not leak prior summaries
The system SHALL return literal states for no Reviews, insufficient reviews, metric-level insufficient exposure, removed Profiles, and unavailable policy while preserving public individual Review access only when each source object's own state permits.

#### Scenario: Profile has no eligible Reviews
- **WHEN** a public Profile has zero eligible Reviews
- **THEN** the system shows **No eligible reviews yet** and no empty histogram, zero score, or prior aggregate

#### Scenario: Profile is removed
- **WHEN** the canonical Profile becomes nonpublic
- **THEN** the system withholds the Profile Aggregate, cached values, metadata, and derivative outputs under the same generic Profile availability contract
