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
  staff, and restricted projections are named separately. Anonymous attribution
  is always `Anonymous reviewer` and contains no stable identity.
- Central policy returns allow, safe deny, unmet requirement, or unavailable.
  Durable commands authorize before one owned PostgreSQL transaction and write
  the action plus append-only audit atomically.
- PostgreSQL migrations are isolated under `migrations/postgres/`; the existing
  Cloudflare/D1 migration remains unchanged.

## Evidence map

| Scope | Evidence |
|---|---|
| Authentication, linking, recovery, lifecycle, export/deletion | `tests/unit/accounts.test.ts` |
| Byline, attribution, downstream noninterference | `tests/unit/public-bylines.test.ts` |
| Claim proof, uniqueness, projection, expiry | `tests/unit/profile-claims.test.ts` and PostgreSQL integration |
| Policy, blocks, reports, moderation, enforcement, appeals, abuse | `tests/unit/trust-safety.test.ts` |
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
