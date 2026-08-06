## 1. Walking skeleton

- [x] 1.1 Add a first-party application boundary and durable relational persistence for one Account, one Public Byline, one protected action, one policy decision, and one append-only audit event (test: signed-out denial through successful authenticated action).
- [x] 1.2 Add private and public identity projections so the same Account renders as its Public Byline or anonymous attribution without exposing private identifiers (test: response-shape and authorization contract).
- [x] 1.3 Replace `connect-src 'none'` only on network surfaces with exact first-party and chosen authentication origins (test: CSP allows required flows and rejects an unlisted origin).

## 2. Account authentication and lifecycle

- [x] 2.1 Add Google, Apple, and passwordless email-link authentication adapters with protected-intent return and expired/failure handling (test: each success and failure path preserves the pending intent).
- [x] 2.2 Add explicit authentication-method linking, recent-reauthentication checks, and reviewed recovery without automatic email-match merging (test: takeover and duplicate-account cases).
- [x] 2.3 Implement active, limited, suspended, deletion-pending, and deleted Account transitions with session revocation and capability checks (test: state-transition matrix).
- [x] 2.4 Add Account data view/export, contact correction, deletion scheduling, 30-day recovery, and finalization (test: export authorization, cancellation, and deletion deadlines).

## 3. Public Bylines and attribution

- [x] 3.1 Add on-demand Public Byline creation and editing with required display name, optional photo, reserved-label and impersonation checks, and no Profile side effect (test: named-action gate).
- [x] 3.2 Add explicit claimed-Profile linking and automatic removal of the public claimed marker when the claim is no longer verified (test: claim transition projection).
- [x] 3.3 Add the anonymous-attribution renderer and leakage tests across public payloads, links, logs, notifications fixtures, exports, and moderator-only access (test: stable pseudonym and Account identifiers never appear publicly).

## 4. Profile Claim foundation

- [x] 4.1 Implement pending, verified, rejected, and revoked Profile Claim transitions with exclusive active ownership and recent reauthentication (test: transition and uniqueness matrix).
- [x] 4.2 Add private evidence intake for authoritative-control proof or human review, derived public claimed state, evidence expiry, and safe failure handling (test: name/email/photo alone cannot verify a claim).
- [x] 4.3 Add claim notices, challenge, revocation, and appeal hooks without exposing private evidence (test: claimant and public projection cases).

## 5. Trust and safety operations

- [x] 5.1 Implement the centralized policy interface for protected actions using Account, block, claim, risk, and capability context (test: allow, deny, unmet-requirement, and unavailable-policy outcomes).
- [x] 5.2 Add immediate unilateral Account blocking across direct interaction, targeted discovery, and notifications without treating it as content removal (test: signed-in, anonymous-attribution, and logged-out cases).
- [x] 5.3 Add Account-backed reports, duplicate-safe intake, urgent routing, reporter confidentiality, and status viewing (test: report lifecycle and abuse cases).
- [x] 5.4 Add Moderation Case queues, enforcement outcomes, plain-language notices, 30-day appeals, reviewer separation, and closed-case behavior (test: case/outcome cross-product).
- [x] 5.5 Add risk controls for impersonation, harassment, doxxing, spam, evasion, brigading, and retaliation with auditable reason codes (test: rate-limit and coordinated-abuse fixtures).

## 6. Audit, privacy, and retention

- [x] 6.1 Record append-only audit events for sensitive identity, claim, policy, moderation, enforcement, appeal, and retention transitions with restricted evidence references (test: completeness and immutability).
- [x] 6.2 Enforce least-privilege staff access and ensure Account exports or subject requests cannot reveal anonymous authors, reporters, block direction, or unrelated evidence (test: role/field matrix).
- [x] 6.3 Enforce claim-evidence, private-identity, backup, safety-audit, and legal-hold retention categories with deletion jobs and observable status (test: time-controlled expiry matrix).

## 7. Close-out

- [ ] 7.1 Run unit, integration, authorization, retention, and browser tests for signed-out, empty, unavailable-provider, blocked, restricted, suspended, deletion-pending, deleted, appealed, and abuse states.
- [ ] 7.2 Complete security, privacy, accessibility, threat-model, and moderator-runbook review; document the specialist legal decisions still required before launch.
