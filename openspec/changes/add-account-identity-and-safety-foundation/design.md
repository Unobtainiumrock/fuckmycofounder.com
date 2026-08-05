## Context

The repository is currently a dependency-free static site. The planned network needs private authentication data and moderation state while preserving logged-out public utility. This change defines the first server-backed seam without selecting a hosting, authentication, or database vendor.

## Decisions and rationale

### Private Account Identity and public attribution are separate projections

Authentication contacts, provider identifiers, recovery state, claim evidence, moderation history, and the Account-to-anonymous-content link remain in a restricted private identity store. Public surfaces receive only a Public Byline, a claimed-Profile link the owner explicitly enables, or an anonymous-attribution projection. This is stricter than conditionally hiding fields in each caller and makes accidental leakage harder across feeds, notifications, sharing, exports, and future APIs.

Anonymous Reviews use the single label **Anonymous reviewer**, not a stable pseudonym. Cross-review continuity would create an unintended public relationship graph and make re-identification easier. The platform retains the accountable Account association for abuse response.

### Launch authentication is low-friction but explicit

Launch offers Google, Apple, and passwordless email links. A verified method creates an Account only at the protected-action boundary and returns the person to the saved intent. Matching email addresses never silently merge Accounts; adding or recovering a method requires an authenticated session, recent reauthentication, or a reviewed recovery path. This keeps setup short without making identity linking an account-takeover shortcut.

### Account, claim, and moderation states do different jobs

| Model | States | Key rule |
|---|---|---|
| Account | active, limited, suspended, deletion pending, deleted | Enforcement changes capabilities; it does not rewrite authorship or Profile existence. |
| Profile Claim | pending, verified, rejected, revoked | Only `verified` grants owner controls or a public claimed state. |
| Moderation Case | received, triaged, investigating, resolved, appealed, closed | Case state records work; object visibility and Account enforcement remain separate outcomes. |

A block is a unilateral relationship safety rule, not an Account state or content-removal action. It stops direct interaction and targeted discovery between signed-in Accounts, but cannot promise invisibility for material that remains publicly readable while logged out.

### Profile Claims prove control, not universal identity

A claim needs an active Account with a verified contact plus either control of an authoritative identity associated with the Profile subject or human review of private evidence. A matching name, email domain, or profile photo alone is insufficient. One Account may control one active Profile Claim and one Profile may have one active claimant; suspected duplicates go to the later Profile merge flow. Public clients see only claimed/unclaimed state. Raw evidence is private and is removed after the decision window; a later dispute can require fresh proof.

### Safety decisions pass through one policy seam

Protected actions call one deep authorization module with actor, action, target, and relevant context. It returns allow, deny, or an explicit unmet requirement while hiding Account status, block direction, risk thresholds, and capability-specific eligibility. Moderation uses a separate case-workflow module because review queues, notices, appeals, and audit events have a different lifecycle. Production persistence and test adapters sit behind these interfaces; callers do not interpret raw database state.

### Moderation is reversible, explainable, and auditable

Reports create Moderation Cases rather than directly changing rank or visibility. Outcomes can require changes, limit visibility, remove material, limit or suspend an Account, or revoke a Profile Claim. The affected Account receives the rule, action, scope or duration, and appeal route unless disclosing a detail would create a concrete safety or integrity risk. Appeals keep the action effective by default and go to a qualified reviewer who did not issue the original decision. Every material transition records actor, time, reason code, policy version, before/after state, and restricted evidence references in append-only history.

### Retention is purpose-limited

Account deletion immediately revokes sessions and enters a 30-day recovery window. After finalization, primary private identity is erased within 30 days and backup copies expire within 90 days. Raw Profile Claim evidence expires within 90 days of a final decision unless an appeal or legal hold is active. Minimal enforcement and audit records may remain for up to 24 months for abuse prevention, disputes, and accountability; access is restricted and legal holds are exceptional and recorded. An Account deletion does not delete an independent public Profile created by someone else, and later object specs must define what happens to authored content.

These are launch product defaults, not claims of legal compliance. Specialist legal review may shorten or extend a category before launch, but the implementation must keep retention categories configurable and documented rather than retaining everything indefinitely.

The primary-source basis and pre-launch legal-review flags are recorded in
[`docs/research/identity-and-safety-foundation-primary-sources.md`](../../../docs/research/identity-and-safety-foundation-primary-sources.md).

## Logic-prototype findings

Walking the three state models through recovery during deletion, suspension during a pending claim, claim revocation during appeal, duplicate reports, blocking before anonymous publication, and object removal during an open case produced two constraints: transitions must be append-only events rather than destructive overwrites, and authorization must derive from the combination of Account state, claim state, block state, and capability policy. No state model may implicitly mutate another.

## Migration and operational boundary

The static pages remain public. Network routes use an authenticated first-party backend and a durable relational store. CSP must allow only the selected first-party endpoints and authentication origins rather than broad network access. Private identity, public projections, and moderator operations require distinct authorization paths. Provider-specific auth and storage choices remain implementation decisions behind adapters.

## Remaining exclusions

- The Profiles change decides who is eligible for a Profile, photo provenance and removal, corrections, disputes, and duplicate merges.
- The Reviews change decides Relationship Claim evidence, review attribution changes, subject notice timing, review moderation rules, and moderator-only review fields.
- Later changes extend blocking and policy checks for Comments, Feed, reactions, messaging, and Open To.
- Pre-launch counsel must review public-person, defamation, privacy, takedown, evidence, and retention policy text.
