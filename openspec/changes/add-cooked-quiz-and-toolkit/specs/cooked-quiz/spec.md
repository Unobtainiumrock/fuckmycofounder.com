# Cooked Quiz — Spec Delta

## ADDED Requirements

### Requirement: The quiz diagnoses the partnership, never a person
The Cooked Quiz SHALL frame every question and every result element as being
about the partnership the taker is inside of. Results SHALL NOT name, type,
or diagnose an individual, and SHALL NOT assign archetypes (docs/adr/0001).

#### Scenario: Completing the quiz
- **WHEN** a taker completes all questions
- **THEN** the result describes the partnership's condition ("this partnership
  is N% cooked") and no person is characterized

### Requirement: Client-side rules-based scoring
The quiz SHALL score a fixed set of structured questions (~12: multiple
choice / scale) with a weighted rubric computed entirely in the browser,
making no network requests.

#### Scenario: Offline completion
- **WHEN** the quiz is taken with no network connectivity (beyond initial page load)
- **THEN** scoring and the full result render successfully

### Requirement: Four-part result package
A completed quiz SHALL present: (1) the Cooked Score as a percentage, (2) a
deadpan condition label, (3) the top 3 risk factors derived from the taker's
worst-scoring answer clusters, worded as factual mirrors of the answers given,
and (4) exactly one "homework" link to the Toolkit treatment matching the
worst risk factor.

#### Scenario: High-risk exit cluster
- **WHEN** a taker's worst-scoring answers concern exit terms
- **THEN** the risk factors name the exit gap and the homework link targets
  the Exit Conversation checklist

### Requirement: Results are shareable by fragment link
The quiz SHALL encode the result in the URL fragment so a recipient opening
the link sees the same result page, with no result data transmitted to any
server. Malformed or oversized fragments SHALL fail closed to a fresh quiz.

#### Scenario: Recipient opens a result link
- **WHEN** a shared result URL is opened in another browser
- **THEN** the identical score, label, and risk factors render client-side

#### Scenario: Tampered fragment
- **WHEN** the fragment fails to decode or validate
- **THEN** the page falls back to the quiz start with no error leakage

### Requirement: Homepage entry point
The homepage mode grid SHALL present the quiz as its second working mode,
replacing the disabled "Spicy Mode" placeholder card and linking to /cooked/.

#### Scenario: Homepage visit
- **WHEN** the homepage renders
- **THEN** both mode cards are functional and no disabled placeholder remains
