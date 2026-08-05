# OpenSpec delivery workflow

`openspec/AGENTS.md` governs proposal authoring. Root `AGENTS.md` governs an
approved proposal's implementation.

## Lifecycle

1. Propose and strictly validate the change.
2. Obtain human approval.
3. Implement unchecked tasks in order using tests at the specified public seam.
4. Check off a task only when its code and named proof pass.
5. Run independent standards and spec review over the full change.
6. Re-run the clean-checkout gate and obtain human sign-off before archiving.

Strict OpenSpec validation proves contract structure, not implementation.
Archiving is a human sign-off action and is never automatic.

## Canonical repository gate

Start an explicitly disposable local Postgres database whose database name and
user both end in `_test`, then export its URL as `DATABASE_TEST_URL`. The
Postgres gate fails rather than skips when this variable is missing or unsafe.
Run these repository commands from the root:

```text
pnpm format:check
pnpm lint
pnpm check:architecture
pnpm check:unused
pnpm typecheck
pnpm build
pnpm test
pnpm test:integration
pnpm test:e2e
pnpm check:file-sizes
pnpm openspec:validate
pnpm test:container
```

CI must install from the frozen lockfile, preserve upstream pipeline failures,
and fail if build/generation changes tracked files. A skipped command is a named
gap, not a pass.

Report repository proof separately from deployed-environment proof and
live-provider acceptance. Provider setup, secrets, migrations against a live
database, DNS, deployment, and external preview behavior require their own
authority and evidence.
