## ADDED Requirements

### Requirement: Open To is a gated adults-only claimed-identity capability
The system SHALL keep Open To disabled by default and SHALL permit activation only for an active Account with a verified contact, recent authentication, one current verified Profile Claim to a published adult Profile, a current nonpublic `18+` eligibility assertion, and centralized policy approval; it SHALL NOT require a Public Byline.

#### Scenario: Eligible Account activates
- **WHEN** every Account, claim, Profile, adult-eligibility, authentication, gate, and policy condition is current
- **THEN** the system permits the Account holder to review disclosures and activate through the claimed Profile identity

#### Scenario: Profile is adult-eligible but Account age is not established
- **WHEN** Profile eligibility or a verified Profile Claim exists without a current `18+` assertion for the Account holder
- **THEN** the system does not infer age or activate Open To and offers the adult-eligibility path

#### Scenario: A prerequisite becomes ineligible
- **WHEN** the Account is limited, suspended, deletion pending, or deleted; the Profile Claim is no longer verified; the Profile is not published; the age assertion expires or is invalidated; policy denies the capability; or the gate closes
- **THEN** the system immediately suppresses or ends the status and every dependent Open To projection and request entry

### Requirement: Adult eligibility is privacy-preserving and challengeable
The system SHALL use an age-assurance method proportionate to the launch jurisdiction and capability risk, SHALL expose to Open To policy only `18+`, `under-18`, or `unable-to-establish` plus restricted audit facts, SHALL provide an accessible alternative and challenge path, and SHALL NOT reuse assurance data for identity enrichment, Profiles, advertising, ranking, recommendations, location, analytics, or unrelated risk profiling.

#### Scenario: Provider establishes only the threshold
- **WHEN** an approved assurance method determines that the authenticated Account holder is at least 18
- **THEN** the system stores only the minimum assertion and restricted provider, method-version, checked-at, expiry, and audit facts required by documented policy

#### Scenario: Result is underage or indeterminate
- **WHEN** the method returns `under-18` or `unable-to-establish`
- **THEN** the system does not activate or project Open To, provides a safe result-appropriate next step, and reveals no provider confidence, document, biometric, or risk detail

#### Scenario: Assurance or policy is unavailable
- **WHEN** no authoritative current adult-eligibility or policy decision can be obtained
- **THEN** the system fails closed for activation and projection, preserves a safe retry, and does not fall back to self-declaration, Profile age, photo inference, or stale client state

### Requirement: Intentions use a fixed candid taxonomy
The system SHALL require at least one current intention from exactly **Hook up**, **Date**, and **Relationship**, SHALL permit more than one, and SHALL NOT infer an intention, target gender, sexual orientation, compatibility, consent, or preference from behavior or other product data.

#### Scenario: Participant selects intentions
- **WHEN** the participant chooses **Date** and **Relationship**
- **THEN** the system stores and later projects only those exact selected labels while the status remains eligible

#### Scenario: No intention remains
- **WHEN** a participant removes the last selected intention
- **THEN** the system treats the action as Leave Open To rather than publishing an empty or inferred status

### Requirement: Activation requires informed explicit confirmation
The system SHALL show the selected intentions, contextual mutual audience, exact expiry, immediate Leave control, screenshot and non-recall limit, conduct rule, reputation isolation, and separate default-off introduction setting before one explicit activation confirmation.

#### Scenario: Account reviews activation
- **WHEN** an eligible Account reaches final activation
- **THEN** the system states that Open To means openness to an introduction only and is not consent to sexual language, contact, a meeting, touch, sex, or continuing interaction

#### Scenario: Confirmation is interrupted
- **WHEN** authentication, policy, storage, or the Account holder interrupts before the activation commit receives a durable receipt
- **THEN** the system creates no active status or peer projection and offers a safe retry without a false success state

### Requirement: Every activation has one fixed 14-day window
The system SHALL set expiry to exactly 14 days after successful activation, SHALL NOT extend that expiry because of intention edits, introduction-setting changes, dependency outages, views, messages, or other activity, and SHALL require a fresh activation after expiry.

