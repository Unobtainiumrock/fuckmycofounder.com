## ADDED Requirements

### Requirement: The launch Assessment uses one canonical metric pool
The system SHALL use the exact display labels **LARP**, **Domain Expertise**, **On Time**, **Taste**, **GTM**, **Charisma**, and **Run it back** and SHALL NOT rename **On Time** to `Timeliness`, append `Score` to every label, or introduce a universal Founder Score.

#### Scenario: Reviewer opens the Assessment
- **WHEN** a complete Relationship Claim determines the review context
- **THEN** the system presents the applicable canonical labels with literal behavioral helper copy rather than invented founder metaphors

#### Scenario: Assessment renders publicly
- **WHEN** an approved Review displays its Assessment
- **THEN** the system shows each eligible answer with the Review's relationship context and does not sum the answers into a person-quality or startup-success prediction

### Requirement: Assessment depth follows observed work rather than Profile role
The system SHALL offer LARP, Domain Expertise, On Time, and Charisma for every Review; SHALL require Run it back; SHALL offer Taste and GTM when the reviewer indicates direct exposure to the applicable work; and SHALL use relationship direction only to tailor examples without changing metric meaning.

#### Scenario: Reviewer observed product and commercial work
- **WHEN** the reviewer confirms direct exposure to product, brand, strategic, sales, fundraising, demand, or distribution decisions
- **THEN** the system presents the applicable Taste and GTM prompts using the same canonical scales as every other relationship type

#### Scenario: Reviewer did not observe specialized work
- **WHEN** relationship and exposure answers provide no first-hand basis for Taste or GTM
- **THEN** the system does not force a numeric or favorable answer and records those dimensions as not observed for that Review

#### Scenario: Profile represents an investor or operator
- **WHEN** the subject is not acting as a founder in the reviewed relationship
- **THEN** the system evaluates only behavior the reviewer observed in that professional context and does not substitute a role-specific moral, personality, or technical-founding scorecard

### Requirement: Every capability score supports Not enough exposure
The system SHALL provide **Not enough exposure** for LARP, Domain Expertise, On Time, Taste, GTM, and Charisma and SHALL exclude that answer from numerical or categorical summaries while preserving it as an explicit non-observation.

#### Scenario: Reviewer cannot responsibly score a dimension
- **WHEN** the reviewer selects **Not enough exposure**
- **THEN** the system accepts the Review without guessing, displays no score for that dimension on the Review, and retains the non-observation for assessment completeness and later eligibility rules

#### Scenario: Reviewer skips every capability score
- **WHEN** all six capability dimensions are **Not enough exposure**
- **THEN** the system requires the qualitative testimony and Run it back answer but does not fabricate an Assessment shape or reject a genuinely first-hand relationship solely for narrow exposure

### Requirement: LARP is an inverse observed-substance score
The system SHALL ask how much the subject's startup persona was backed by work or results the reviewer personally observed, SHALL orient the scale visibly from **Legit** to **LARP**, and SHALL make a higher LARP value mean a larger observed gap between presentation and substance.

#### Scenario: LARP answer is displayed
- **WHEN** a reviewer selects an eligible LARP position
- **THEN** the Review renders both the label and directional anchors so a reader cannot mistake a high LARP value for praise

#### Scenario: Reviewer speculates about motives
- **WHEN** the LARP explanation diagnoses intent or personality without describing observed claims, work, or results
- **THEN** the system asks for behavioral first-hand context and does not treat the speculation as the score's evidentiary basis

### Requirement: Domain Expertise measures relevant understanding
The system SHALL define **Domain Expertise** as observed understanding of the problem, users, industry, technology where relevant, and operating constraints and SHALL NOT equate it with software engineering credentials or use the narrower label `Technical`.

#### Scenario: Nontechnical collaborator is assessed
- **WHEN** technical implementation was not part of the subject's work in the relationship
- **THEN** the reviewer assesses the relevant domain decisions they observed or selects **Not enough exposure** without an automatic penalty

