# Toolkit — Spec Delta

## ADDED Requirements

### Requirement: Three treatments plus index
The site SHALL serve a Toolkit at /toolkit/ with an index page and three
treatment pages: /toolkit/awkward-questions/ (the pre/early-partnership
conversation script), /toolkit/prenup/ (equity, vesting, spending authority,
and exit-terms checklist), and /toolkit/exit/ (the partnership unwind
checklist). All pages are static HTML on the existing stylesheet system.

#### Scenario: Direct navigation
- **WHEN** any toolkit URL is opened directly
- **THEN** the page renders complete, styled content with site navigation

### Requirement: Every quiz outcome has a treatment
Each Cooked Quiz score band and each risk factor SHALL map to exactly one
existing toolkit treatment, so every homework link resolves.

#### Scenario: Any quiz completion
- **WHEN** any combination of quiz answers is submitted
- **THEN** the homework link targets a toolkit page that exists

### Requirement: Toolkit is reachable from every page
The site header and footer SHALL link to the Toolkit from all pages.

#### Scenario: Arriving on the homepage
- **WHEN** a visitor lands on any page
- **THEN** a Toolkit link is present in header and footer navigation