#### Scenario: Window reaches its boundary
- **WHEN** the authoritative clock reaches the activation timestamp plus 14 days
- **THEN** the status becomes `expired`, every Open To projection and pending request entry ends, and no peer is notified

#### Scenario: Participant changes an intention
- **WHEN** an active participant adds or removes an intention while at least one remains
- **THEN** the current projection updates without changing activation, expiry, or next-activation time

#### Scenario: Participant returns after expiry
- **WHEN** an eligible Account chooses to rejoin after the prior window closes
- **THEN** the system requires current adult and policy eligibility, fresh intentions, current disclosures, and a new explicit confirmation

### Requirement: Leaving is immediate and cannot be used to flip windows
The system SHALL let an active participant Leave Open To at any time, SHALL stop visibility and pending Open To introductions immediately, and SHALL prevent another activation until the original 14-day window closes without blocking ordinary safety, Account, Profile, or messaging controls.

#### Scenario: Participant leaves on day two
- **WHEN** the participant confirms Leave Open To
- **THEN** the status becomes `left`, future Open To visibility ends immediately, and the next eligible activation remains the original day-14 boundary

#### Scenario: Participant tries to reactivate early
- **WHEN** a participant who left attempts another activation before the original expiry
- **THEN** the system does not project a new status, shows the literal next-eligible time only to that participant, and provides no peer-visible history

### Requirement: Mutual visibility is contextual rather than a discovery pool
The system SHALL project an Open To Status only when the viewer and encountered Profile owner both have current eligible active statuses, the Account pair passes Block and policy checks, and the Profile was independently returned through ordinary signed-in Profile search, canonical Profile navigation or an independently known link, or private Follow activity; it SHALL NOT create an Open To directory, browse surface, search filter, ranking, recommendation, suggestion, swipe, Like, Match, or active-participant count.

#### Scenario: Two active participants meet in ordinary Profile search
- **WHEN** ordinary Profile search independently returns one participant's claimed Profile to another active participant
- **THEN** the system may decorate that existing result with the current selected intentions without changing its candidacy or order

#### Scenario: Inactive Account opens the same Profile
- **WHEN** a signed-out, ineligible, inactive, left, or expired viewer opens that public Profile
- **THEN** the system shows no Open To existence, status, intention, control, placeholder, or unavailable hint

#### Scenario: Product requests an Open To pool
- **WHEN** a caller asks for active participants, location matches, compatibility matches, or status-ranked Profiles
- **THEN** the system denies the unsupported query without returning identifiers, counts, or timing-derived hints

### Requirement: The projection is minimal and pair-authorized
The system SHALL project only the encountered Profile's current public name and photo, selected intentions, and an introduction entry when separately enabled; SHALL reauthorize both participants and the pair at read time; and SHALL NOT expose activation time, exact expiry, age result, assurance method, claim proof, view history, rejection history, request-setting history, or other participants.

#### Scenario: Both participants remain eligible
- **WHEN** a contextual view passes current mutual and pair authorization
- **THEN** the viewer sees the minimal Open To decoration and its Block and Report actions

#### Scenario: Pair becomes blocked during a cached view
- **WHEN** either Account blocks the other before the next read or action
- **THEN** the decoration and introduction entry disappear immediately and errors, cache behavior, and timing reveal neither block direction nor former status

### Requirement: Open To never leaks through public or anonymous surfaces
The system SHALL exclude status, intentions, eligibility, peer views, and introduction settings from signed-out responses, public Profile fields, Feed items, Reviews, Posts, Comments, Profile Aggregates, Share Clips, Canonical Share metadata, search-engine indexing, exports to other Accounts, optional peer Notifications, delivery payloads, ordinary logs, and anonymous-author surfaces.

#### Scenario: Active participant authored an anonymous Review
- **WHEN** another active participant encounters the Review, a `Review author` Comment, Vote, Award, Notification, error, or Block state
- **THEN** Open To neither links nor decorates that anonymous activity and neither confirms nor denies the author's Account, Profile Claim, or status

#### Scenario: External crawler opens a Profile
- **WHEN** a crawler, unfurl agent, signed-out visitor, or cached public client requests the Profile
- **THEN** its content and metadata contain no Open To field, placeholder, image variation, count, or cache key

