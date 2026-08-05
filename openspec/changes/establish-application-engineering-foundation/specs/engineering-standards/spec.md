## ADDED Requirements

### Requirement: Repository instructions have an authoritative reading order
The repository SHALL provide root implementation instructions that require an agent to read the product definition, canonical glossary, design system, active OpenSpec proposal, design, capability deltas, tasks, accepted dependencies, code standards, and exact files it will edit before non-trivial implementation.

#### Scenario: Agent receives one OpenSpec task
- **WHEN** an implementation agent begins a substantive task
- **THEN** it identifies the active change and task, reads the authoritative documents and target code, states its scope and verification, and does not treat historical exploration as current truth

#### Scenario: Instructions conflict
- **WHEN** a lower-level note conflicts with the approved OpenSpec or root repository instructions
- **THEN** the agent follows the higher-authority contract and reports the conflict instead of silently choosing behavior

### Requirement: Product behavior remains spec-first during implementation
The repository SHALL treat approved OpenSpec behavior as the implementation contract, SHALL require coherent proposal, design, spec, and task updates before externally observable behavior diverges, and SHALL prohibit checking off a task before its implementation and named verification pass.

#### Scenario: Code reveals an unspecified product choice
- **WHEN** an implementation task reaches a product behavior not resolved or excluded by the active change
- **THEN** implementation pauses at that decision, the OpenSpec artifacts are updated and strictly revalidated, and code resumes only after the contract is coherent

#### Scenario: Partial task implementation exists
- **WHEN** code compiles but the task's required test or acceptance evidence is missing
- **THEN** the task remains unchecked and the handoff names the missing proof

### Requirement: Changes are isolated and surgical
The repository SHALL use one isolated worktree, branch, and pull request for each substantive change, SHALL start from current approved planning truth and a fresh mainline base, and SHALL exclude unrelated edits, refactors, formatting churn, secrets, and another agent's work.

#### Scenario: Active checkout is dirty
- **WHEN** implementation is authorized while the user's checkout contains unrelated changes
- **THEN** the agent preserves it, creates or uses an approved isolated worktree, and transfers only the approved planning baseline and scoped implementation

#### Scenario: Adjacent cleanup is discovered
- **WHEN** an agent finds unrelated debt while implementing a task
- **THEN** it reports or separately proposes the debt and does not expand the active diff

### Requirement: TypeScript contracts are strict
All new application code SHALL use TypeScript strict mode, explicit public parameter and return types, discriminated unions for lifecycle and result states, exhaustive state handling, and no unjustified `any`, unsafe cast, unused symbol, or floating Promise.

#### Scenario: External library returns an unsafe value
- **WHEN** an adapter receives an untyped or weakly typed value
- **THEN** it validates and narrows the value at the adapter seam instead of propagating `any` into a domain module

#### Scenario: Lifecycle gains a new state
- **WHEN** a state-machine union adds a value
- **THEN** typechecking fails every non-exhaustive transition or projection until it handles the new state

### Requirement: Domain behavior lives in deep modules
The implementation SHALL group behavior by domain capability, expose a small typed interface per module, keep routes and UI orchestration thin, colocate helpers with their sole caller, and SHALL NOT add pass-through layers, speculative packages, generic repositories, or interfaces with only one justified adapter.

#### Scenario: Route performs a protected mutation
- **WHEN** a route receives a valid mutation request
- **THEN** it delegates one intent-level operation to the owning domain module rather than interpreting raw tables, policy flags, or lifecycle fields

#### Scenario: Helper has one caller
- **WHEN** implementation extracts a helper solely to reduce line count
- **THEN** it remains private and colocated unless extraction creates real interface leverage or reuse

### Requirement: Runtime boundaries validate once and fail explicitly
The implementation SHALL validate browser input, HTTP data, environment configuration, provider responses, uploads, persisted untyped payloads, and public module results at their entry seams; typed interiors SHALL trust validated values; recovery SHALL occur only at routes, jobs, adapter entrypoints, or UI error boundaries.

#### Scenario: Provider payload is malformed
- **WHEN** an authentication, email, storage, or media adapter receives an invalid payload
- **THEN** it returns a typed failure with operation context and no partial domain mutation

#### Scenario: Internal domain invariant fails
- **WHEN** a domain operation reaches an impossible typed state
- **THEN** the error travels to the known recovery seam and is not swallowed or converted into a fabricated success

### Requirement: Nondeterminism is injectable
Time, identifiers, randomness, network calls, storage, email, authentication, and other external effects SHALL enter domain modules through clocks, identifier sources, or justified adapter seams so ordinary tests run deterministically without live providers or sleeps.

#### Scenario: Award period boundary is tested
- **WHEN** a test exercises a weekly refresh or retention deadline
- **THEN** it advances a fake clock and asserts the observable transition without sleeping or changing the system clock

#### Scenario: Only one implementation exists
- **WHEN** no production-versus-test behavior actually varies at a proposed seam
- **THEN** the implementation keeps the dependency internal instead of introducing hypothetical indirection

