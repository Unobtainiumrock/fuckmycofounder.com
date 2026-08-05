## ADDED Requirements

### Requirement: Public Profile search requires no Account
The system SHALL let signed-out visitors search published Profiles by name without creating an Account, completing onboarding, or providing contacts.

#### Scenario: Signed-out visitor searches a name
- **WHEN** a visitor submits a valid name query
- **THEN** the system returns eligible public Profile matches without an authentication gate or a prompt to import contacts

#### Scenario: Query is empty or invalid
- **WHEN** a visitor submits only whitespace, unsupported control characters, or a query outside documented length limits
- **THEN** the system performs no lookup and gives a literal instruction to enter a person's name

### Requirement: Search matches names without inventing identity
The system SHALL normalize case, spacing, punctuation, and diacritics, support bounded typo-tolerant name matching, distinguish same-name Profiles by photo and stable identity, and SHALL NOT infer or publish an employer, title, location, legal name, former name, Account, or Public Byline as a Profile field.

#### Scenario: Query differs only in presentation
- **WHEN** a query differs from a canonical name only by case, spacing, punctuation, or diacritic form
- **THEN** the matching published Profile remains discoverable while results render the accepted canonical name

#### Scenario: Two people share a name
- **WHEN** multiple eligible Profiles have the same canonical name
- **THEN** the system returns each distinct Profile with its photo, stable identity, and public claimed state without merging them or inventing extra identity fields

### Requirement: Search results expose only public projections
The system SHALL return only published Profiles and public result fields, SHALL resolve merged records to their canonical target, and SHALL exclude pending, removed, and policy-hidden Profiles without revealing why a result is absent.

#### Scenario: Result matches a restricted registry record
- **WHEN** a query matches a pending, removed, blocked-from-targeted-discovery, or otherwise nonsearchable Profile
- **THEN** the system omits that record and does not reveal its existence, lifecycle state, evidence, claimant, proposer, or block direction

#### Scenario: Result matches a merged source
- **WHEN** an indexed or cached query targets a merged Profile identity
- **THEN** the system returns at most the canonical surviving Profile and does not duplicate result counts or expose merge lineage

### Requirement: Profile creation begins with a current search
The system SHALL offer **Add this person** only after a nonempty current name search completes, SHALL present likely matching Profiles before the action, and SHALL require the proposer to confirm that none represents the intended person.

#### Scenario: No result is the intended person
- **WHEN** search completes and the visitor confirms that the visible likely matches are different people
- **THEN** the system carries the searched name into the Account-backed Profile proposal without carrying any selected result's private or public identity data

#### Scenario: Direct creation route is opened
- **WHEN** a visitor opens a stale, direct, or fabricated create route without a completed current search token
- **THEN** the system routes them to name search before accepting a Profile proposal

#### Scenario: Search is unavailable
- **WHEN** authoritative search, duplicate, or policy evaluation cannot complete
- **THEN** the system offers retry and does not expose **Add this person** as a bypass

### Requirement: Duplicate screening is conservative and non-biometric
The system SHALL screen a Profile proposal using normalized name similarity, exact or near-duplicate asset hashes, provenance references, stable identifiers, and prior moderator decisions, and SHALL NOT use facial recognition or biometric identity templates at launch.

#### Scenario: Strong existing match is found
- **WHEN** the submitted name, image asset, or corroborating reference maps to an existing canonical Profile
- **THEN** the system stops duplicate publication, opens the existing Profile, and preserves any eligible pending intent against that canonical identifier

#### Scenario: Similarity is uncertain
- **WHEN** signals suggest a duplicate but cannot distinguish a same-name different person
- **THEN** the system keeps the proposal pending for human review and does not auto-merge or publish it

#### Scenario: Distinct same-name person is supported
- **WHEN** evidence establishes that the proposal represents a different eligible person despite a matching name
- **THEN** the system permits a separate Profile with its own opaque identifier and canonical URL

### Requirement: Concurrent creation produces one canonical outcome
The system SHALL resolve concurrent proposals for the same person atomically so approval produces no more than one published canonical Profile.

#### Scenario: Two matching proposals arrive together
- **WHEN** moderation approves one proposal while another unresolved proposal targets the same supported identity
- **THEN** the system attaches or closes the later proposal as a duplicate, directs both proposers to the canonical Profile, and does not expose either Account to the other

### Requirement: Search respects blocks without claiming global invisibility
The system SHALL omit a claimed Profile from targeted signed-in search and recommendations between Accounts with a foundation Block, SHALL NOT identify which Account initiated the Block, and SHALL preserve the independently public logged-out visibility of a published Profile.

#### Scenario: Blocking Account searches while signed in
- **WHEN** a name query would otherwise return the other Account's claimed Profile
- **THEN** the system omits targeted discovery and direct-owner actions using the same empty-result behavior as another filtered result

#### Scenario: Visitor searches while logged out
- **WHEN** the same otherwise published Profile matches a logged-out query
- **THEN** the system returns it according to public visibility and does not promise that an Account Block is a global takedown

### Requirement: Search failures and throttling are safe and literal
The system SHALL distinguish no matches from temporary unavailability for the visitor, rate-limit abusive enumeration, and SHALL NOT convert an error or throttled response into evidence that a Profile exists or is hidden.

#### Scenario: Search has no public matches
- **WHEN** a valid query completes successfully with no eligible public results
- **THEN** the system shows a genuine empty state and, when duplicate checks are authoritative, offers the search-before-create path

#### Scenario: Search backend fails
- **WHEN** the system cannot complete the query
- **THEN** it shows a retryable unavailable state, returns no fabricated results or false empty state, and withholds the creation action

#### Scenario: Client enumerates names at abusive volume
- **WHEN** requests exceed the documented public-search safety threshold or match an automated scraping signal
- **THEN** the system throttles or challenges further requests with a generic response and records a proportionate abuse signal without publishing query history

### Requirement: Search data is purpose-limited
The system SHALL collect only the query, coarse operational context, and abuse signals needed to provide and protect search, SHALL assign raw queries a documented short retention period before collection, and SHALL NOT expose a person's search history or use it as a public affiliation, endorsement, or Profile field.

#### Scenario: Ordinary query is logged for operations
- **WHEN** the search system records a query for quality, reliability, or abuse prevention
- **THEN** access is restricted, retention and deletion are applied by declared class, and the record is not joined into public Profile or social-graph data

#### Scenario: Bulk access is requested
- **WHEN** a client requests an undocumented bulk export, unrestricted enumeration cursor, or private registry fields
- **THEN** the system denies the request while leaving ordinary bounded public name search available
