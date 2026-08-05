## ADDED Requirements

### Requirement: Profiles represent eligible startup people
The system SHALL publish a Profile only for one individually identifiable, living adult whose substantive professional participation as a founder, investor, venture capitalist, operator, startup employee, advisor, board member, accelerator participant, or material professional collaborator is publicly corroborated or privately substantiated.

#### Scenario: Startup participant is eligible
- **WHEN** moderation substantiates an adult person's qualifying professional participation and unique identity
- **THEN** the system may approve one Profile for that person without requiring fame, a following, consent to each compliant Review, an Account, or a Profile Claim

#### Scenario: Proposed subject is ineligible
- **WHEN** a proposal concerns a minor, deceased person, fictional person, organization, team, purely personal acquaintance, incidental observer, or person whose startup connection is merely aspirational
- **THEN** the system does not publish the Profile and gives the proposer an ineligibility reason and eligible appeal path

### Requirement: Profile proposals are Account-backed and moderated
The system SHALL require an active Account to submit a Profile proposal, SHALL collect a canonical professional name, candidate photo, private eligibility category, corroborating reference or evidence, and proposer attestation, and SHALL keep the proposal nonpublic until moderation approves it.

#### Scenario: Signed-out searcher proposes a missing person
- **WHEN** a signed-out visitor completes search and chooses **Add this person**
- **THEN** the system preserves the searched name, authenticates the visitor, returns them to the proposal, and asks only for the fields required by this requirement

#### Scenario: Proposal is submitted
- **WHEN** an active Account supplies valid identity fields, provenance, eligibility evidence, and attestation
- **THEN** the system creates a pending proposal, returns a status receipt, records the accountable proposer privately, and exposes no public Profile or indexable route before approval

#### Scenario: Moderation intake is unavailable
- **WHEN** the proposal cannot be durably stored or routed for moderation
- **THEN** the system does not create a public Profile or show a false receipt and preserves a safe retry path without exposing private evidence

### Requirement: Profile identity is publicly minimal
The system SHALL expose only the Profile's canonical professional name and approved profile photo as authored public identity fields, and SHALL keep eligibility evidence, proposer identity, photo provenance, prior values, moderation state details, risk signals, and duplicate features restricted.

#### Scenario: Public Profile renders
- **WHEN** any visitor opens a published Profile
- **THEN** the public identity projection contains the name and approved photo plus only derived public states such as claimed/unclaimed and canonical identifier, without private registry metadata

#### Scenario: Account creates a Profile for someone else
- **WHEN** the proposal is approved
- **THEN** the system does not turn the proposer into the Profile owner, create a Public Byline, expose the proposer, or imply that the subject has an Account

### Requirement: Profile lifecycle is explicit and independent
The system SHALL represent a Profile as `pending`, `published`, `limited`, `merged`, or `removed`, SHALL authorize visibility from that state, and SHALL keep Profile lifecycle independent from Account and Profile Claim lifecycle.

#### Scenario: Pending Profile is requested publicly
- **WHEN** an unauthorized visitor requests a pending Profile
- **THEN** the system returns the same generic unavailable behavior used for a nonexistent nonpublic proposal and does not reveal the proposer or review status

#### Scenario: Account deletion finalizes
- **WHEN** the Account that proposed or later claimed a published Profile is deleted
- **THEN** the system applies the Account and claim consequences without deleting, transferring, or changing the independent Profile

#### Scenario: Profile visibility is limited
- **WHEN** scoped enforcement places a Profile in `limited`
- **THEN** the system renders it only to the audience and routes allowed by that decision and does not describe the limitation as Account suspension or Profile deletion

### Requirement: Profile photos require usable provenance
The system SHALL publish a Profile photo only when it is subject-provided, supplied with permission from the subject and applicable rights holder, or available under terms that permit the platform's redistribution, and SHALL NOT treat public availability or a copied URL alone as permission.

#### Scenario: Proposer supplies a permitted photo
- **WHEN** the proposer identifies a qualifying provenance basis and moderation finds the image depicts the Profile subject without prohibited content
- **THEN** the system may approve a processed copy and retain only the minimum provenance facts required to administer that use

#### Scenario: Proposer supplies only a public image URL
- **WHEN** the proposal provides no subject permission, rights-holder permission, or redistribution license
- **THEN** the system does not publish that image and requests a compliant replacement without publishing the source URL

### Requirement: Photo processing minimizes harm and dependency
The system SHALL safely decode approved image input, remove embedded metadata, create platform-controlled derivatives, avoid third-party hotlinking, and provide an accessible neutral placeholder when no approved photo may remain public.

#### Scenario: Uploaded photo contains metadata
- **WHEN** an otherwise eligible photo contains EXIF, location, device, profile, or other nonvisual metadata
- **THEN** the system removes that metadata before producing any public derivative and never serves the original upload publicly

#### Scenario: Photo is credibly disputed
- **WHEN** a credible wrong-person, privacy, copyright, or personal-safety report requires immediate limitation
- **THEN** the system hides the photo, renders a neutral placeholder, preserves proportionate restricted evidence, and continues the Moderation Case without requiring removal of the whole Profile

#### Scenario: Image processing fails
- **WHEN** the system cannot safely decode, scan, or transform a candidate image
- **THEN** it does not publish or hotlink the image, preserves the rest of the pending proposal, and asks for a safe retry or replacement

### Requirement: Profile Claims grant scoped correction authority
The system SHALL derive claimed status and owner controls only from a `verified` Profile Claim under the foundation contract, SHALL prefer a verified claimant's substantiated self-identification for name and photo corrections, and SHALL keep those corrections subject to impersonation, provenance, and safety checks.