### Requirement: On Time measures managed commitments
The system SHALL define **On Time** as showing up when expected, delivering when promised, and surfacing and resetting delays before they become surprises, and SHALL NOT define it as raw speed, permanent availability, or never encountering external delay.

#### Scenario: Deadline changes responsibly
- **WHEN** an external event changes a deadline and the subject surfaces the risk, resets the commitment clearly, and meets the new commitment
- **THEN** the prompt permits a strong On Time answer rather than automatically treating the original date change as failure

### Requirement: Taste, GTM, and Charisma stay behaviorally distinct
The system SHALL define **Taste** as knowing what was worth building, what to cut, and what good looked like; **GTM** as finding demand and turning it into customers or repeatable distribution, with `Go to market` spelled out in helper copy; and **Charisma** as making people want to listen, believe, join, or move without treating underlying claims as true.

#### Scenario: Charisma and LARP diverge
- **WHEN** a reviewer observed strong interpersonal pull and weak substance behind claims
- **THEN** the system permits a strong Charisma answer and a high LARP answer without resolving the contradiction into one overall value

#### Scenario: Reviewer confuses fundraising presence with GTM
- **WHEN** the described exposure shows only interpersonal attention without customers, demand, distribution, or repeatable commercial movement
- **THEN** the system keeps Charisma separate and asks for GTM-specific behavior or **Not enough exposure**

### Requirement: Run it back is a standalone relationship verdict
The system SHALL ask **Would you run it back?** using exactly **Absolutely**, **Maybe, with better paperwork**, or **Fuck no**, SHALL require one answer for every Review, and SHALL NOT derive it from the capability scores.

#### Scenario: Scores and verdict differ
- **WHEN** the reviewer selects strong capability answers but would not choose another close working relationship
- **THEN** the system preserves both the capability shape and the independent Run it back answer without changing either one

#### Scenario: Run it back displays
- **WHEN** a Review is published
- **THEN** the system displays the answer with directional relationship context and never as an objective universal verdict about the Profile subject

### Requirement: Extreme answers require concrete support
The system SHALL require the Review's qualitative testimony to describe a concrete first-hand behavior or event that supports any endpoint capability answer or **Fuck no** Run it back answer and SHALL NOT require the author to disclose confidential evidence publicly.

#### Scenario: Endpoint has no supporting testimony
- **WHEN** a reviewer selects an extreme value but the qualitative account contains no connected observed basis
- **THEN** the system identifies the unsupported dimension and asks for a bounded example or a less certain answer before submission

### Requirement: Assessment changes follow Review revision policy
The system SHALL treat every Assessment edit as a material Review revision, preserve prior approved values in restricted history, and apply the current Review, Relationship Claim, and moderation states to public display.

#### Scenario: Author changes an Assessment after publication
- **WHEN** the author edits a capability answer or Run it back verdict
- **THEN** the system submits the changed Assessment with its Review revision and leaves the last approved values public until moderation approves or limits them

#### Scenario: Review is withdrawn, limited, or removed
- **WHEN** the Review is no longer eligible for ordinary public display
- **THEN** the system withholds its Assessment and later aggregation eligibility without exposing the reason, prior values, or moderator notes

### Requirement: Assessment failures do not create partial truth
The system SHALL validate Assessment completeness and scale versions atomically, SHALL preserve a retryable draft when processing fails, and SHALL NOT publish partial answers, mixed scale versions, or default midpoint values.

#### Scenario: Assessment version changes during a draft
- **WHEN** a saved draft uses an obsolete prompt or scale version at submission
- **THEN** the system shows the changed prompt and requires the reviewer to confirm or answer it before submission

#### Scenario: Assessment storage fails
- **WHEN** the system cannot durably store the complete Assessment with the Review revision
- **THEN** it publishes neither the Review nor a partial Assessment and returns a safe retry path
