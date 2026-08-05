## ADDED Requirements

### Requirement: Every protected action passes centralized policy evaluation
The system SHALL evaluate a protected action using the acting Account state, action, target, block state, capability eligibility, and current risk controls before committing it.

#### Scenario: Action is allowed
- **WHEN** an authenticated Account meets the action's Account, block, capability, and risk conditions
- **THEN** the system commits the action and records the required audit or abuse-prevention signal

#### Scenario: Policy evaluation is unavailable
- **WHEN** the system cannot obtain an authoritative policy decision for a safety-sensitive action
- **THEN** it fails closed, preserves a safe retry path, and does not guess from cached client state

#### Scenario: Action is denied by hidden context
- **WHEN** a block direction, risk signal, or another private rule denies an action
- **THEN** the system returns a literal safe outcome without exposing the hidden Account, reporter, block direction, threshold, or risk rule

### Requirement: Profile Claims use scoped verification
The system SHALL represent a Profile Claim as `pending`, `verified`, `rejected`, or `revoked`, and SHALL grant Profile-owner capabilities or a public claimed state only while it is `verified`.

#### Scenario: Claimant submits sufficient proof
- **WHEN** verification confirms that an active Account with a verified contact and recent reauthentication controls an authoritative identity associated with the Profile subject or has passed human evidence review
- **THEN** the system marks the Profile Claim verified and exposes only the scoped claimed state publicly

#### Scenario: Claimant provides only a matching surface attribute
- **WHEN** a claim relies only on a matching name, email domain, or Profile photo
- **THEN** the system does not verify the Profile Claim and explains the next private proof or review path

### Requirement: Active Profile Claim ownership is exclusive
The system SHALL permit at most one verified Profile Claim per Account and at most one verified Profile Claim per Profile, without treating a suspected duplicate Profile as a second ownership grant.

#### Scenario: Profile already has a verified claimant
- **WHEN** another Account submits a claim for that Profile
- **THEN** the system creates a confidential challenge or dispute path and does not reveal the existing claimant's private evidence

#### Scenario: Claimant attempts a second Profile Claim
- **WHEN** an Account with a verified Profile Claim attempts to verify another Profile
- **THEN** the system pauses verification and routes suspected duplicate or transfer handling to the Profile correction and merge flow

### Requirement: Profile Claim evidence is private and purpose-limited
The system SHALL restrict raw Profile Claim evidence to authorized verification and safety roles, use only a derived state in public clients, and delete raw evidence within 90 days of the final decision unless an active appeal or recorded legal hold applies.

#### Scenario: Public Profile renders claimed status
- **WHEN** a Profile has a verified Profile Claim
- **THEN** the public response shows only that it is claimed and any explicitly enabled owner control, not the proof method, contact, document, reviewer, or Account risk data

#### Scenario: Evidence reaches its expiry
- **WHEN** 90 days have passed since a final claim decision with no active appeal or legal hold
- **THEN** the system deletes raw evidence, retains only the minimum audit fact and derived state, and requires fresh proof for a later high-risk dispute

### Requirement: Profile Claim decisions are reviewable and reversible
The system SHALL notify the claimant of verification, rejection, revocation, or challenge; provide a 30-day appeal path; and revoke owner capabilities immediately when a claim is revoked without deleting the underlying Profile.

#### Scenario: Verified claim is revoked
- **WHEN** authorized review determines that a verified claim is compromised, transferred, or materially unsupported
- **THEN** the system removes Profile-owner capabilities and public claimed markers, revokes sessions authorized through the former claim, preserves the Profile, and gives the Account a reason and appeal path

### Requirement: Blocking is unilateral, immediate, and non-notifying
The system SHALL let an authenticated Account block another Account without notifying the blocked Account and SHALL apply the block at read and write time across direct interaction, targeted discovery, named bylines, claimed-Profile owner interactions, notifications, and later social capabilities.

#### Scenario: Account blocks another Account
- **WHEN** a block is confirmed
- **THEN** both Accounts immediately lose direct interaction and targeted discovery paths to each other and pending disallowed requests are withdrawn without revealing who initiated the block

#### Scenario: Blocked person visits logged out
- **WHEN** otherwise public Profile or compliant public content is opened without an authenticated Account context
- **THEN** the system renders it according to its independent public visibility state and does not claim that blocking is a global takedown or a guarantee against logged-out viewing

#### Scenario: Hidden author and blocked Account are privately related
- **WHEN** enforcing a block would reveal that an anonymous author is one of the blocked Accounts
- **THEN** the system enforces prohibited direct interaction while preserving the generic anonymous attribution and not confirming the relationship

### Requirement: Reports create cases rather than verdicts
The system SHALL let an authenticated Account report any reportable object using a bounded reason, optional context, and relevant evidence; acknowledge receipt; and create or attach to a Moderation Case without automatically changing rank, visibility, or enforcement from report count alone.

#### Scenario: First report is submitted
- **WHEN** an Account reports an available object
- **THEN** the system records the object snapshot, reporter, reason, time, and evidence privately and returns a case receipt without exposing the reporter to the reported party

#### Scenario: Coordinated duplicate reports arrive
- **WHEN** many Accounts report the same object or one Account repeats a report
- **THEN** the system groups related intake for triage and abuse analysis without treating raw report volume as proof or a ranking signal

#### Scenario: Report concerns imminent harm
- **WHEN** a report selects a threat or imminent-harm reason
- **THEN** the system shows emergency-service guidance, routes the case to the documented urgent queue, and does not promise that ordinary moderation is emergency response

### Requirement: Moderation Cases have explicit workflow states
The system SHALL represent a Moderation Case as `received`, `triaged`, `investigating`, `resolved`, `appealed`, or `closed` and SHALL keep case state separate from the target object's visibility and the affected Account's enforcement state.

