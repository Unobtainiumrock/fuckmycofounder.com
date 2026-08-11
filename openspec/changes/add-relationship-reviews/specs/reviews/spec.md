## ADDED Requirements

### Requirement: Review drafting precedes Account setup without publishing data
The system SHALL let a signed-out visitor compose a local Review draft against a selected Profile, SHALL require an active Account to save or submit it, and SHALL preserve the draft across successful authentication without creating a Public Byline or Profile.

#### Scenario: Visitor drafts before signing in
- **WHEN** a signed-out visitor enters relationship context, testimony, or assessment answers
- **THEN** the system keeps the work nonpublic and local to that visitor until they choose a protected save or submit action

#### Scenario: Authentication fails
- **WHEN** authentication cannot complete after the visitor chooses save or submit
- **THEN** the system preserves the local draft when safe, publishes nothing, and offers a retry without revealing whether another Account or hidden rule caused the failure

### Requirement: A Review is one first-hand filed account
The system SHALL attach every Review to one published canonical Profile and one accepted Relationship Claim and SHALL require relationship context, a Review Assessment, qualitative testimony, and an attestation of first-hand experience and material accuracy before submission.

#### Scenario: Complete Review is submitted
- **WHEN** an active Account supplies an accepted Relationship Claim, required Assessment answers, substantive testimony, and the attestation
- **THEN** the system creates one Account-backed submitted Review for moderation without making it public

#### Scenario: Relationship Claim is not accepted
- **WHEN** a draft has a missing, submitted, rejected, or revoked Relationship Claim
- **THEN** the system does not publish the Review and identifies the relationship status that must be resolved

#### Scenario: Profile becomes merged during drafting
- **WHEN** the selected Profile is merged before submission
- **THEN** the system resolves the draft to the canonical Profile, shows the author the current subject identity, and requires confirmation before submission

### Requirement: Qualitative testimony is bounded and substantive
The system SHALL require answers to **What happened?** and **What should their next collaborator know?**, SHALL offer **Anything they did right?** as an optional prompt, and SHALL require a concrete observed behavior or event rather than scores alone.

#### Scenario: Reviewer submits only scores or conclusions
- **WHEN** the qualitative answers contain no first-hand event, behavior, or useful relationship context
- **THEN** the system keeps the Review incomplete and asks for the observed basis without prompting a particular sentiment

#### Scenario: Reviewer includes balanced context
- **WHEN** the reviewer describes conduct that helped and harmed the working relationship
- **THEN** the system preserves both parts under the same content and moderation rules

### Requirement: Reviews prohibit high-risk and non-first-hand content
The system SHALL prohibit hearsay presented as fact, private contact or credential data, confidential records, protected-class commentary, amateur diagnoses, threats, targeted harassment, and unverified accusations of criminal conduct, and SHALL distinguish first-hand factual statements from clearly expressed opinion during moderation.

#### Scenario: Draft repeats another person's allegation
- **WHEN** testimony attributes a material claim only to what another person said or what the reviewer inferred from rumor
- **THEN** the system requires removal or first-hand reframing before publication

#### Scenario: Review contains a criminal accusation without reviewable first-hand support
- **WHEN** the Review alleges criminal conduct but the reviewer cannot provide a first-hand factual basis suitable for restricted moderation review
- **THEN** the system does not publish the accusation and gives a literal policy explanation without adjudicating criminal guilt

#### Scenario: Review contains private data
- **WHEN** text or an Exhibit exposes non-consensual personal contact, precise location, credential, financial, health, or unrelated third-party information
- **THEN** the system withholds or redacts the affected material, preserves proportionate restricted evidence, and applies the trust-safety notice and appeal path

### Requirement: Attribution is chosen per Review through the foundation seam
The system SHALL require either named attribution through the author's current Public Byline or anonymous attribution as **Anonymous reviewer** before first publication and SHALL expose no private Account field through anonymous public projections.

#### Scenario: Author chooses named publication without a Public Byline
- **WHEN** an eligible author selects **Post with my name** and has no Public Byline
- **THEN** the system requests only the foundation's required display name and optional photo, then returns to the Review submission

#### Scenario: Author chooses anonymous publication
- **WHEN** an eligible author selects **Post anonymously**
- **THEN** every public Review projection renders `Anonymous reviewer` without photo, Profile link, message action, stable pseudonym, Account identifier, or cross-Review continuity

#### Scenario: Author reviews the anonymity boundary
- **WHEN** an author proceeds with anonymous publication
- **THEN** the system explains that other users will not see the Account, the platform retains accountable identity, story details or images may identify the author, and valid legal process may require disclosure

#### Scenario: Attribution projection is unavailable
- **WHEN** the system cannot obtain the authorized named or anonymous projection
- **THEN** it withholds the Review from publication rather than falling back to private Account or Public Byline data

### Requirement: Published attribution may only become less revealing
The system SHALL prohibit an anonymously published Review from becoming named at launch, SHALL let a named author permanently convert a published Review to **Anonymous reviewer** after an explicit irreversibility warning, and SHALL record the conversion without exposing the private author.

