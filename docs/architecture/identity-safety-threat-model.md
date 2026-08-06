# Identity and safety foundation threat model

Status: repository implementation review for
`add-account-identity-and-safety-foundation`. This is not legal advice or live-
provider acceptance.

## Assets and trust seams

The `identity-safety` module owns Account, Public Byline, Profile Claim, Block,
Report, Moderation Case, Enforcement Action, Appeal, Audit Event, and retention
transitions. Its interface returns named public, viewer-specific, staff, or
restricted projections; callers never redact persistence records themselves.
The route adapter validates untrusted input once. Authentication and PostgreSQL
adapters are server-only. A durable command evaluates policy before opening one
transaction, then writes its state and required audit event atomically.

Private assets are authentication identifiers, verified contacts, recovery
state, raw claim evidence, reporter identity, anonymous-author linkage, block
direction, risk signals, legal holds, and restricted evidence references.

## Threats and controls

| Threat | Repository control | Remaining acceptance |
|---|---|---|
| Account takeover through linking or recovery | Exact provider-subject linkage, no email merge, recent reauthentication, generic recovery response, reviewed recovery revokes sessions and claims | Live provider token validation, delivery, hold timing, and operator drill |
| Account enumeration | Identical recovery response and generic route errors | Comparable live latency and provider/email throttling |
| Anonymous-author leakage | One anonymous projection with no identifier, named projection types, downstream noninterference corpus, audited restricted reveal | Deployed analytics, notification, support, export, and log review |
| Impersonation | Reserved labels, edit rate limit, report intake, scoped claim proof | Human-review policy, evidence processor, moderator staffing |
| Hidden block disclosure | Symmetric safe denial and no direction in projections or errors | Later capability-specific read/write integration |
| Report brigading or retaliation | Duplicate-safe intake, no automatic visibility/rank effect, auditable abuse reason codes | Production rate storage and calibrated thresholds |
| Moderator overreach | Least-privilege field matrix, case reason plus approval, separate case/enforcement/appeal states, reviewer separation | Staff identity provider, role provisioning, periodic access review |
| Audit alteration | Database trigger rejects update/delete; mutations append a denied-attempt event | Backup and database administrator controls |
| Over-retention | Declared per-class expiry, appeal/legal-hold scoping, deletion receipts without payload | Counsel-approved periods, live jobs, backup-provider deletion proof |
| Provider outage or policy outage | Explicit disabled/unavailable states, protected intent preservation, fail closed | Selected provider failover and deployed retry acceptance |

Ordinary logs may contain a correlation identifier, operation name, coarse
outcome, and policy version. They must not contain proof, tokens, contacts,
anonymous linkage, reporter identity, block direction, or request bodies.

## Security and privacy stop rules

- Never enable a live authentication origin until its callback, issuer,
  audience, token, nonce/state, expiry, replay, and error paths are accepted.
- Never collect claim evidence until the processor, access roles, purpose
  notice, encryption, deletion job, and legal-hold procedure are approved.
- Never run the PostgreSQL migration against a non-disposable or production
  database under repository-test authority.
- A policy, attribution, moderation-intake, or audit dependency failure is a
  denial/retry, never permission or raw-data fallback.

## Accessibility review

The provider-neutral Account page uses one `main`, ordered headings, literal
status text, native disabled buttons, keyboard-native controls, and no required
motion. Errors are textual and do not depend on color. Live provider forms must
retain these semantics and add focus placement and an announced retry result
when enabled.