#### Scenario: Moderator resolves with no action
- **WHEN** review finds no policy basis for action
- **THEN** the case records `resolved` with no action and the object and Account keep their prior states

#### Scenario: Target is deleted during investigation
- **WHEN** the reported object or Account is deleted while a case remains open
- **THEN** the system preserves the restricted snapshot and case history needed to resolve reports, appeals, abuse controls, or legal holds without restoring the public target

### Requirement: Enforcement is scoped and explainable
The system SHALL support no action, changes required, visibility limitation, removal, Account limitation, Account suspension, and Profile Claim revocation as distinct outcomes and SHALL apply only the outcome justified by the recorded policy reason.

#### Scenario: Enforcement action is issued
- **WHEN** a moderator applies an outcome to an object, Account, or Profile Claim
- **THEN** the affected Account receives the target, policy reason, action, effective time, scope or duration, and appeal route unless a specific detail is withheld for a recorded safety or integrity reason

#### Scenario: Changes are required
- **WHEN** an object can comply through an edit rather than removal
- **THEN** the system keeps it nonpublic or limited as specified, identifies the required change literally, and returns it to review rather than publishing the edit automatically

### Requirement: Appeals preserve the challenged decision and confidentiality
The system SHALL let an affected Account appeal an eligible enforcement or Profile Claim decision within 30 days with new context, preserve the original decision and evidence snapshot, keep the action effective by default, and assign a qualified reviewer who did not issue the original decision.

#### Scenario: Appeal changes the outcome
- **WHEN** appeal review determines that the original decision should be modified or reversed
- **THEN** the system records a new decision, updates the applicable object, Account, or claim state, notifies the appellant, and retains both decisions in audit history

#### Scenario: Appeal requests a reporter or anonymous author identity
- **WHEN** an appellant asks who reported them or who wrote anonymously
- **THEN** the system adjudicates the policy issue without disclosing that identity or confirming a suspected identity

### Requirement: Material safety transitions have append-only audit history
The system SHALL record each sensitive identity, Profile Claim, policy, moderation, enforcement, appeal, and retention transition with actor role, time, reason code, policy version, prior state, resulting state, and restricted evidence references.

#### Scenario: Authorized reviewer inspects a case
- **WHEN** a reviewer with a documented purpose opens the audit history
- **THEN** the system presents the chronological decisions and reveal events without placing authentication secrets, raw proof documents, or anonymous-author linkage in ordinary logs

#### Scenario: Actor attempts to alter history
- **WHEN** any role attempts to edit or delete an existing audit event outside the retention process
- **THEN** the system denies the mutation and records the attempt as a new event

### Requirement: Universal conduct rules protect identifiable people and system integrity
The system SHALL prohibit impersonation, threats, targeted harassment, non-consensual private contact information, sexual exploitation, spam, enforcement evasion, coordinated manipulation, and retaliation, and SHALL make capability-specific rules additive rather than contradictory.

#### Scenario: Content exposes private contact information
- **WHEN** a report or automated risk check identifies non-consensual private contact information
- **THEN** the system withholds or removes the material, preserves proportionate evidence, notifies affected Accounts without repeating the private data, and applies the documented appeal path

#### Scenario: Account evades an active suspension
- **WHEN** documented risk signals connect a new or existing Account to suspension evasion
- **THEN** the system denies the current risky action, routes the Account for enforcement review, and records the reason without publishing the linkage

### Requirement: Staff access is least-privilege and purpose-bound
The system SHALL restrict private identity, recovery data, claim evidence, reporter identity, anonymous-author linkage, block direction, risk signals, and legal holds to roles that need each class for a documented task.

#### Scenario: Support role views an ordinary ticket
- **WHEN** a support role without trust-and-safety reveal permission opens a case-related ticket
- **THEN** the system redacts anonymous-author linkage, reporter identity, raw evidence, hidden blocks, and authentication data

#### Scenario: Authorized reveal is required
- **WHEN** a trained authorized role accesses anonymous-author linkage or raw identity evidence for a documented case or valid legal process
- **THEN** the system requires a case reason, records actor and approver, and limits the result to the minimum data needed

### Requirement: Private data follows declared retention classes
The system SHALL assign authentication data, recovery data, Profile Claim evidence, anonymous-author linkage, reports, moderation evidence, audit history, security logs, backups, and legal holds to documented purpose, access, trigger, duration, and deletion rules before collection.

#### Scenario: Safety record reaches normal expiry
- **WHEN** a report, moderation, enforcement, or audit record reaches 24 months after final resolution with no active dispute or legal hold
- **THEN** the system deletes or irreversibly minimizes it according to its class and records completion without retaining the deleted sensitive payload in that receipt

#### Scenario: Legal hold pauses deletion
- **WHEN** an authorized legal hold applies before a retention job runs
- **THEN** the system records the scope and authority, restricts the preserved data, pauses only the affected class, and resumes deletion when the hold is released

### Requirement: Safety failures do not expose hidden state
The system SHALL provide stable safe behavior for missing targets, unavailable moderation systems, restricted Accounts, blocked relationships, removed objects, and deleted Accounts without revealing confidential state or silently performing a safety-sensitive action.

#### Scenario: Report target is no longer available
- **WHEN** an Account follows a report action for an object that has been removed or deleted
- **THEN** the system acknowledges that the object is unavailable, offers the documented support or existing-case path, and does not reveal its author, moderation reason, or deletion details

#### Scenario: Moderation intake is temporarily unavailable
- **WHEN** a report cannot be durably accepted
- **THEN** the system does not show a false receipt, preserves entered non-file evidence locally when safe, and offers a retry or urgent alternative without publishing the draft report
