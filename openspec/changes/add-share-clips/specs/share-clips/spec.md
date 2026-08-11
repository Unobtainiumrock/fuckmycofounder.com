## ADDED Requirements

### Requirement: Launch Share Clips support Profiles, Reviews, and Comments only
The system SHALL generate a Share Clip only from a currently eligible public Profile, `published` Review, or `published` Comment with eligible parent context and SHALL reject Posts, Profile Subject Responses, Feed items, Exhibits alone, Profile Aggregates alone, drafts, and private objects as Clip sources.

#### Scenario: Signed-out visitor clips public text
- **WHEN** a signed-out visitor selects **Make a clip** on an eligible Profile, Review, or Comment and does not add an Exhibit
- **THEN** the system permits rate-limited preview and export without Account creation or a new public content object

#### Scenario: Visitor requests a Post Clip
- **WHEN** any client requests a Clip whose source is a Post or Profile Subject Response
- **THEN** the system rejects the unsupported source literally and preserves its ordinary canonical Share link and object-specific unfurl

#### Scenario: Comment parent is unavailable
- **WHEN** a Comment remains stored but its root Review or Post cannot be shown publicly
- **THEN** the system does not generate or serve a Comment Clip without that context

### Requirement: Review Clips use exact bounded testimony
The system SHALL let a sharer select one contiguous span of 20–360 Unicode grapheme clusters from one current approved qualitative Review response, or the whole response when shorter; SHALL preserve its characters, order, and punctuation; and SHALL label it **Exact excerpt**.

#### Scenario: Sharer selects a valid line
- **WHEN** the selection stays in one qualitative field, does not split a grapheme or word, and current policy finds it interpretable with required context
- **THEN** the Clip reproduces those exact words and marks omitted source text with renderer-supplied omission marks without adding a paraphrase

#### Scenario: Client changes selected words
- **WHEN** a client inserts, removes, reorders, autocorrects, translates, or substitutes source characters inside the selected span
- **THEN** the system rejects the render instead of generating an edited quotation

#### Scenario: Selection would materially misrepresent the source
- **WHEN** the chosen fragment removes a necessary negation, attribution, condition, or nearby qualifier identified by the documented context policy
- **THEN** the system requires a wider exact selection or declines Clip generation without rewriting the Review

### Requirement: Review Clips retain filed-assessment context
The system SHALL include the reviewed Profile, relationship direction, Relationship Verification state, current named or anonymous attribution, source publication or edit state, canonical case identifier, domain, and canonical destination in every Review Clip.

#### Scenario: Anonymous Review is clipped
- **WHEN** an eligible anonymous Review produces a Clip
- **THEN** it renders only **Anonymous reviewer** with no photo, Public Byline, Profile link, message target, stable pseudonym, Account identifier, cross-Review history, or hidden-author clue

#### Scenario: Optional Review context is selected
- **WHEN** the sharer enables Run it back or **Community context**
- **THEN** Run it back uses the exact Review answer and Community context includes the current net Review Vote, Award count, and Comment count together, off by default, without selectable omission of an unfavorable net score

#### Scenario: Community metrics change before export
- **WHEN** a Vote, Award, Comment, moderation, or integrity state changes after preview but before render commits
- **THEN** the system refreshes the entire bundled context or requires confirmation and never exports a mixed-version count set

### Requirement: Profile Clips preserve complete aggregate disclosures
The system SHALL render a Profile Clip as a dossier extract with the current canonical name, current approved photo or neutral placeholder, Review volume, safe relationship mix, canonical case identifier, domain, and up to two complete currently eligible aggregate panels.

#### Scenario: Aggregate panel is eligible
- **WHEN** the sharer selects an eligible capability or Run it back panel
- **THEN** the Clip includes its full public distribution, denominator, coverage, direction, and applicable **Early signal** or **Concentrated perspective** disclosure without a decimal mean, cross-Profile comparison, or Founder Score

#### Scenario: Aggregate field is sparse or stale
- **WHEN** a selected panel becomes suppressed, insufficient, updating, unavailable, or source-version stale
- **THEN** the system omits it or requires a refreshed selection and does not freeze, infer, zero-fill, or export the prior value

#### Scenario: Profile has no eligible aggregate
- **WHEN** a public Profile remains eligible but no aggregate panel may display
- **THEN** the system may generate a minimal Profile Clip from current public identity and Review context without inventing an assessment or empty score

### Requirement: Comment Clips preserve root and reply context
The system SHALL reproduce a Comment whole when it contains at most 360 grapheme clusters or one exact contiguous 20–360-grapheme span when longer and SHALL include up to 180 exact graphemes of required root or reply-target context.

#### Scenario: Named Comment is clipped
- **WHEN** an eligible ordinary Comment is selected
- **THEN** the Clip uses the current Public Byline, labels the Comment as a margin annotation, identifies its Review or Post root, and links to the canonical Comment

