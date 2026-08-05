# Code standards

These rules apply to maintained application code and implement the
`engineering-standards` capability. Architecture choices live in
`docs/architecture/tech-stack-and-scaffold.md`; product behavior lives in the
active OpenSpec.

## Hard rules

- TypeScript is strict. Public functions have explicit parameter and return
  types. Lifecycle and result states use discriminated unions with exhaustive
  handling. No unjustified `any`, unsafe cast, unused symbol, or floating
  Promise is accepted.
- Validate untrusted browser, HTTP, environment, provider, upload, and persisted
  untyped data once at its boundary. Keep typed interiors free of redundant
  parsing. Recover only at a route, job, adapter entrypoint, or UI error boundary.
- Keep domain policy, authorization, transitions, ranking, attribution,
  retention, and transaction orchestration out of React and Next.js route files.
- A Server Function or Route Handler authenticates its request context, parses
  untrusted input once, invokes one public intent-level module operation, and
  maps that operation's typed result. It never imports module-internal policy,
  issues SQL, or assembles a partial transaction. Operational health adapters
  call a named platform runtime seam because they do not express product intent.
- Browser code never writes canonical state directly or imports a server-only
  module. A durable command authorizes before writing, uses one transaction
  client, relies on constraints for durable invariants, and atomically records
  every policy-required audit fact.
- Persistence records are restricted. Public surfaces consume named authorized
  projections and fail closed rather than serializing raw data.
- Inject nondeterminism that changes behavior: clocks, identifiers, randomness,
  and real external effects. Do not add an interface when only one behavior
  exists.
- Logs, traces, errors, analytics, and test artifacts omit secrets, tokens, raw
  identity evidence, anonymous linkage, message bodies, hidden intentions, full
  provider payloads, and unnecessary personal data.
- Migrations are ordered, committed, forward-only, tested from empty and the
  previous supported schema, and serialized at merge time.
- New maintained source has no dependency cycles, reverse-layer imports, dead
  exports, or files above 600 lines. There is no greenfield allowlist.

## Default targets

- Keep product source files at or below 400 lines. A larger cohesive file needs
  an inline reviewed reason and must remain below 600 lines.
- Keep cyclomatic complexity at or below 15, nesting at or below three, and
  parameters at or below five.
- Prefer one deep module with a small intent-level interface over pass-through
  layers, generic repositories, speculative packages, or wrappers named after
  implementation mechanics.
- Colocate a one-caller helper. Extract only when the interface hides meaningful
  complexity or has real reuse.
- Prefer database constraints and transactional outcomes over client checks.
- Prefer dynamic, correctness-first reads. Caches require an approved ownership,
  versioning, invalidation, multi-instance, and stale-safety contract.
- Add one runtime dependency only when an existing platform or package cannot do
  the job; record the reason and avoid competing libraries for the same job.

## Tests and completion

- Test through the owning module or external route interface. Do not mock internal
  collaborators or assert private call order. Expected values come from the spec
  or independent worked examples.
- Unit tests prove pure policy; component tests prove isolated UI/accessibility;
  disposable Postgres tests prove constraints, transactions, projections, and
  migrations; E2E tests prove only critical journeys.
- Every bug fix includes a regression test that fails without the fix.
- A checked OpenSpec task must link to working code and its named passing proof.
- Handoffs name scope, commands and results, skipped gates, migrations,
  dependencies, remaining work, and the repository/deployment/live-provider
  evidence boundary.

These are engineering constraints, not incentives to split cohesive code or add
abstractions. When a heuristic harms locality, document the trade-off; hard
privacy, type, transaction, migration, and evidence rules still apply.
