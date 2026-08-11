## ADDED Requirements

### Requirement: Public browsing precedes Account creation
The system SHALL allow signed-out visitors to browse public surfaces and SHALL request an Account only when they begin a protected action.

#### Scenario: Visitor browses without signing up
- **WHEN** a signed-out visitor opens a public page or public object
- **THEN** the system renders it without an Account, onboarding gate, contact import, or notification prompt

#### Scenario: Visitor begins a protected action
- **WHEN** a signed-out visitor begins an action that requires accountability or abuse prevention
- **THEN** the system preserves the pending action or draft, authenticates the visitor, and returns them to that action without a general onboarding flow

### Requirement: Launch sign-in is passwordless
The system SHALL offer Sign in with Google, Sign in with Apple, and a one-time email sign-in link at launch, and SHALL create an Account only after the chosen method proves control.

#### Scenario: Provider sign-in succeeds
- **WHEN** Google or Apple returns a valid authenticated identity response
- **THEN** the system creates or resumes the Account associated with that exact linked method

#### Scenario: Email link is invalid
- **WHEN** an email sign-in link is expired, already used, malformed, or fails throttling
- **THEN** the system does not authenticate or create an Account, preserves any local draft, and offers a fresh generic sign-in attempt

#### Scenario: Authentication provider is unavailable
- **WHEN** one sign-in method fails or is unavailable
- **THEN** the system preserves the protected intent, explains the method-specific failure without revealing Account existence, and offers the other launch methods

### Requirement: Authentication methods link explicitly
The system SHALL require an authenticated session and recent reauthentication to add or remove an authentication method, and SHALL NOT merge Accounts solely because two methods report the same email address.

#### Scenario: Existing member adds a recovery method
- **WHEN** an active Account holder recently reauthenticates and proves control of another launch method
- **THEN** the system links the method, records the security event, and notifies the previously verified contact

#### Scenario: Provider email matches another Account
- **WHEN** an unlinked provider reports an email already present on a different Account
- **THEN** the system does not merge or reveal the Accounts and routes the person through authenticated linking or reviewed recovery

### Requirement: Recovery resists takeover and enumeration
The system SHALL provide a reviewed recovery path when all linked methods are unavailable, use generic responses and throttling, notify existing verified contacts, and SHALL NOT use security questions as sufficient proof.

#### Scenario: Recovery is requested for any email
- **WHEN** a person submits an email to the recovery flow
- **THEN** the system returns the same response and comparable timing regardless of whether an Account exists

#### Scenario: High-impact recovery succeeds
- **WHEN** the platform approves recovery after proportionate private proof and a hold period
- **THEN** the system revokes prior sessions, notifies prior verified contacts, requires fresh authentication, and requires re-verification before sensitive Profile Claim actions

### Requirement: Private Account Identity is not a public identity
The system SHALL keep authentication identifiers, contacts, recovery data, Account status, risk signals, Profile Claim evidence, and anonymous-content links nonpublic, and SHALL NOT create a public username, Public Byline, or Profile as a side effect of Account creation.

#### Scenario: New Account completes sign-in
- **WHEN** a visitor authenticates for an action that does not require named participation
- **THEN** the system creates only the private Account and resumes the action without asking for a public name or photo

#### Scenario: Public client requests Account data
- **WHEN** an unauthenticated or unauthorized client requests data associated with an Account
- **THEN** the response exposes no contact, authentication, recovery, moderation, risk, or anonymous-linkage field

### Requirement: Account lifecycle controls protected capabilities
The system SHALL represent each Account as `active`, `limited`, `suspended`, `deletion pending`, or `deleted`, and SHALL authorize protected actions according to that state without changing independent Profile or content records.

#### Scenario: Limited Account signs in
- **WHEN** a limited Account holder signs in
- **THEN** the system permits reading their notices, exporting their data, appealing, deleting the Account, and only the protected actions explicitly allowed by the limitation

#### Scenario: Suspended Account signs in
- **WHEN** a suspended Account holder signs in
- **THEN** the system permits only safety notices, appeals, data export, and Account deletion and denies ordinary protected actions

#### Scenario: Deleted Account attempts authentication
- **WHEN** a method formerly associated with a finalized deleted Account authenticates
- **THEN** the system does not restore the deleted Account or its former claims and applies the documented new-Account and abuse-prevention policy

### Requirement: Sensitive actions require recent authentication
The system SHALL require recent reauthentication before authentication-method changes, reviewed recovery completion, Profile Claim submission or transfer, Account export, or Account deletion.

#### Scenario: Session is valid but stale
- **WHEN** an Account holder with a stale session attempts a sensitive action
- **THEN** the system preserves the intent and requires one linked method to be proven again before continuing

### Requirement: Account holders control their private data
The system SHALL let an authenticated Account holder view and correct their contact methods, obtain a machine-readable export of Account data they are authorized to receive, and schedule Account deletion with a clear object-by-object consequence summary.

#### Scenario: Account export is requested
- **WHEN** an active Account holder recently reauthenticates and requests an export
- **THEN** the system provides their authorized Account data without another person's private data, reporter identity, block direction, or anonymous-author linkage

#### Scenario: Deletion consequences are reviewed
- **WHEN** an Account holder starts deletion
- **THEN** the system explains the recovery window, public-Profile independence, object-specific authored-content treatment, retained safety records, and legal-hold exception before confirmation

### Requirement: Account deletion has a bounded recovery and erasure schedule
The system SHALL revoke active sessions when deletion is confirmed, keep the Account in `deletion pending` for 30 days, allow cancellation only after reauthentication during that window, and then finalize deletion according to the documented retention classes.

#### Scenario: Deletion is cancelled in time
- **WHEN** the Account holder proves a linked method within 30 days and cancels deletion
- **THEN** the system returns the Account to its pre-deletion enforcement state without silently restoring a revoked Profile Claim

#### Scenario: Deletion window expires
- **WHEN** 30 days pass without authenticated cancellation
- **THEN** the system marks the Account deleted, erases primary private identity within 30 additional days, and schedules backup copies to expire within 90 days unless a recorded legal hold applies

### Requirement: Account flows are observable without exposing secrets
The system SHALL give the Account holder plain status and completion receipts for sign-in-method changes, recovery, export, and deletion while excluding tokens, proof documents, risk rules, and private identifiers from client-visible errors and ordinary logs.

#### Scenario: A sensitive operation fails
- **WHEN** linking, recovery, export, or deletion cannot complete
- **THEN** the system preserves a safe retry path and returns a stable error reference without exposing whether another Account, hidden block, risk signal, or secret caused the failure