#### Scenario: Named author requests anonymous conversion
- **WHEN** the author confirms that live surfaces can change but prior screenshots, notifications, exports, or downloaded Share Clips cannot be recalled
- **THEN** the system removes the Public Byline from current Review projections, uses `Anonymous reviewer`, records a restricted attribution event, and disables reversal to named attribution

#### Scenario: Anonymous author requests named conversion
- **WHEN** the author of an anonymously published Review attempts to reveal their Public Byline through attribution settings
- **THEN** the system denies the conversion with a literal launch-policy explanation and leaves the public attribution anonymous

#### Scenario: Another Account requests author identity
- **WHEN** any ordinary user, including the Profile subject, requests or guesses the author of an anonymous Review
- **THEN** the system neither reveals nor confirms the Account, Public Byline, Profile Claim, block relationship, evidence, or cross-Review history

### Requirement: Review lifecycle separates visibility, revisions, and disputes
The system SHALL represent Review visibility as `draft`, `submitted`, `changes required`, `published`, `withdrawn`, `limited`, or `removed`; SHALL record edits as immutable revisions; and SHALL record disputes as Moderation Case links rather than visibility states.

#### Scenario: Review enters launch moderation
- **WHEN** the author submits a complete Review
- **THEN** the system records `submitted`, shows the author `under review`, and exposes no Review publicly until an approved revision is published

#### Scenario: Moderator requires changes
- **WHEN** a Review can comply through an author edit
- **THEN** the system records `changes required`, identifies the bounded problem literally, preserves the submitted revision, and does not publish an unreviewed replacement

#### Scenario: Report opens a dispute
- **WHEN** a published Review is reported or the Profile subject files a dispute
- **THEN** the system opens or joins a Moderation Case without automatically labeling the Review disputed publicly, removing it, or changing rank from report volume

### Requirement: Material edits are versioned and moderated
The system SHALL preserve every submitted and approved Review revision with author, time, reason, attribution mode, prior revision, moderation outcome, and restricted evidence references and SHALL NOT silently overwrite published testimony or Assessment values.

#### Scenario: Author edits a published Review
- **WHEN** the author changes testimony, relationship context, Assessment, attribution, or Exhibits
- **THEN** the system creates a pending revision for moderation and keeps the last approved revision public unless a scoped safety decision limits it

#### Scenario: Revision is approved
- **WHEN** moderation approves a pending material revision
- **THEN** the system atomically makes it current, shows a public `edited` indicator and latest edit time, and retains prior text and values only in restricted history

#### Scenario: Revision is rejected
- **WHEN** a pending revision fails policy
- **THEN** the system leaves the prior eligible public revision unchanged and gives the author a reason and appeal path

### Requirement: Authors can withdraw Reviews without erasing safety history
The system SHALL let the author immediately withdraw an active Review from public surfaces, Feed eligibility, future reactions, and profile summaries while preserving restricted revisions, moderation evidence, and audit records only under declared retention and hold rules.

#### Scenario: Author withdraws a published Review
- **WHEN** the authenticated author confirms withdrawal
- **THEN** the system marks the Review `withdrawn`, removes its public body and Exhibits, returns a generic unavailable state at its canonical route, and does not expose the author's reason

#### Scenario: Author wants to publish again
- **WHEN** the author revises a withdrawn Review and resubmits it
- **THEN** the system requires the Relationship Claim to remain accepted and routes the new revision through full moderation before any public restoration

#### Scenario: Author Account deletion finalizes
- **WHEN** a Review author does not withdraw a compliant published Review before Account deletion finalizes
- **THEN** the Review remains in its independent visibility state, a named attribution becomes noninteractive `Former member`, an anonymous attribution remains `Anonymous reviewer`, and unpublished drafts expire according to the deletion and retention schedule

### Requirement: Profile subjects receive notice after publication, not before
The system SHALL withhold a pre-publication copy from the Profile subject and SHALL create a safe notification event for the verified Profile claimant when a Review publishes, without including anonymous-author identity or confidential evidence.

#### Scenario: Review publishes on a claimed Profile
- **WHEN** moderation publishes the Review
- **THEN** the system makes it public and concurrently emits a claimant-notice event containing the canonical Review, public relationship context, and response, correction, dispute, block, and report actions

#### Scenario: Profile is unclaimed
- **WHEN** a Review publishes without a verified Profile claimant
- **THEN** the system publishes under the same policy and records no private subject notification or guessed contact attempt

### Requirement: A verified Profile claimant may answer but not control a Review
The system SHALL let the current verified Profile claimant submit one active, clearly labeled **Profile Subject Response** per published Review, SHALL moderate and version that response, and SHALL NOT let the claimant edit the Review, force an Assessment change, veto publication, remove compliant criticism, or learn an anonymous author.

#### Scenario: Profile subject files a response
- **WHEN** the verified claimant submits an eligible response
- **THEN** the system reviews it under the same conduct rules and, if approved, attaches it to the Review with the claimed Profile identity and a literal subject-response label

#### Scenario: Subject identifies a factual error
- **WHEN** the claimant requests correction of relationship context or a concrete factual statement
- **THEN** the system opens a confidential correction path, lets the author submit a moderated revision, and applies scoped enforcement only when policy review requires it