### Requirement: Open To introduction consent is separate and reversible
The system SHALL default **Let people in Open To send me an introduction** off, SHALL require a separate explicit action to enable it, SHALL let the participant disable it immediately without leaving Open To, and SHALL expose the entry only while both participants and the recipient setting remain eligible.

#### Scenario: Status activates under defaults
- **WHEN** a participant activates without enabling introductions
- **THEN** eligible peers may see the selected intentions but receive no Open To message entry or disabled-control hint

#### Scenario: Recipient disables introductions
- **WHEN** an active recipient turns the setting off
- **THEN** the system immediately removes the entry, generically closes pending Open To requests, and sends no requester attention or reason signal

### Requirement: Open To requests reuse controlled messaging
The system SHALL send an Open To introduction only through the existing Message Request policy using purpose **Open To**, the sender's current verified claimed Profile as Message Identity, the contextual Profile source, one bounded link-free text, and every existing pair, Account, quota, moderation, Block, privacy, lifecycle, and retention control.

#### Scenario: Eligible participant sends an introduction
- **WHEN** both statuses are active, the recipient enabled introductions, and the sender passes current Message Request policy
- **THEN** the system creates one pending request with the claimed Profile identity and **Open To** purpose without creating a Match, Connection, Follow, consent inference, or ranking event

#### Scenario: Open To eligibility ends before acceptance
- **WHEN** either status leaves, expires, ends, is suppressed, becomes blocked, or the recipient disables introductions while its request is pending
- **THEN** the request becomes generically unavailable and cannot be accepted, restored, or used to infer which condition changed

#### Scenario: Request was accepted before status ended
- **WHEN** a later Leave or expiry occurs after acceptance opened a Direct Message conversation
- **THEN** the conversation continues only under ordinary Direct Message permission and is not closed, labeled, ranked, or renewed by Open To

### Requirement: Availability never grants sexual or ongoing consent
The system SHALL state and enforce that status, shared intention, profile view, introduction enablement, request, reply, request acceptance, and prior conversation are not consent to sexual content, off-platform contact, a meeting, physical contact, sexual activity, or continuing interaction.

#### Scenario: Sender uses status to justify unwanted sexual content
- **WHEN** an introduction or conversation contains unwanted sexual language, coercion, threats, fetishization, intimate imagery, or repeated contact
- **THEN** prior Open To state provides no policy defense and the system offers immediate Block and Report under the applicable content and messaging rules

#### Scenario: Participant withdraws interest
- **WHEN** a person leaves, declines, stops replying, blocks, or communicates a boundary
- **THEN** the system creates no adverse peer signal, retry entitlement, Review entitlement, or assumption of continuing consent

### Requirement: Blocks and Reports cover Open To and off-platform harm
The system SHALL apply a foundation Block before status discovery, projection, request entry, pending request, DM, Notification, analytics, and reactivation outcomes; SHALL offer confidential reporting for underage use, impersonation, unwanted sexual conduct, coercion or power abuse, stalking, threats, doxxing, outing, intimate-image abuse, trafficking, off-platform harm, and retaliation; and SHALL preserve a reporting route after ordinary access ends.

#### Scenario: Participant reports coercion after leaving
- **WHEN** a former participant no longer sees the status, Profile, request, or conversation through ordinary navigation
- **THEN** the system accepts a bounded support or known-object report, preserves proportionate evidence, offers Block and urgent guidance where applicable, and does not identify the reporter

#### Scenario: Account reports rejection alone
- **WHEN** a report alleges only that another participant declined, left, did not reply, or was not interested
- **THEN** the system does not treat rejection as misconduct, preserves safety reporting for actual conduct, and applies false-report controls when warranted

#### Scenario: Underage participation is suspected
- **WHEN** a report or authoritative signal indicates that an Account holder may be under 18
- **THEN** the system immediately suppresses Open To, routes the case through the documented child-safety process, and reveals no reporter or evidence to peers