#### Scenario: Verified claimant corrects identity
- **WHEN** the verified claimant proposes the professional name they use or a compliant self-photo and no conflicting safety evidence exists
- **THEN** the system gives that evidence priority, records the correction decision, and updates the canonical Profile after required checks

#### Scenario: Profile Claim is revoked
- **WHEN** the foundation changes the Profile Claim from `verified` to `revoked`
- **THEN** the system removes claimed state and owner-only controls without reverting accepted identity corrections or removing the Profile

#### Scenario: Claim service is unavailable
- **WHEN** the system cannot obtain the authoritative derived claim state
- **THEN** it withholds claim-dependent controls and does not infer ownership from a matching name, email, photo, Public Byline, or prior session

### Requirement: Anyone with an eligible Account may propose a correction or dispute
The system SHALL let an eligible Account propose a name correction, photo correction or removal, ineligibility dispute, wrong-person report, impersonation report, or duplicate report with a bounded reason and optional private evidence, using the foundation's policy and Moderation Case contracts.

#### Scenario: Ordinary correction is pending
- **WHEN** an Account proposes a nonurgent change to a published Profile
- **THEN** the system keeps the accepted public value in place, stores the proposal and evidence privately, and gives the proposer a status receipt

#### Scenario: Correction is decided
- **WHEN** authorized review accepts or rejects a correction or dispute
- **THEN** the system records the prior and resulting state, gives affected eligible Accounts a plain reason and appeal path, and does not expose confidential evidence or reporter identity

#### Scenario: Repeated correction abuse occurs
- **WHEN** an Account repeatedly submits duplicative, retaliatory, or unsupported changes
- **THEN** centralized policy throttles or denies new submissions without changing the Profile from report volume alone

### Requirement: Duplicate merges preserve one canonical person record
The system SHALL merge Profiles only after authorized review confirms that they represent the same eligible person, SHALL choose the canonical survivor using verified subject control and identity accuracy with earliest eligible publication as a tie-breaker, and SHALL NOT use popularity, associated sentiment, or proposer status to choose the survivor.

#### Scenario: Unclaimed duplicates are confirmed
- **WHEN** two published unclaimed Profiles are confirmed to represent the same person
- **THEN** the system keeps one canonical Profile, marks the other `merged`, rebinds eligible associated records by stable Profile reference, and preserves every associated object's authorship, content, timestamps, and moderation state

#### Scenario: Verified claims conflict
- **WHEN** duplicate candidates have conflicting verified claimants or identity evidence
- **THEN** the system pauses the merge, opens or joins a confidential claim dispute, and exposes neither claimant's evidence to the other or the public

#### Scenario: Merge is found to be wrong
- **WHEN** appeal or moderator review establishes that merged records represent different people
- **THEN** the system reverses the merge from append-only lineage, restores independent canonical Profiles and associations, and records the correction without rewriting object history

### Requirement: Canonical Profile URLs survive identity changes
The system SHALL assign every Profile an opaque nonsemantic identifier, SHALL publish `/profiles/<id>/<current-slug>` as its canonical URL, and SHALL treat the name-derived slug as readability-only.

#### Scenario: Canonical name changes
- **WHEN** an accepted correction changes the Profile name and slug
- **THEN** the opaque identifier remains unchanged, the new route becomes canonical, and stale valid slugs redirect to it without exposing prior restricted values

#### Scenario: Duplicate source URL is opened
- **WHEN** a visitor opens the stable URL of a `merged` Profile
- **THEN** the system redirects to the surviving canonical Profile and does not expose merge evidence, proposer identities, or claim conflicts

### Requirement: Profile removal is scoped and privacy-preserving
The system SHALL support Profile removal for ineligibility, wrong-person records, confirmed death under launch policy, substantiated privacy or personal-safety grounds, uncurable rights violations, or required legal action, and SHALL NOT grant removal merely because a claimant dislikes compliant associated material.

#### Scenario: Profile is removed
- **WHEN** a final or immediately effective safety decision places the Profile in `removed`
- **THEN** the system excludes it from search and indexing, returns a generic unavailable result at its public route, withdraws public identity fields according to the appeal and retention schedule, and does not disclose the reason

#### Scenario: Claimed subject requests deletion to erase criticism
- **WHEN** the Profile remains eligible and the request identifies no applicable privacy, safety, rights, identity, or legal ground
- **THEN** the system preserves the Profile and routes objections to the relevant correction, dispute, response, or content-specific process

#### Scenario: Removal becomes final
- **WHEN** the applicable appeal window closes with no hold requiring public restoration
- **THEN** the system erases or minimizes public name and photo data and retains only a restricted, expiring tombstone permitted by the foundation retention classes for audit, merge integrity, and proportionate anti-recreation controls

### Requirement: Profile safety states do not reveal hidden relationships
The system SHALL apply blocks, Account restrictions, unavailable policy checks, and confidential moderation state through the foundation policy interface without exposing block direction, claimant identity, risk thresholds, or private case details.

#### Scenario: Signed-in viewer has a block relationship with the claimed owner
- **WHEN** the viewer encounters the otherwise public Profile by canonical URL
- **THEN** the system suppresses direct owner interaction and targeted recommendations using a generic state while preserving only the independently public Profile fields allowed by block policy

#### Scenario: Public Profile policy cannot be evaluated
- **WHEN** an operation would create, correct, merge, claim, or remove a Profile but the authoritative policy decision is unavailable
- **THEN** the system fails closed for the mutation, leaves the current public state unchanged, and provides a safe retry without revealing hidden state
