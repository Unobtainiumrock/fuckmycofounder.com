# Identity and safety foundation verification

Change: `add-account-identity-and-safety-foundation`

## Implemented repository boundary

- A deep, framework-neutral identity/safety module keeps Account, Public
  Byline, Profile Claim, Block, Report, Moderation Case, Enforcement Action,
  Appeal, Audit Event, and retention states distinct.
- Deterministic Google, Apple, and email-link adapters cover success, invalid,
  disabled, and unavailable states while preserving the protected intent. The
  checked-in route is deliberately disabled until live providers are selected.
- Public named and anonymous attribution, claimed-Profile, Account export,
  staff, and restricted projections are named separately. The client-safe
  module barrel exports only already-derived public attribution projections;
  Account, Public Byline, staff, and restricted records remain behind the
  server-only barrel. Anonymous attribution is always `Anonymous reviewer` and
  contains no stable identity.
- Central policy returns allow, safe deny, unmet requirement, or unavailable.
  Durable commands accept an opaque, process-bound authorization capability
  whose actor, action, capability, and target must exactly match before one
  owned PostgreSQL transaction opens. Account actions use action-specific
  lifecycle capabilities, while staff actions use an explicit least-privilege
  role/action matrix. Canonical lifecycle, recovery, claim, blocking,
  moderation, enforcement, appeal, retention, and reveal state is then locked
  and revalidated inside that transaction.
- Public Byline creation/editing, verified-claim linking, unilateral Account
  blocking, moderation transitions, claim and moderation appeals, recovery,
  deletion finalization, erasure, retention, and legal holds are durable
  commands rather than in-memory policy helpers. Claim submission is an Account
  action, while verification or rejection requires a separately authorized
  identity reviewer. Recovery requires persisted proof and a matured hold,
  revokes sessions, and requires fresh authentication to complete contact and
  claim reverification. Deletion finalization is automatic after its deadline
  and final erasure is blocked until its due date or while an authorized legal
  hold remains active.
- Moderation Cases bind their affected Account or Profile Claim before an
  enforcement decision; appeal reversal restores the recorded prior state.
  Restricted anonymous attribution is bound to the exact stored linkage and
  documented case. Sexual-exploitation risk signals create an urgent human-
  review case and never directly mutate content or enforcement state.
- Append-only audit rows contain only the permanent minimal decision history.
  Restricted audit evidence is stored separately with an expiry and scoped
  legal-hold state. Rejected audit mutation proof executes the forbidden write
  and the denial audit in the same owned database operation.
- PostgreSQL migrations are isolated under `migrations/postgres/`; the existing
  Cloudflare/D1 migration remains unchanged. The down migration refuses to
  discard populated operational state and is proven safe against a disposable
  database.

## Evidence map

| Scope | Evidence |
|---|---|
| Authentication, linking, recovery, lifecycle, export/deletion | `tests/unit/accounts.test.ts` and `src/platform/persistence/identity-safety-account-commands.ts` |
| Byline, attribution, downstream noninterference | `tests/unit/public-bylines.test.ts`, `tests/contracts/public-identity-boundary.test.ts`, and `src/platform/persistence/identity-safety-public-commands.ts` |
| Claim proof, uniqueness, projection, expiry | `tests/unit/profile-claims.test.ts`, durable claim/appeal commands, and PostgreSQL integration |
| Policy, blocks, reports, moderation, enforcement, appeals, abuse | `tests/unit/trust-safety.test.ts`, durable moderation commands, and PostgreSQL integration |
| Audit immutability, least privilege, retention/holds | `tests/unit/audit-retention-access.test.ts` and PostgreSQL integration |
| Clean apply, upgrade, rollback, transaction rollback, concurrency | `tests/integration/postgres-identity-safety.test.ts` |
| Signed-out provider-neutral boundary | `tests/e2e/account-boundary.spec.ts` |
| Security, privacy, accessibility, operations | threat model and moderator runbook |

## Evidence classes and remaining authority

Repository proof does not establish deployment or live-provider acceptance.
No production authentication, email, storage, database, Cloudflare, hosting,
DNS, secret, or deployment state was selected or changed.

The smallest provider decision is the authentication implementation and exact
origins for Google, Apple, and passwordless email delivery, including callback
URLs and secret ownership. After that decision, an authorized operator must
configure providers, apply migrations to an approved environment, validate
issuer/audience/nonce/replay behavior, verify email delivery and enumeration-
resistant timing, read back CSP, exercise recovery/session revocation, and run
the moderator/restricted-access drill.

Before launch, counsel must approve identifiable-person, defamation, privacy,
takedown, anonymous-speaker/legal-process, evidence, processor, deletion,
backup, and retention policy/copy. Accessibility acceptance must repeat the
enabled sign-in and retry flow with keyboard, screen reader, zoom, and reduced
motion. These are explicit launch gates, not repository failures.

There is one deliberately unresolved database-authority decision. This change
does not weaken the trigger that forbids updates and deletes of the core
`identity_safety_audit` history. Consequently those rows remain permanent,
minimal facts while only restricted `audit_evidence_payloads` expire or are
held. Allowing retention-driven mutation of the core would expand the blast
radius to alteration or loss of decision history and needs explicit end-user
authority plus counsel-approved periods. The smallest next decision is whether
to authorize a narrowly scoped database procedure and separate execution role
for core-audit retention; until then, the immutable-core model is the safe
repository default.

Profiles, Reviews, Posts, Comments, Feed, reactions, notifications, Direct
Messages, and Open To remain outside this change. Their later adapters must
consume the client-safe projection barrel; the contract test proves the seam,
but production noninterference in those not-yet-existing consumers remains a
future capability acceptance obligation.
