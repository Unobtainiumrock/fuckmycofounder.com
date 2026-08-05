## ADDED Requirements

### Requirement: Named participation creates a Public Byline on demand
The system SHALL require a Public Byline containing a display name and optional photo before an Account publishes a named action, and SHALL NOT require a claimed Profile.

#### Scenario: Account first chooses a named action
- **WHEN** an active Account without a Public Byline proceeds to publish named participation
- **THEN** the system asks only for a display name and optional photo, validates them, creates the Public Byline, and returns to the pending action

#### Scenario: Account remains private
- **WHEN** an Account takes only actions that do not require named attribution
- **THEN** the system does not require or create a Public Byline

### Requirement: Public Byline and Profile remain distinct
The system SHALL NOT add a Public Byline to Profile search, create a Profile from it, or imply that its display name is verified merely because its Account has a verified authentication method.

#### Scenario: Public Byline has no Profile Claim
- **WHEN** named content renders for an Account without a verified Profile Claim
- **THEN** it shows the Public Byline without a Profile link, claimed marker, or identity-verification claim

#### Scenario: Public Byline owner has a verified Profile Claim
- **WHEN** the owner explicitly enables their verified Profile Claim on named participation
- **THEN** the Public Byline links to that Profile and shows a narrowly labeled claimed-Profile state

### Requirement: Public Bylines cannot impersonate system or real-person authority
The system SHALL reject reserved safety labels and materially deceptive Public Bylines and SHALL make every Public Byline reportable for impersonation.

#### Scenario: Reserved anonymous label is entered
- **WHEN** an Account attempts to use `Anonymous reviewer`, `Review author`, or a reserved staff or moderation label as its display name
- **THEN** the system rejects the name with a literal explanation

#### Scenario: Public Byline is reported as impersonation
- **WHEN** an Account reports a Public Byline for impersonation
- **THEN** the system creates a Moderation Case without revealing the reporter and preserves the byline state reviewed by the moderator

### Requirement: Public Byline changes preserve accountable authorship
The system SHALL apply an accepted Public Byline change consistently to current named surfaces, retain the prior value only in restricted audit history, and rate-limit changes that indicate impersonation or enforcement evasion.

#### Scenario: Display name changes normally
- **WHEN** an active Account edits its Public Byline to an allowed display name
- **THEN** current named surfaces render the new byline and no public previous-name history is created by default

#### Scenario: Account attempts rapid identity changes
- **WHEN** Public Byline edits exceed the documented safety threshold or match an active impersonation signal
- **THEN** the system safely delays or routes the change for review without erasing current authorship or its audit history

### Requirement: Anonymous Attribution has no public continuity
The system SHALL render publicly anonymous participation as `Anonymous reviewer` with no photo, Public Byline, Profile link, message target, stable pseudonym, or public identifier that connects that Account's anonymous Reviews.

#### Scenario: Two Reviews share one private Account author
- **WHEN** the same Account publishes two eligible Reviews with anonymous attribution
- **THEN** public clients receive the same generic label but no stable value that proves the Reviews share an author

#### Scenario: Another user inspects an anonymous Review
- **WHEN** any ordinary user, including the Profile subject, opens the Review, shares it, views notifications, or requests an authorized export
- **THEN** the system exposes no Account identifier, Public Byline, Profile Claim, contact path, or cross-Review author history

### Requirement: Anonymous authors remain accountable to the platform
The system SHALL retain a restricted Account association for anonymous participation so authorized trust-and-safety staff can investigate abuse, while describing anonymity as protection from other users rather than anonymity from the platform or valid legal process.

#### Scenario: Anonymous Review is reported
- **WHEN** an authorized moderator opens the resulting Moderation Case for a documented purpose
- **THEN** the moderator can apply Account-backed history and enforcement without placing the author's identity in public data, reporter notices, subject notices, or ordinary application logs

#### Scenario: Unauthorized staff path requests the linkage
- **WHEN** a staff role without anonymous-linkage permission attempts access
- **THEN** the system denies access and records the denied reveal attempt

### Requirement: Anonymous attribution is generated through one isolation seam
The system SHALL derive anonymous public payloads through a dedicated attribution interface and SHALL NOT require feeds, sharing, notifications, analytics, exports, or later content capabilities to remove private Account fields themselves.

#### Scenario: New public renderer consumes anonymous content
- **WHEN** a public renderer requests attribution for anonymously published content
- **THEN** it receives only the generic anonymous projection and cannot request the private Account identity through that interface

#### Scenario: Attribution service is unavailable
- **WHEN** the system cannot produce an authorized public-attribution projection
- **THEN** it fails closed by withholding the content or its attribution rather than falling back to raw Account data

### Requirement: Account enforcement controls Public Byline availability
The system SHALL prevent a limited or suspended Account from using its Public Byline for actions disallowed by the enforcement state while preserving the byline needed to identify existing named authorship.

#### Scenario: Suspended author has existing named material
- **WHEN** an ordinary reader opens compliant named material from a suspended Account
- **THEN** the system renders the retained Public Byline subject to the material's own visibility state but offers no disallowed new interaction through that Account

#### Scenario: Account deletion finalizes
- **WHEN** a Public Byline's Account becomes deleted
- **THEN** the system removes the interactive byline identity and applies each later content capability's documented deleted-author treatment without creating a Profile or exposing private identity
