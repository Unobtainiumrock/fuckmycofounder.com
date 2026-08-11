## ADDED Requirements

### Requirement: Canonical quality commands are repository-owned
The repository SHALL expose stable root commands for formatting and a separate non-mutating formatting check, linting, typechecking, unit and component tests, Postgres integration tests, selected end-to-end tests, production builds, architecture checks, source-size checks, and strict validation of all OpenSpec changes.

#### Scenario: Agent prepares a handoff
- **WHEN** an implementation agent finishes a task or change
- **THEN** it runs the applicable canonical root commands and reports exact outcomes rather than substituting package-local approximations

#### Scenario: Command changes
- **WHEN** the repository replaces a tool or workspace layout
- **THEN** the root command remains the documented interface or every authoritative instruction and CI caller changes atomically

### Requirement: Pull requests pass a clean fail-closed quality gate
Pull-request CI SHALL install exactly from the committed lockfile, run strict OpenSpec validation, non-mutating formatting checks, linting, dependency-direction checks, typechecking, builds, tests, source-size checks, and generated-artifact cleanliness, and SHALL preserve the exit status of every piped command.

#### Scenario: Upstream command fails inside a pipeline
- **WHEN** a CI or hook command pipes output through another process
- **THEN** the gate preserves the upstream nonzero status and fails instead of reporting a false green

#### Scenario: Generated source changes during verification
- **WHEN** build or generation leaves a tracked diff
- **THEN** CI fails and requires the generated artifacts to be intentionally committed or the nondeterminism fixed

### Requirement: Test layers have distinct proof responsibilities
Unit tests SHALL prove pure policy and state transitions, component tests SHALL prove isolated UI behavior and accessibility, Postgres integration tests SHALL prove transactions, constraints, projections, and migrations, and end-to-end tests SHALL prove only critical cross-layer journeys.

#### Scenario: Domain rule is added
- **WHEN** a pure lifecycle or eligibility rule changes
- **THEN** a fast domain-interface test proves its positive, negative, and unavailable-state behavior without a browser

#### Scenario: Protected user journey is added
- **WHEN** a change adds a critical signed-out through protected-action flow
- **THEN** a selected browser test proves the integrated journey without duplicating every domain edge case at the browser layer

### Requirement: Sensitive projections have noninterference contracts
Verification SHALL assert that public and recipient-scoped outputs cannot reveal private Account identity, anonymous-author linkage, reporter identity, Block direction, moderation evidence, risk rules, message content, or Open To state outside their authorized interfaces.

#### Scenario: New downstream surface is added
- **WHEN** a Feed, notification, export, metadata, sharing, analytics, or moderation consumer is introduced
- **THEN** projection contract tests enumerate its allowed fields and prove forbidden fields and stable identifiers are absent

#### Scenario: Error path is exercised
- **WHEN** a sensitive dependency is blocked, deleted, unavailable, or unauthorized
- **THEN** tests prove the error shape does not distinguish hidden states or identities

### Requirement: Database verification uses disposable Postgres
The repository SHALL provide an isolated local and CI Postgres harness that applies every migration from empty state, supports transaction and concurrency tests, resets without shared production data, and cannot target a production database by default.

#### Scenario: Integration suite starts
- **WHEN** Postgres-backed tests run
- **THEN** they create or select an isolated disposable database, verify its identity, apply migrations, and reject configured production hosts or databases

#### Scenario: Migration chain is incomplete
- **WHEN** a clean database cannot reach the current schema using committed migrations
- **THEN** the integration gate fails before application tests proceed

### Requirement: Architecture and hygiene checks prevent new debt
Automated checks SHALL reject new circular imports, source files above the hard cap, soft-limit files without a reason, unused exports, unsafe TypeScript, unhandled Promises, excessive complexity, and dependency-direction violations, with no initial allowlist for greenfield network code.

#### Scenario: Agent proposes an allowlist entry
- **WHEN** new network code violates a hygiene gate
- **THEN** the change fixes the design or receives an explicit reviewed exception with owner, reason, and removal condition rather than silently growing a baseline

#### Scenario: Historical static file is outside maintained scope
- **WHEN** a gate intentionally excludes a legacy or generated path
- **THEN** the exclusion is narrow, documented, and cannot substitute an unrelated file or hide new network-code debt

### Requirement: OpenSpec task state is evidence-bound
Automation and review SHALL reject marking an OpenSpec task complete unless the scoped implementation exists and the task's named verification evidence is present, while strict format validation alone SHALL NOT count as implementation proof.

#### Scenario: Strict validation passes before code exists
- **WHEN** an OpenSpec change validates with every implementation task unchecked
- **THEN** it remains proposal-ready and is not reported as implemented

#### Scenario: Task checkbox changes
- **WHEN** a pull request checks an implementation task
- **THEN** review can trace it to scoped code and a passing verification result in that pull request

### Requirement: Deployment and provider acceptance remain separate gates
The delivery workflow SHALL keep repository completion, deployed environment health, migration application, crawler behavior, authentication providers, email delivery, object storage, and other live-provider acceptance as separately named evidence classes.

#### Scenario: Share metadata passes repository tests
- **WHEN** generated metadata and images pass local snapshots
- **THEN** the change still requires deployed anonymous fetch and live destination-preview acceptance before claiming external sharing works

#### Scenario: Deployment authority is absent
- **WHEN** repository implementation is complete but no authorized operator performs deployment or provider setup
- **THEN** the change stops at repository proof with explicit rollout tasks remaining