### Requirement: Open To is isolated from professional reputation
The system SHALL NOT use Open To status, intentions, views, requests, accepts, declines, leaves, expiries, reports, Blocks, or off-platform romantic or sexual interactions as a Relationship Claim, Relationship Verification method, Review entitlement, Profile Aggregate input, Feed feature, Review Vote, Award, Follow, search feature, or professional recommendation signal.

#### Scenario: Rejected requester attempts a Review
- **WHEN** an Account cites Open To contact, rejection, a date, hookup, or romantic relationship as its basis for a Review
- **THEN** the system rejects that basis as nonprofessional and requires an independently qualifying first-hand working Relationship Claim

#### Scenario: Ranker requests Open To features
- **WHEN** Feed, Profile search, aggregate, notification, or recommendation policy asks for Open To data
- **THEN** the system returns no feature, count, label, or inferred replacement

### Requirement: Launch collects no dating-discovery or sexual media data
The system SHALL NOT collect or display Open To location, distance, gender target, sexual orientation, participant preference, compatibility, Like, Match, schedule, contact information, image, video, audio, file, intimate content, or availability history.

#### Scenario: Participant wants nearby results
- **WHEN** a participant requests nearby people, a distance radius, compatible targets, or a map
- **THEN** the system explains that Open To has no discovery pool and does not request device, precise, or coarse location

#### Scenario: Participant attempts to attach media
- **WHEN** activation, status editing, or an Open To introduction includes media or contact payloads
- **THEN** the system sends and publishes nothing and redirects the participant to the bounded supported fields

### Requirement: Owner receipts do not notify peers
The system SHALL show the owner an authenticated in-product activation receipt, current expiry, Leave control, and status outcome; SHALL send no status, view, intention-change, leave, expiry, decline, or Block Notification to another participant; and SHALL NOT include Open To or intentions in email, push, lock-screen, or third-party delivery at launch.

#### Scenario: Status is about to expire
- **WHEN** the participant revisits the authenticated Open To control before expiry
- **THEN** the system shows the exact expiry and fresh-activation requirement without notifying or identifying any peer

#### Scenario: Peer status changes
- **WHEN** a person viewed earlier leaves, expires, edits intentions, disables introductions, or is blocked
- **THEN** the viewer receives no Notification, inbox event, history entry, or reason

### Requirement: Screenshots and retention have honest limits
The system SHALL disclose before activation and contextual viewing that recipients may capture visible information and that the platform cannot prevent or recall external copies, SHALL make withdrawal govern future platform projection only, and SHALL delete or irreversibly minimize ordinary closed intentions and settings within 30 days except proportionate reported evidence or a recorded legal hold.

#### Scenario: Participant leaves after a screenshot
- **WHEN** a participant withdraws after another person captured an eligible view
- **THEN** the platform removes future projection immediately, does not claim to erase the external copy, and offers reporting for outing, harassment, or prohibited redistribution

#### Scenario: Closed status reaches retention expiry
- **WHEN** 30 days pass after ordinary leave, expiry, or ending with no report, appeal, or legal hold
- **THEN** the system deletes or irreversibly minimizes intentions, introduction setting, and peer projections without retaining them in analytics or deletion receipts

### Requirement: Failure and deletion states are safe and literal
The system SHALL fail closed for activation, projection, introduction, Block, Report, retention, or lifecycle mutation when authoritative policy or durable storage is unavailable and SHALL provide comparable safe outcomes for missing, removed, merged, deletion-pending, deleted, blocked, left, expired, and ineligible Accounts or Profiles.

#### Scenario: Policy fails during projection
- **WHEN** the system cannot reauthorize both statuses, claim, Block, adult eligibility, and pair policy
- **THEN** it shows no Open To decoration, does not extend the window, and exposes no stale value or hidden failure cause

#### Scenario: Account deletion begins
- **WHEN** an active participant confirms Account deletion
- **THEN** the system immediately suppresses the status and pending Open To requests, preserves accepted DM copies only under their existing contract, and applies documented Account and safety retention without redirecting the status to a Public Byline or Profile

#### Scenario: Profile is merged
- **WHEN** the claimed Profile canonically merges while Account, claim, and policy remain eligible
- **THEN** the system reauthorizes the claim against the survivor before any projection and otherwise ends the status without revealing merge or claim evidence
