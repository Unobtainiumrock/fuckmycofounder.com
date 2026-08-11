## ADDED Requirements

### Requirement: Every eligible public source has a literal canonical Share action
The system SHALL offer **Share** for each `published` Profile, Review, Post, and Comment and each approved Profile Subject Response, and SHALL resolve it to that source's stable first-party HTTPS context without requiring an Account.

#### Scenario: Signed-out visitor shares a public object
- **WHEN** a signed-out visitor selects Share on an eligible Profile, Review, Post, or Comment
- **THEN** the system offers its canonical link without authentication, onboarding, or creation of a social activity object

#### Scenario: Profile Subject Response is shared
- **WHEN** a visitor shares an approved Profile Subject Response
- **THEN** the stable link opens that response inside its canonical Review with the Profile subject, Review, response label, and current moderation state intact

#### Scenario: Derived aggregate is shared
- **WHEN** a visitor shares a visible Profile Aggregate section
- **THEN** the system uses the canonical Profile link with its summary context and does not create a standalone aggregate object, frozen metric URL, or cross-Profile comparison

### Requirement: Canonical links contain no sharer or recipient tracking
The system SHALL copy a canonical URL containing stable source identity but no sharer, recipient, campaign, destination, Account, attribution, or anonymous-author token, and SHALL NOT personalize canonical metadata from noncanonical query parameters.

#### Scenario: Account copies a link
- **WHEN** a signed-in Account uses Copy link
- **THEN** the copied URL is identical to the public source's canonical URL and cannot identify who copied it or who may receive it

#### Scenario: Visitor arrives through a tagged URL
- **WHEN** a request includes campaign, referral, or other noncanonical query parameters
- **THEN** the page emits and copies the clean canonical URL and those parameters do not change public source content, attribution, or social metadata

### Requirement: Stable identity survives mutable presentation
The system SHALL preserve canonical source identity across approved edits, Public Byline changes, Profile name or slug changes, named-to-anonymous Review conversion, and Account deletion, while rendering only the current authorized public projection.

#### Scenario: Named Review becomes anonymous
- **WHEN** a named Review permanently converts to **Anonymous reviewer**
- **THEN** the same canonical Review link renders anonymous attribution and current metadata without the former Public Byline, photo, Profile link, or author identifier

#### Scenario: Profile slug changes or duplicate merges
- **WHEN** a Profile name changes or a duplicate Profile merges
- **THEN** stale and source links resolve to the surviving opaque Profile identity and emit its current canonical URL without exposing prior names or merge evidence

#### Scenario: Public Byline changes
- **WHEN** an accepted Public Byline change affects a Post or named Comment
- **THEN** its canonical link remains stable and current metadata uses only the authorized current byline without a public previous-name history

### Requirement: Public pages emit current server-visible social metadata
The system SHALL serve crawler-readable `og:title`, `og:type`, `og:url`, `og:description`, `og:image`, image type, dimensions, and `og:image:alt` from the current authorized public projection, using a publicly fetchable HTTPS preview with no session or expiring signature.

#### Scenario: Social crawler requests an eligible Review
- **WHEN** an unauthenticated crawler fetches a public Review URL and its preview image
- **THEN** it receives the same public Profile, relationship, attribution, and exact source context available to an ordinary signed-out visitor without private Account or policy data

#### Scenario: Preview image cannot be fetched or generated
- **WHEN** current public metadata is eligible but the object-specific image service is unavailable
- **THEN** the page preserves its canonical URL, title, description, and accessible source link, uses only an authorized generic site preview if current policy permits it, and does not expose stale or private imagery

### Requirement: Metadata preserves each object's meaning and context
The system SHALL generate distinct Profile, Review, Post, Comment, and Profile Subject Response titles, descriptions, images, and text alternatives and SHALL NOT present one object as another or omit context required to interpret it.

#### Scenario: Anonymous Review unfurls
- **WHEN** a publicly anonymous Review is shared
- **THEN** its metadata identifies the reviewed Profile and relationship context, attributes it only to **Anonymous reviewer**, and exposes no Public Byline, Account link, stable pseudonym, or hidden author hint

#### Scenario: Comment unfurls
- **WHEN** an eligible Comment is shared
- **THEN** its metadata includes the authorized current Comment attribution plus enough Review or Post and reply-target context to avoid presenting it as a standalone allegation

#### Scenario: Post unfurls
- **WHEN** an eligible Post is shared
- **THEN** its metadata uses named correspondence styling and the current Public Byline without Review relationship, Assessment, Run it back, Vote, or Award fields

#### Scenario: Profile summary is sparse
- **WHEN** a Profile has suppressed, insufficient, concentrated, updating, or unavailable aggregate fields
- **THEN** metadata includes no hidden, stale, inferred, or zero-valued metric and preserves every public disclosure label on any included aggregate context