#### Scenario: Review-author Comment is clipped
- **WHEN** the anonymous Review author participates as `Review author` in that Review thread
- **THEN** the Clip uses only `Review author` within that Review context and provides no Public Byline, Account, Profile, message, or cross-thread linkage

#### Scenario: Reply is clipped
- **WHEN** a reply needs its selected target to remain understandable
- **THEN** the Clip includes an exact bounded target excerpt and root identity without recursively reproducing the entire thread or converting Comments into Feed items

#### Scenario: Required context is deleted or misleadingly cropped
- **WHEN** the parent becomes a tombstone or the bounded context cannot represent the exchange safely
- **THEN** the system declines new Clip generation rather than presenting the reply as a standalone statement

### Requirement: Presentation choices cannot alter mandatory meaning
The system SHALL let a sharer choose only a supported format, object-specific layout variant, safe photo or Exhibit crop, allowed aggregate panels, and optional Review context modules and SHALL lock source words, object type, attribution, disclosure labels, relationship context, provenance, domain, and case identifier.

#### Scenario: Sharer changes format
- **WHEN** a Clip changes among square, story, and link-preview presets
- **THEN** layout may reflow but the source projection, selected words, disclosure labels, and destination remain identical

#### Scenario: Crop removes required context
- **WHEN** a client attempts to crop or cover mandatory text, attribution, domain, case identifier, disclosure, or context
- **THEN** the system constrains or rejects the crop and never renders a deceptive detached artifact

#### Scenario: User requests arbitrary editing
- **WHEN** a sharer attempts freeform text, filters, stickers, canvas positioning, fake stamps, translated source words, or uploaded replacement branding
- **THEN** the system rejects those unsupported edits and keeps the bounded Caseboard template

### Requirement: Clips use three deterministic launch presets
The system SHALL render optimized PNG output at 1080×1080 square, 1080×1920 story, and 1200×627 link-preview dimensions, each no larger than 5 MB, from the same authorized source projection and versioned preset.

#### Scenario: Same Clip is rendered twice
- **WHEN** source revision, format, presentation choices, fonts, assets, and render-policy version are identical
- **THEN** the server produces byte-identical output and the same restricted provenance record

#### Scenario: Story output is rendered
- **WHEN** the 9:16 preset is selected
- **THEN** mandatory text and provenance stay outside the configured top and bottom overlay-safe regions and remain legible in the mobile preview

#### Scenario: Link-preview output is rendered
- **WHEN** the 1200×627 preset is selected
- **THEN** the output preserves the full context contract at preview density and does not shrink mandatory source text below the accessible preset floor

### Requirement: Clip provenance survives ordinary cropping and detachment
The system SHALL display the recognizable first-party domain and compact canonical case identifier in every Clip and SHALL encode the same canonical HTTPS source URL in any QR or provenance reference without a third-party shortener or sharer token.

#### Scenario: Square or story Clip includes a QR
- **WHEN** the default QR is rendered
- **THEN** it is redundant with visible domain and case identity, has sufficient quiet space and contrast, and resolves to the exact canonical source without tracking

#### Scenario: Link-preview omits the QR
- **WHEN** the preview preset cannot preserve QR and text legibility together
- **THEN** it may omit the QR while retaining the visible domain, case identifier, clickable canonical page, and parallel text alternative

### Requirement: Exhibits are excluded unless explicitly and currently redistributable
The system SHALL exclude Review Exhibits by default and SHALL include at most one only when an active signed-in Account explicitly selects a current approved redacted derivative whose rights attestation permits redistribution and current privacy, safety, and moderation policy approves the Clip use.

#### Scenario: Sharer enables an eligible Exhibit
- **WHEN** the higher-trust protected action passes and the selected Exhibit remains eligible
- **THEN** the system labels it **Exhibit**, crops only within a safe approved derivative, keeps testimony and context foregrounded, and records the source and render versions privately

#### Scenario: Public image lacks redistribution authority
- **WHEN** an Exhibit is merely viewable, linked, licensed only for another use, privacy-limited, disputed, or missing a redistribution basis
- **THEN** the system keeps it excluded and offers a text-only Clip without implying the sharer can grant rights

#### Scenario: Exhibit becomes disputed
- **WHEN** rights, privacy, confidentiality, intimate-imagery, or personal-safety review limits the Exhibit
- **THEN** new generation and platform-hosted media serving stop immediately while otherwise eligible Review text may remain clip-capable

### Requirement: Clip generation always rechecks authoritative state
The system SHALL reauthorize source, revision, attribution, Profile, parent, aggregate, metrics, media, Block, and trust-safety state before preview, render commit, hosted serving, and metadata use and SHALL NOT serve stale output after a platform-controlled subtractive change.

#### Scenario: Source is edited after selection
- **WHEN** an approved source revision changes and the selected span no longer belongs to the current revision
- **THEN** the old hosted Clip becomes unavailable, the composer requires a new exact selection, and the system does not silently quote old words or map them onto new text

