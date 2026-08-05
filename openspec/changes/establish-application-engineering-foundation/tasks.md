## 1. Governance and tracer slice

- [x] 1.1 Add root `AGENTS.md`, `docs/code-standards.md`, `docs/architecture/tech-stack-and-scaffold.md`, and `openspec/README.md` with the approved authority order, implementation workflow, module vocabulary, hard/default/heuristic rules, and evidence boundaries (test: instructions cross-reference only current authoritative paths).
- [x] 1.2 Pin a supported LTS Node.js runtime, pnpm, strict TypeScript, and the current patched Next.js Active LTS release in one package and frozen lockfile (test: clean install and version assertions).
- [ ] 1.3 Server-render the existing landing/Cooked Quiz route from the production application while preserving its URL, Caseboard design, accessibility, deterministic report behavior, and supported share-fragment contract (test: current regression suite plus production-build browser parity).
- [x] 1.4 Produce one standalone Node container with distinct liveness/readiness, graceful shutdown, immutable build identity, and no production secrets (test: container start, health, dependency-failure, and signal fixtures).

## 2. Module and privacy scaffold

- [x] 2.1 Create the approved `app/`, `src/modules/`, `src/platform/`, `src/shared/`, and test layout with enforced dependency direction and no speculative workspace packages (test: architecture fixture rejects reverse and circular imports).
- [x] 2.2 Move the Cooked Quiz's deterministic scoring/report behavior behind a framework-free module interface and add the smallest typed result and clock/ID seams its real behavior needs; document the command/projection pattern later protected modules must follow without adding a fake product module (test: current round-trip, deterministic-report, validation, and malformed-input cases run through the module interface).
- [x] 2.3 Enforce `server-only` imports for persistence, auth, moderation, attribution, messaging, evidence, and risk paths and prohibit persistence records from browser-reachable or metadata modules (test: intentionally invalid import and projection fixtures fail build/checks).
- [x] 2.4 Add the reusable public/restricted noninterference contract harness with paired allowed/forbidden fixtures for response bodies, metadata, logs, events, exports, and errors; leave feature field matrices to their owning changes (test: forbidden-field, stable-identifier, and indistinguishable-error corpus).

## 3. Postgres and migrations

- [x] 3.1 Prove and record one Node Postgres driver plus migration/query toolkit using explicit transaction ownership, constraints, typed results, forward migrations, concurrency, and disposable-test criteria (evidence: ADR and rejected-alternative table).
- [x] 3.2 Add typed configuration and a server-only Postgres adapter with one-client transaction runner, safe error mapping, request correlation, and no production default (test: commit, rollback, nested-call denial, and connection-failure fixtures).
- [x] 3.3 Add ordered migration tooling and an empty-to-current disposable Postgres harness that rejects production identities (test: clean apply, repeat apply, previous-schema upgrade, ordering collision, and production-guard cases).
- [x] 3.4 Add a test-only migration/schema fixture that proves a constraint, one-client transaction, policy-required audit write, concurrency behavior, and rollback without adding speculative production tables; keep feature tables and outbox records exclusively in their owning changes (test: concurrent invariant and audit-write failure).

## 4. Server entrypoint and configuration rules

- [x] 4.1 Document and enforce thin Server Function and Route Handler rules—authenticate context, parse inputs, call one intent-level module operation, map typed results, and never issue direct SQL—without shipping a fake protected action (test: architecture fixtures allow module-interface imports and reject direct persistence or internal-policy imports from route adapters).
- [x] 4.2 Add typed startup configuration for local, test, preview, and production classes, plus a separate allowlisted public build-time projection, with secret-safe errors; provider-specific keys and disabled states remain in owning changes (test: malformed, missing, browser-import, cross-environment, and production-database rejection).
- [x] 4.3 Establish route-specific CSP and security-header composition so current routes retain a restrictive default and later owning changes can add only declared first-party or provider origins (test: header snapshots and unlisted-origin denial).

## 5. Canonical quality tooling

- [x] 5.1 Add Prettier and type-aware ESLint gates for strict TypeScript, unused code, floating Promises, React rules, complexity 15, nesting 3, and parameters 5 (test: representative failing and passing fixtures).
- [x] 5.2 Add source-size enforcement with a 400-line target, explicit reason above 400, 600-line hard cap, and no greenfield network-code allowlist (test: boundary and substitution fixtures).
- [x] 5.3 Add dependency-direction, circular-import, and unused-export checks that resolve the actual TypeScript/Next module graph rather than regex-only paths (test: alias, dynamic import, type-only import, cycle, and reverse-direction fixtures).
- [x] 5.4 Add stable root commands for format, non-mutating format check, lint, typecheck, build, unit/component, Postgres integration, selected E2E, architecture, file-size, and all-change strict OpenSpec validation (test: command manifest and fail propagation).

## 6. Test and CI proof

- [x] 6.1 Configure Vitest for framework-free module and component tests with fake clocks/adapters and no live provider access (test: nondeterminism and forbidden-network fixtures).
- [x] 6.2 Configure production-build HTTP tests for current SSR documents, metadata, operational Route Handlers, CSP, private-import enforcement, and safe errors; later owning changes extend this gate when they add Server Functions (test: anonymous crawler, health/readiness, dependency-failure, and forbidden-import fixtures).
- [x] 6.3 Configure Playwright only for the landing/Cooked Quiz parity journey, keeping protected actions and their domain edge cases in the later change that first introduces them (test: desktop/mobile, keyboard, and reduced-motion runs).
- [x] 6.4 Add pull-request CI using a frozen install and fail-closed OpenSpec, format-check, lint, architecture, typecheck, build, test, file-size, generated-cleanliness, and container gates with concurrency and timeouts (test: workflow contract and intentional failing branch fixtures).

## 7. Close-out

- [ ] 7.1 Run the complete canonical gate from a clean checkout and document exact runtime, framework, package, database-tooling, and container versions plus any intentionally deferred provider choices.
- [ ] 7.2 Complete independent standards and spec review, threat-model the private/public projection and test-database guards, and correct every high-severity finding before marking the foundation implemented.
- [x] 7.3 Confirm the product implementation order records the now-implemented engineering foundation as the prerequisite for every network feature, while keeping deployment and live-provider setup as separately authorized work.
