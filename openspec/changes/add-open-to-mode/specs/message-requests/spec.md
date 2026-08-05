## MODIFIED Requirements

### Requirement: Recipients explicitly enable each launch request path
The system SHALL default message requests off and SHALL let an eligible Account independently enable them through its current verified claimed Profile, through its Public Byline on eligible named Posts, and as a separately consented contextual entry visible only to other eligible active Open To participants, without making an unclaimed Profile or standalone Public Byline messageable.

#### Scenario: Verified claimant enables Profile requests
- **WHEN** an active Account with a verified contact and verified Profile Claim enables Profile message requests
- **THEN** the claimed Profile exposes Message while that claim, setting, Account, and policy eligibility remain current

#### Scenario: Named Post author enables requests
- **WHEN** an active Account with a current Public Byline and at least one eligible Post enables Post-author requests
- **THEN** eligible Posts may expose Message through that Public Byline without adding the byline to Profile search or creating a Profile

#### Scenario: Open To participant separately enables introductions
- **WHEN** an eligible active participant explicitly enables Open To introductions
- **THEN** only another eligible active participant encountering the claimed Profile in an authorized contextual mutual view may receive that request entry

#### Scenario: Profile is unclaimed or requests are disabled
- **WHEN** a Profile has no verified claimant or its claimant disables the applicable request path
- **THEN** Message is absent rather than rendered as a disabled invitation or an Account-existence hint

### Requirement: A sender uses an accountable Message Identity
The system SHALL require an active Account, verified sign-in contact, recent policy approval, current recipient entry point, and either a current Public Byline for ordinary Profile or Post requests or a current verified claimed Profile for an Open To request, while preserving a signed-out visitor's ordinary protected intent through progressive Account and Public Byline setup.

#### Scenario: Eligible Account sends ordinary first contact
- **WHEN** an active verified-contact Account with a Public Byline passes policy and submits from a current Profile or Post entry point
- **THEN** the recipient sees that Public Byline and only an explicitly enabled verified Profile link, never Private Account Identity

#### Scenario: Open To participant sends first contact
- **WHEN** two eligible active Open To participants pass policy and the recipient enabled introductions
- **THEN** the recipient sees the sender's current verified claimed Profile as Message Identity without requiring or exposing a separate Public Byline

#### Scenario: Ordinary sender lacks a Public Byline
- **WHEN** a signed-in Account attempts an ordinary Message Request without a Public Byline
- **THEN** the system asks only for the foundation display name and optional photo, preserves the draft, and does not require a Profile Claim

#### Scenario: Anonymous author enters from their Review
- **WHEN** an Account attempts to use an anonymous Review, `Review author` Comment, Vote, Award, or isolated Notification as the sender or recipient identity
- **THEN** the system denies the path without confirming the hidden Account or offering a Public Byline or Open To fallback from that activity

### Requirement: First contact is one bounded contextual text
The system SHALL require one substantive text of at most 300 Unicode grapheme clusters, one purpose from `Connect`, `Collaborate`, `Invest`, `Hire`, `Open To`, or `Other`, and the canonical Profile or Post entry context; SHALL allow `Open To` only from an authorized contextual mutual Open To entry; SHALL reject links and URL-like text; and SHALL NOT accept images, video, audio, files, rich previews, contact cards, polls, or additional messages before acceptance.

#### Scenario: Sender submits a valid introduction
- **WHEN** the request contains an allowed purpose, substantive bounded text, and current source context
- **THEN** the system creates one pending request showing the sender's Message Identity, purpose, exact text, source context, sent time, and recipient controls

#### Scenario: Sender selects Open To from an ordinary request path
- **WHEN** a request uses purpose `Open To` without both current active statuses and the recipient's separate introduction consent
- **THEN** the system sends nothing and does not reveal whether the recipient has ever participated

#### Scenario: Sender includes a link or attachment
- **WHEN** the pending request contains a URL, URL shortener, attachment, executable embed, unsupported media, or more than 300 grapheme clusters
- **THEN** the system keeps it unsent and identifies the exact text-only correction required
