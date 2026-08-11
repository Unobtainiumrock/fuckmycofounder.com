## ADDED Requirements

### Requirement: Award Credit follows one global weekly period
The system SHALL define each Award period from Monday 00:00 UTC until the next Monday 00:00 UTC, SHALL cap every eligible Account's Award Credit balance at one, and SHALL replace any unused Credit rather than carry or accumulate it across periods.

#### Scenario: Eligible Account does not spend its Credit
- **WHEN** a new weekly period begins
- **THEN** the prior Credit expires and the Account has exactly one current-period Credit rather than two

#### Scenario: Viewer checks refresh time
- **WHEN** an eligible Account views an empty or available Award balance
- **THEN** the system shows the next Monday 00:00 UTC boundary in the viewer's local time with an accessible UTC reference

### Requirement: Award eligibility delays scarcity without delaying signup
The system SHALL make an Account Award-eligible only when it is active, has a verified sign-in contact, is at least seven full days old, has no Award-disqualifying enforcement, and passes current centralized risk policy; SHALL issue the current period's one Credit when the Account first becomes eligible; and SHALL NOT require a Public Byline, Profile, contact import, paid plan, or general onboarding.

#### Scenario: New Account tries to Award
- **WHEN** an otherwise healthy Account is less than seven full days old
- **THEN** the system preserves ordinary browsing and voting, denies the Award literally, and shows when age eligibility can begin without exposing risk thresholds

#### Scenario: Account becomes eligible mid-period
- **WHEN** the Account reaches seven full days and all other eligibility checks pass before the next weekly boundary
- **THEN** the system issues at most one Credit for the remainder of that period

#### Scenario: Risk policy is unavailable
- **WHEN** Award eligibility cannot be authoritatively evaluated
- **THEN** the system fails closed without consuming a Credit, creating an Award, or revealing the hidden check

### Requirement: Spending creates one persistent Review Award
The system SHALL atomically consume one current Award Credit to create one active Review Award on an eligible published Review, SHALL keep that Award active across weekly refreshes while the giver and Review remain eligible, and SHALL allow multiple eligible Accounts to Award the same Review.

#### Scenario: Account gives its Award
- **WHEN** an eligible Account with one Credit confirms an Award on another Account's eligible Review
- **THEN** the system creates one active Award, changes the balance to zero, increments the public Review Award count once, and records the giver privately

#### Scenario: Two requests spend the same Credit
- **WHEN** concurrent Award requests target one or different Reviews in the same period
- **THEN** at most one request creates an Award and every other request returns the current zero-balance state without a partial count

### Requirement: Award uniqueness prevents repeated endorsement
The system SHALL permit at most one active Review Award from one Account to one Review over the Review's lifetime, SHALL prohibit self-Awards for named and anonymous Reviews, and SHALL NOT let an Account buy, transfer, gift, or convert Credits.

#### Scenario: Giver tries to Award the same Review next week
- **WHEN** the Account already has an active Award on that Review and receives a later weekly Credit
- **THEN** the system leaves the existing Award and current Credit unchanged and explains that the Review is already awarded by this Account

#### Scenario: Anonymous author tries to self-Award
- **WHEN** the Account behind **Anonymous reviewer** attempts to Award its own Review
- **THEN** the system denies the action through restricted authorship policy without exposing the private link

#### Scenario: Account attempts to transfer a Credit
- **WHEN** an Account tries to send, sell, purchase, or assign its Credit to an Account or Review outside the Award action
- **THEN** the system provides no such operation and does not change either Account's balance

### Requirement: Retraction has period-bounded Credit effects
The system SHALL let a giver retract its active Award, SHALL restore one Credit only when the Award was both created and retracted in the current weekly period, and SHALL NOT mint a current Credit for retracting an Award from an earlier period.

#### Scenario: Same-period Award is retracted
- **WHEN** a giver retracts the Award before that Award's weekly period ends
- **THEN** the Award becomes inactive, the public count decrements once, and the giver regains one current-period Credit

#### Scenario: Older Award is retracted
- **WHEN** a giver retracts an Award created in a prior weekly period
- **THEN** the Award becomes inactive and count decrements, but the current balance does not increase

#### Scenario: Giver later re-awards the same Review
- **WHEN** a lifetime Review Award from that giver is inactive and the giver attempts to Award the same Review again
- **THEN** the system denies repeated endorsement and leaves the Credit available for another eligible Review

### Requirement: Public Awards expose scarcity without giver identity
The system SHALL show only the eligible active Review Award count and the current viewer's own Awarded state, SHALL keep giver lists and timing nonpublic, and SHALL NOT add streaks, nonuse penalties, Profile totals, or real-person leaderboards.

#### Scenario: Review has Awards
- **WHEN** five eligible Accounts have active Awards on one Review
- **THEN** public surfaces show an Award count of `5` without a giver list or implication that the Profile subject has five endorsements

#### Scenario: Anonymous Review receives an Award
- **WHEN** an eligible Account Awards an anonymously attributed Review
- **THEN** the action and any notification reveal neither the Review author's Account nor a public connection between giver and author

### Requirement: Award lifecycle follows Review and giver eligibility
The system SHALL deactivate an Award when the source Review becomes withdrawn, limited, or removed, the giver Account reaches finalized deletion or an ineligible enforcement state, or integrity review invalidates the Award; SHALL restore it only through authorized reversal; and SHALL apply same-period Credit restoration rules to deactivation.

#### Scenario: Awarded Review is removed in the current period
- **WHEN** an Award created this period becomes inactive because the Review is removed
- **THEN** the public count decrements and the eligible giver regains at most one current-period Credit

#### Scenario: Review is removed after the Award's period
- **WHEN** the same source change occurs in a later period
- **THEN** the public count decrements but no extra current Credit is created

#### Scenario: Award farm is detected
- **WHEN** device, network, timing, reciprocity, or Account-risk evidence supports coordinated Award manipulation
- **THEN** the system holds or deactivates affected Awards, recomputes counts and rank, routes notices and appeals, and publishes no fraud score or cluster identity

### Requirement: Award activation emits one privacy-safe event
The system SHALL emit an idempotent safe event when a Review Award becomes active and SHALL NOT include the giver's private Account identity, block relationships, risk state, or anonymous Review-author linkage in a delivery payload.

#### Scenario: Eligible Award becomes active
- **WHEN** the reaction ledger commits the Credit spend and Review Award
- **THEN** it emits one canonical Review-target event that notification policy may batch for the eligible Review author

#### Scenario: Award transaction rolls back
- **WHEN** the Credit and Award cannot commit atomically
- **THEN** the system emits no activation event and preserves the prior balance and count