#### Scenario: Named Review becomes anonymous
- **WHEN** a Review steps down to **Anonymous reviewer**
- **THEN** every platform-controlled named preview and Clip is revoked or regenerated only from the anonymous projection before future serving, without retaining the old Public Byline in URLs or metadata

#### Scenario: Source is deleted, withdrawn, limited, or removed
- **WHEN** any authoritative state makes a Profile, Review, Comment, or required parent ineligible
- **THEN** the system stops new generation and hosted serving, purges controlled caches best-effort, and leaves only the canonical generic source outcome allowed by that capability

#### Scenario: Downloaded file already escaped control
- **WHEN** a source changes after a Clip was downloaded, screenshotted, or cached by a third party
- **THEN** the platform updates its live source and controlled assets, warns that external copies cannot be recalled, and never claims deletion reached those copies

### Requirement: Native file sharing is optional and fallbacks remain usable
The system SHALL invoke native Clip file sharing only from a current user gesture in a secure allowed context after verifying support for the exact final `File[]` payload and SHALL always retain Download clip, Copy link, selectable link, and Copy suggested alt text.

#### Scenario: Browser supports link but not file sharing
- **WHEN** native share exists but `canShare` rejects the generated PNG payload
- **THEN** the system does not invoke the unsupported file branch and keeps download, canonical link, and text alternatives available

#### Scenario: Native sharing is canceled
- **WHEN** the browser returns cancellation or no target
- **THEN** the Clip and source remain unchanged, fallbacks remain visible, and the system does not record a publication or failure claim

#### Scenario: Clip render fails
- **WHEN** deterministic rendering or durable asset delivery fails
- **THEN** the system preserves the selected source and canonical Share link, offers a safe retry, and never substitutes stale bytes or private source data

### Requirement: Every Clip has a parallel accessible text contract
The system SHALL present the Clip's object type, subject or root context, exact excerpt, public attribution, disclosure labels, and canonical destination as real selectable text beside the image and SHALL supply a matching `og:image:alt` and copyable suggested image description.

#### Scenario: Screen-reader user opens the composer
- **WHEN** a Clip preview is displayed
- **THEN** assistive technology can read the full equivalent source and context, format choice, eligibility, render status, and actions without extracting text from pixels or scanning the QR

#### Scenario: User shares a file to another platform
- **WHEN** Web Share cannot set that destination's image alternative text
- **THEN** the system offers the suggested description for copying and does not claim the destination received or applied it

#### Scenario: Reduced motion is requested
- **WHEN** `prefers-reduced-motion` is active or an action is keyboard-initiated
- **THEN** the tear-off and stamp-down use only the DESIGN-defined reduced-motion behavior and never gate completion on animation

### Requirement: Clip abuse controls protect people and source integrity
The system SHALL rate-limit generation and apply source and selection checks for harassment, doxxing, private data, copyright, impersonation, misleading excerpts, manipulated media, spam, and coordinated distribution without treating negativity or popularity alone as abuse.

#### Scenario: Selection spotlights prohibited private data
- **WHEN** source moderation, a report, or Clip-specific inspection identifies private contact, location, credential, financial, health, intimate, or unrelated third-party data in the selected text or media
- **THEN** the system withholds the Clip, routes the exact source revision and selection through trust-safety, and does not repeat the data in notices or previews

#### Scenario: Hosted Clip is reported as misleading
- **WHEN** an Account reports a Clip for deceptive cropping, omitted context, impersonation, rights, or manipulated media
- **THEN** the system attaches the render parameters and source revision to a Moderation Case, may revoke the controlled asset, and applies any content decision to the owning source without creating a separate popularity-bearing post

#### Scenario: Accounts mass-generate hostile variants
- **WHEN** generation volume, repeated targets, selections, device, network, or Account signals indicate spam or coordinated harassment
- **THEN** centralized policy slows or denies generation, preserves source visibility independently, and records restricted signals without public accusation or ranking effects

### Requirement: Mobile, unavailable, and policy states remain literal
The system SHALL use a full-screen mobile composer with source selection followed by a locked preview and safe controls and SHALL expose literal source-unavailable, parent-unavailable, selection-invalid, aggregate-stale, media-ineligible, render-failed, blocked, rate-limited, and policy-unavailable states without hidden detail.

#### Scenario: Source changes while mobile sheet is open
- **WHEN** authoritative state or revision no longer matches the preview
- **THEN** the system prevents export, identifies that the source changed, preserves only still-safe presentation choices, and returns the user to current source context

#### Scenario: Policy evaluation is unavailable
- **WHEN** the system cannot authorize Clip generation, optional Exhibit use, or hosted serving
- **THEN** it fails closed for the affected action, preserves ordinary canonical link sharing when independently authorized, and never falls back to cached identity, text, metrics, aggregate, or media