### Requirement: Share eligibility follows current source and parent state
The system SHALL reauthorize the source, attribution, parent context, media, and trust-safety state before serving metadata or completing a Share action and SHALL immediately stop platform-controlled public sharing output for ineligible state.

#### Scenario: Review is withdrawn, limited, or removed
- **WHEN** a Review leaves `published` eligibility
- **THEN** its canonical route and metadata return the generic state allowed by the Review contract, with no former testimony, attribution, metrics, Exhibits, or removal reason

#### Scenario: Comment loses root context
- **WHEN** a Comment's owning Review or Post becomes unavailable
- **THEN** the Comment link and metadata become generically unavailable and do not render the Comment body without its source context

#### Scenario: Profile is removed
- **WHEN** a Profile becomes nonpublic
- **THEN** its link, metadata, photo, aggregate, dependent previews, and search-facing identity follow the Profile's generic removal contract without preserving the person through derivative text or images

#### Scenario: Profile Subject Response is no longer approved
- **WHEN** a response becomes limited or removed or its Review becomes unavailable
- **THEN** its deep link exposes no former response body or hidden case reason and falls back only to eligible Review context or a generic unavailable state

### Requirement: Sharing respects Blocks without claiming global erasure
The system SHALL apply current Account Blocks to signed-in targeted interaction and destination suggestions without revealing block direction, while leaving independently public canonical sources governed by their source state for signed-out access.

#### Scenario: Signed-in viewer encounters blocked named participation
- **WHEN** a Block suppresses direct interaction with the source Account
- **THEN** the system removes prohibited targeted delivery or named interaction paths using a generic state and does not expose who blocked whom

#### Scenario: Link opens while signed out
- **WHEN** the same independently public source is opened without Account context
- **THEN** ordinary public eligibility governs display and the system does not describe a Block as a global takedown or guarantee against off-platform sharing

#### Scenario: Anonymous author is privately involved in a Block
- **WHEN** share policy uses the Account behind an anonymous Review or `Review author` Comment
- **THEN** errors, metadata, availability, and timing neither confirm nor deny that hidden relationship

### Requirement: Share delivery is progressive and has permanent fallbacks
The system SHALL offer Copy link and a selectable canonical link on every eligible source, SHALL invoke native Web Share only from a user gesture when the exact URL payload is supported, and SHALL treat cancellation as a neutral outcome.

#### Scenario: Native link sharing is supported
- **WHEN** the visitor invokes Share in a secure allowed context and the browser accepts the exact title, text, and URL payload
- **THEN** the system opens the native chooser without claiming a destination published the link

#### Scenario: Native sharing is absent, blocked, or canceled
- **WHEN** the API is unavailable, Permissions Policy denies it, the payload is rejected, no target exists, or the visitor cancels
- **THEN** Copy link and selectable URL remain available, no source state changes, and cancellation is not reported as product failure

#### Scenario: Clipboard is denied
- **WHEN** Copy link cannot write to the clipboard
- **THEN** the system leaves the canonical URL visible, selectable, and available as an ordinary accessible link with a literal retry explanation

### Requirement: Referrer and telemetry behavior preserves recipient privacy
The system SHALL use restrictive outbound referrer behavior, SHALL NOT attach recipient or destination identifiers to shared URLs, and SHALL limit share telemetry to purpose-declared source kind, presentation, coarse outcome, and abuse-prevention data under the foundation retention contract.

#### Scenario: Visitor opens an external destination helper
- **WHEN** a Share action opens a third-party destination
- **THEN** the destination receives no source-path referrer beyond the documented policy and no platform-generated recipient, anonymous-author, or Account token

#### Scenario: Native share promise resolves
- **WHEN** the browser reports completion of a fire-and-forget share request
- **THEN** the system records at most a coarse handoff outcome and does not claim the content was posted, opened, or converted

### Requirement: Canonical sharing failures expose no hidden state
The system SHALL provide literal unavailable, source-updated, metadata-unavailable, crawler-blocked, clipboard-denied, native-share-unavailable, canceled, blocked, and policy-outage behavior without falling back to stale content or private fields.

#### Scenario: Policy projection is unavailable
- **WHEN** the system cannot authorize the current public projection
- **THEN** it fails closed for object-specific metadata and sharing mutations, preserves a safe ordinary source retry where allowed, and never guesses from a cached author or source revision

#### Scenario: Unknown and confidential identifiers are probed
- **WHEN** a visitor requests a nonexistent, pending, removed, or confidential share target
- **THEN** the system returns comparable generic behavior that does not reveal whether the object, author, report, Block, or Moderation Case exists