#### Scenario: Profile Claim is revoked after response
- **WHEN** the response author's Profile Claim is revoked
- **THEN** the system prevents new claimant actions and preserves or limits the historical response according to its own moderation state without presenting the Account as the current verified claimant

### Requirement: Reviews may contain optional moderated Exhibits
The system SHALL permit zero to four image Exhibits with author-controlled order and captions, SHALL accept text-only Reviews, and SHALL treat every Exhibit as illustrative context rather than proof of the Relationship Claim or testimony.

#### Scenario: Reviewer submits no image
- **WHEN** a complete text Review has no Exhibit
- **THEN** the system permits submission and moderation without lowering its verification state or publication eligibility

#### Scenario: Reviewer adds an image
- **WHEN** the reviewer uploads an eligible image, supplies any required caption and rights/provenance attestation, and completes required redaction
- **THEN** the system safely decodes it, strips metadata, creates platform derivatives, and keeps it nonpublic until Review and media moderation approve it

#### Scenario: Image cannot be made safe
- **WHEN** an Exhibit is malformed, rights-ineligible, confidential, non-consensually intimate, contains unredacted sensitive data, or cannot be safely processed
- **THEN** the system rejects or removes that Exhibit without requiring rejection of otherwise compliant text and provides a literal replacement or text-only path

#### Scenario: Exhibit is limited after publication
- **WHEN** a credible privacy, rights, confidentiality, or personal-safety dispute concerns only one Exhibit
- **THEN** the system hides that Exhibit immediately, keeps eligible text public when the scoped decision allows, and preserves proportionate restricted evidence for the case and appeal

### Requirement: Review moderation addresses retaliation, brigading, and evasion
The system SHALL apply Account, relationship, timing, duplication, block, report, and coordinated-activity signals to Review submission and enforcement without treating negativity, popularity, or report volume alone as proof.

#### Scenario: Review follows an adverse event
- **WHEN** timing or context suggests firing, breakup, rejected investment, romantic rejection, legal conflict, or another retaliation risk
- **THEN** the system routes the Review for enhanced human review without presuming it false or publishing the risk signal

#### Scenario: Accounts coordinate against one Profile
- **WHEN** submission, evidence, device, network, invitation, or text-similarity signals indicate coordinated manipulation
- **THEN** the system slows or limits publication, groups related cases, preserves each Account's appeal path, and does not create additional public attention from the coordination

#### Scenario: Reports are coordinated against one Review
- **WHEN** a compliant Review receives a burst of duplicative or linked reports
- **THEN** the system groups the reports for abuse analysis and keeps visibility governed by evidence and policy rather than raw report count

### Requirement: Review-owned objects are reportable and appealable
The system SHALL make a Review, Exhibit, and Profile Subject Response reportable through bounded object-specific reasons, SHALL route intake through the foundation's Moderation Case contract, and SHALL provide eligible affected Accounts the foundation's notice and appeal path.

#### Scenario: Account reports a Review
- **WHEN** an Account reports first-hand eligibility, impersonation, retaliation or coercion, harassment, private data, confidentiality, criminal allegation, manipulated context, or another documented policy issue
- **THEN** the system records the target revision and reporter privately, returns a receipt, and changes visibility only through an evidence-based scoped decision

#### Scenario: Account reports one Exhibit
- **WHEN** a report concerns privacy, rights, intimate imagery, or misleading context in one Exhibit
- **THEN** the system preserves object-specific handling so moderation can limit that Exhibit without automatically removing eligible Review text

### Requirement: Profile, policy, and deletion states fail safely
The system SHALL derive Review availability from the current Profile, Relationship Claim, Review, attribution, and trust-safety states and SHALL provide generic empty, blocked, limited, removed, and unavailable outcomes without revealing hidden actors or case details.

#### Scenario: Relationship Claim is revoked while Review is public
- **WHEN** the authoritative claim state is no longer accepted
- **THEN** the system immediately places the Review in `limited`, excludes it from ordinary discovery, and routes its disposition through moderation without rewriting the approved revision

#### Scenario: Profile is removed
- **WHEN** the subject Profile becomes removed
- **THEN** the system withholds its Reviews from public and indexed routes consistently with the Profile decision and does not preserve the person's identity through Review text, metadata, or Exhibit thumbnails

#### Scenario: Review is removed
- **WHEN** final enforcement places the Review in `removed`
- **THEN** the canonical route returns a generic unavailable state, public testimony and Exhibits are withdrawn, dependent feature hooks become ineligible, and the affected Account receives the foundation notice and appeal path

#### Scenario: Author is blocked or restricted
- **WHEN** a signed-in viewer encounters hidden interaction because of an Account Block or Account restriction
- **THEN** the system suppresses prohibited direct paths without changing independently public Review visibility or revealing author identity, block direction, or enforcement state

#### Scenario: Moderation or policy is unavailable
- **WHEN** a Review submission, revision, attribution change, response, withdrawal restoration, or Exhibit mutation cannot receive an authoritative decision or durable receipt
- **THEN** the system fails closed for publication, preserves a safe retryable draft when possible, and never shows a false success or raw private state
