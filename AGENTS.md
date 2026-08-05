# Repository implementation instructions

These instructions govern implementation in this repository. `openspec/AGENTS.md`
governs specification authoring only.

## Read before changing code

For every substantive change, read in this order:

1. `docs/product-definition.md` for product authority and implementation order.
2. `CONTEXT.md` for canonical domain language.
3. `DESIGN.md` for visual and interaction authority.
4. The active `openspec/changes/<change-id>/proposal.md`, `design.md`, capability
   specs, and `tasks.md`, plus the accepted changes it depends on.
5. `docs/code-standards.md` and
   `docs/architecture/tech-stack-and-scaffold.md`.
6. Every target file and nearby test before editing it.

Historical exploration in `docs/features.md` never overrides these sources.
When instructions conflict, stop and report the conflict rather than silently
choosing product behavior.

## Implementation workflow

- Implement one approved OpenSpec change at a time, in task order.
- Use one isolated worktree, branch, and pull request per substantive change.
  Preserve unrelated dirty state and do not absorb adjacent cleanup.
- For logic, work red -> green through the public seam named in the task. Tests
  assert observable behavior, not private helpers.
- Mark a task complete only after its implementation and named evidence pass.
- Product behavior that the approved spec neither decides nor excludes requires
  a coherent OpenSpec update and strict revalidation before code continues.
- Migrations land serially and are rebased or renumbered when another lands
  first.

## Boundaries

- `app/` is the Next.js composition and rendering adapter.
- `src/modules/` owns framework-neutral domain/application behavior and may
  depend only on `src/shared/`.
- `src/platform/` implements module-owned runtime interfaces and may depend on
  `src/shared/`; modules never import concrete platform code.
- `src/shared/` contains only dependency-light primitives with demonstrated
  cross-module reuse.
- Browser-reachable code never imports persistence, secrets, restricted
  projections, or private identity/policy implementations.
- Public, viewer, staff, and restricted projections are separate named types.
- Durable commands authorize first and own one Postgres transaction. Routes do
  not issue SQL or assemble partial transactions.

## Required proof

Run the applicable canonical commands in `package.json`; before completing a
change, run the full clean-checkout gate documented in `openspec/README.md`.
Report repository proof, deployment proof, and live-provider acceptance as
separate evidence classes. Green repository checks never imply deployment or
provider acceptance.

Do not choose or mutate production auth, database, storage, email, hosting,
DNS, secrets, or other provider state without separately granted authority.