### Requirement: Public and restricted projections are separate types
Private Account identity, anonymous-author linkage, blocks, reports, evidence, moderation state, risk state, messages, and Open To state SHALL be accessible only through restricted modules, while every public route, Feed item, metadata document, notification, export, and Share Clip SHALL consume an explicitly typed authorized projection introduced by its owning feature.

#### Scenario: Anonymous Review renders publicly
- **WHEN** any public or downstream surface requests the Review
- **THEN** it receives the anonymous projection and no response field, stable public identifier, error distinction, event, export, or ordinary log exposes the author Account

#### Scenario: Projection policy is unavailable
- **WHEN** an authoritative sensitive projection cannot be produced
- **THEN** the operation fails closed with a literal generic outcome rather than falling back to raw storage data

### Requirement: Durable mutations use one transactional path
Browser code SHALL NOT write canonical data directly. Domain mutations SHALL authorize before writing, use server-side application modules and Postgres transactions, enforce durable invariants with constraints where possible, and persist every policy-required audit or outbox fact atomically with the state it describes.

#### Scenario: Concurrent Award spend occurs
- **WHEN** two requests spend one Award Credit concurrently
- **THEN** one transaction succeeds and a database invariant prevents double spending without relying on client state

#### Scenario: Audit event cannot be written
- **WHEN** a sensitive mutation cannot persist its required audit event
- **THEN** the transaction rolls back instead of committing unaudited state

### Requirement: Migrations are forward-only and serialized
Schema changes SHALL use ordered committed migrations, SHALL be tested from an empty database and the previous supported schema, SHALL include compatible application sequencing or an explicit maintenance boundary, and SHALL be rebased and renumbered when another migration lands first.

#### Scenario: Parallel branches add migrations
- **WHEN** another migration merges before the active migration PR
- **THEN** the active branch rebases, resolves final ordering and dependent references, and reruns migration and application verification before merge

#### Scenario: Destructive schema change is proposed
- **WHEN** a migration removes or rewrites durable data
- **THEN** the design provides a staged transition, data verification, rollback or recovery boundary, and explicit operator acceptance

### Requirement: Sensitive observability is minimized
Application logs, traces, analytics, errors, and test artifacts SHALL use request or correlation identifiers and coarse outcomes but SHALL NOT contain secrets, tokens, raw identity evidence, anonymous linkage, message bodies, Open To intentions, full provider payloads, or unnecessary personal data.

#### Scenario: Protected operation fails
- **WHEN** a sensitive operation emits an error or trace
- **THEN** observability records the operation, safe object identifiers, policy version, and outcome class without recording protected contents or hidden relationships

#### Scenario: Debugging needs restricted evidence
- **WHEN** an authorized investigation requires protected evidence
- **THEN** access occurs through the audited restricted interface rather than by increasing ordinary log detail

### Requirement: Complexity and dependencies are bounded
Product source files SHALL target at most 400 lines and SHALL NOT exceed 600 lines, new code SHALL have no circular imports or dead exports, functions SHALL target complexity at most 15, nesting at most three, and parameters at most five, and every runtime dependency SHALL have one recorded justification and no competing library for the same job.

#### Scenario: Cohesive module exceeds the soft target
- **WHEN** a cohesive source file must exceed 400 lines
- **THEN** the PR records why splitting would reduce locality, tooling requires an explicit marker, and the file still remains below the hard cap

#### Scenario: Dependency duplicates an existing job
- **WHEN** a proposed package overlaps the chosen router, validator, state manager, date library, icon set, or persistence tool
- **THEN** the agent removes the old choice or rejects the new dependency

### Requirement: Tests assert behavior through module interfaces
Domain tests SHALL exercise observable outcomes through the owning module interface, database integration tests SHALL use disposable Postgres, browser tests SHALL cover only critical journeys, external providers SHALL use deterministic adapters by default, and every bug fix SHALL include a regression test that fails without the fix.

#### Scenario: Internal refactor preserves behavior
- **WHEN** a module implementation changes without changing its interface
- **THEN** behavioral tests remain valid and do not require assertions on private functions or storage rows except dedicated adapter tests

#### Scenario: Live provider is unavailable in CI
- **WHEN** the ordinary verification suite runs
- **THEN** fake adapters prove repository behavior and any live-provider acceptance remains an explicit separately authorized gate

### Requirement: Completion reports evidence by boundary
Every implementation handoff and pull request SHALL state scope, approved change and tasks, verification commands and results, known unrelated failures, migrations and dependencies, remaining work, and the distinction among repository proof, deployment proof, and live-provider acceptance.

#### Scenario: Repository tests pass before deployment
- **WHEN** all local and CI gates are green but no environment has been deployed
- **THEN** the change is reported as repository-complete rather than launched or production-accepted

#### Scenario: Required gate is skipped
- **WHEN** environment, authority, or provider state prevents a required check
- **THEN** the handoff names the skipped gate, its impact, and the exact remaining acceptance step
