# OpenSpec authoring workflow

This file governs agents creating or modifying OpenSpec changes in this
repository. Product discovery lives in `docs/product-definition.md`; canonical
terms live in `CONTEXT.md`; visual direction lives in `DESIGN.md`; shared
OpenSpec rules live in `openspec/config.yaml`.

## Sequential ownership

Use one fresh spec-building subagent per change. Author changes in the dependency
order recorded under **OpenSpec change map** in `docs/product-definition.md`.
Do not author dependent changes in parallel.

Research subagents may run in parallel inside one change when they investigate
independent factual questions. For this specification program, the spec-building
subagent may resolve product questions using the product definition, domain model,
primary research, and best judgment. It must record every material resolution and
rationale in the appropriate proposal, design, spec, glossary, or product document.

The next change begins only after the current change:

1. resolves or explicitly excludes every in-scope product question;
2. contains `proposal.md`, capability deltas, `tasks.md`, and `design.md` only
   when a real technical trade-off exists;
3. passes strict OpenSpec validation;
4. receives root-agent review; and
5. updates `CONTEXT.md`, an ADR when justified, and the product document when a
   decision changes shared truth.

Human approval is required for the completed specification set before implementation,
not between individual spec-authoring steps. Ask the human during authoring only when
the answer requires new authority, external coordination, or a material expansion
beyond the documented product scope.

## Universal Matt Pocock pipeline

Every spec-building subagent follows this order:

1. **Orient.** Read `openspec/config.yaml`, this file, the product definition,
   glossary, design system, current specs, accepted dependencies, and other
   in-flight changes that touch the same capabilities.
2. **Audit decisions.** Compare the change scope with the product document's
   open questions. Separate discoverable facts from product decisions.
3. **`grill-with-docs`.** For unresolved product decisions, run `grilling` with
   `domain-modeling`. Resolve ordinary product trade-offs from the documented product
   direction and best available evidence, then record the choice and rationale. Do not
   pause for the human unless the decision crosses the authority boundary above.
4. **Resolve factual or experiential uncertainty.** Run `research` for facts
   outside the repository. Run `prototype` only when behavior or UI must be
   experienced to decide it. Capture the answer, not prototype code, in the
   product model or proposal.
5. **Shape technical seams.** Run `codebase-design` when the change introduces a
   meaningful module interface, state machine, adapter, persistence seam, or
   cross-object policy. Do not invent architecture merely to fill `design.md`.
6. **`propose`.** Create the OpenSpec package with a sub-500-word proposal,
   normative capability deltas, and tracer-bullet tasks. Do not implement code.
7. **Validate.** Run `openspec validate <change-id> --strict` and repair every
   failure. Perform a final spec audit for privacy, moderation, empty, error,
   blocked, deleted, and abuse states relevant to the capability.
8. **Root review gate.** Present the validated change to the root agent. Do not start
   the next change until root review is complete and requested corrections are
   incorporated. Present the complete validated set to the human before implementation.

Use `wayfinder` only if the decision audit reveals that the change is still too
large or foggy for one spec session. Use `handoff` only when the active context
approaches the smart-zone limit; the repository artifacts should normally make
a separate handoff document unnecessary.

`implement`, `tdd`, and `code-review` are not spec-authoring steps. After a
change is approved, implementation uses `implement`, which drives `tdd` and
closes with `code-review` against the approved spec.

## Skill matrix by change

`grill-with-docs`, `domain-modeling`, and `propose` are required for every
change. The table lists additional emphasis and conditional skills.

| Change | Additional required skills | Conditional skills | Questions they must settle |
|---|---|---|---|
| `establish-application-engineering-foundation` | `research`, `codebase-design` | logic `prototype` only if a framework or persistence seam cannot be settled from a minimal technical proof | Runtime and framework boundary, module direction, public/private projections, transaction ownership, canonical gates, CI, migration parity, and evidence boundaries |
| `add-account-identity-and-safety-foundation` | `research`, `codebase-design`, logic `prototype` | `wayfinder` if identity, privacy, and moderation cannot fit one decision map | Account states, verification, Public Byline, privacy retention, blocking, reporting, moderation and audit states |
| `add-person-profiles` | `research`, `codebase-design` | logic `prototype` for claim, merge, correction, and dispute transitions | Eligible person boundary, search-before-create, photo rules, claimed versus unclaimed authority, duplicates |
| `add-relationship-reviews` | `research`, logic `prototype`, `codebase-design` | UI `prototype` for attribution and assessment flow | Relationship evidence, named versus anonymous behavior, lifecycle, edits, Exhibits, subject response, role-specific assessments |
| `add-named-posts-and-comments` | UI `prototype`, `codebase-design` | `research` if moderation or thread evidence is missing | Public Byline requirements, Post-versus-Review boundary, Comment identity, nesting, locks, deletion, Post reaction choice |
| `add-profile-review-aggregation` | `research`, logic `prototype` | `codebase-design` if aggregation becomes a reusable policy module | Eligibility, minimum sample, relationship grouping, confidence, suppressed and low-volume states |
| `add-mixed-feed-and-review-reactions` | logic `prototype`, `codebase-design` | `research` only to refresh existing ranking evidence; UI `prototype` if the three reaction types remain confusing | Candidate eligibility, Latest, Trending, diversity, Review Vote display, Verdict survival, Award timing and abuse controls |
| `add-share-clips` | `research`, UI `prototype`, `codebase-design` | none by default | Canonical source, platform formats, exact excerpts, attribution, cropping, deleted or anonymized sources, media eligibility |
| `add-social-graph-and-messaging` | `research`, logic `prototype`, `codebase-design` | UI `prototype` for request and inbox states | Follow versus Connection, notification events, request limits, acceptance, blocking, anonymous-author isolation |
| `add-open-to-mode` | `research`, logic `prototype`, `codebase-design` | `wayfinder` if safety or consent dependencies remain foggy; UI `prototype` for mutual visibility | Adults-only eligibility, intentions, mutual visibility, immediate revocation, 14-day expiry, DM coupling, blocks and reports |

## Spec-writing rules

- Split by capability and behavior, never by page or database table.
- A requirement owns one externally observable contract and uses `SHALL`.
- Every requirement includes at least one `WHEN`/`THEN` scenario; add negative
  scenarios where a prohibited or safety-sensitive action matters.
- Keep product policy in specs and technical trade-offs in `design.md`.
- Reuse and modify foundational `trust-safety` and `notifications` capabilities;
  do not create conflicting local versions inside later changes.
- State what is explicitly out of scope so future agents do not infer it.
- Do not preserve an open question as vague implementation discretion. Resolve it under
  the decision authority above or explicitly exclude it from the change.
