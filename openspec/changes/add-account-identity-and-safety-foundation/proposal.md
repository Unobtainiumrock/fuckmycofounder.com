## Why

The planned network names real people and permits protected, sometimes publicly anonymous participation. The current static site has no durable Account, public-identity, authorization, or moderation boundary. Profiles and content cannot be added safely until private identity, low-friction sign-in, attribution, blocking, reports, enforcement, appeals, retention, and audit behavior share one foundation.

## What Changes

- Add progressive Accounts created only when a protected action requires one, with Google, Apple, and passwordless email sign-in, explicit method linking, recovery, lifecycle states, reauthentication, export, and deletion.
- Add Public Bylines with a required display name and optional photo, while keeping Accounts, Public Bylines, Profiles, and Profile Claims distinct.
- Define a Profile Claim verification contract: verified contact plus control evidence or human review, exclusive active ownership, private evidence, revocation, and appeal.
- Define publicly anonymous attribution as **Anonymous reviewer** with no stable cross-review pseudonym or public Account linkage.
- Add reusable trust-and-safety contracts for policy checks, blocks, reports, moderation cases, enforcement notices, appeals, audit history, abuse controls, and purpose-limited retention.
- Introduce an authenticated first-party application boundary and durable private storage; the public site remains readable without an Account.

Explicitly out: Profile eligibility and creation, relationship verification, Reviews, Posts, Comments, Feed ranking, reactions, notifications, Direct Messages, and Open To-specific age/consent rules. Those changes will reuse and modify this foundation.

## Impact

- Adds capability specs `accounts`, `public-bylines`, and `trust-safety`.
- Requires a backend, durable relational persistence, authentication adapters, restricted moderation operations, and a public projection that cannot expose private Account identity.
- Replaces the current permanent `connect-src 'none'` assumption for network surfaces with an allowlisted first-party/authentication boundary.
- Primary risks are account takeover, impersonation, anonymous-author leakage, inconsistent enforcement, over-retention, and blocks being mistaken for global takedowns. Exact public-profile, evidence, and legal retention policies still require specialist review before launch.
