import "server-only";

// source-size: reason=Account persistence keeps authentication, lifecycle, recovery, export, and erasure scheduling invariants together

import type {
  Account,
  AccountState,
  AuditEvent,
  AuthorizedDurableCommand,
} from "../../modules/identity-safety/server";
import {
  addDays,
  requireAuthorization,
  requiredBoolean,
  requiredDate,
  requiredString,
  writeAudit,
  writeNotice,
} from "./identity-safety-persistence-support";
import type { TransactionRunner } from "./transaction-runner";

export async function persistAuthenticatedAccount(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly account: Account;
  readonly method: {
    readonly id: string;
    readonly provider: string;
    readonly subject: string;
    readonly verifiedAt: Date;
  };
  readonly sessionId: string;
  readonly audit: AuditEvent;
}): Promise<"committed" | "deleted-account" | "identity-collision"> {
  requireAuthorization(input.authorization, {
    actorId: input.account.id,
    action: "account-authenticate",
    capability: "account.authenticate",
    targetKind: "account",
    targetId: input.account.id,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    await tx.query("select pg_advisory_xact_lock(hashtextextended($1,0))", [
      input.account.id,
    ]);
    await tx.query("select pg_advisory_xact_lock(hashtextextended($1,0))", [
      `${input.method.provider}:${input.method.subject}`,
    ]);
    const existingAccount = await tx.query<Record<string, unknown>>(
      "select state from accounts where id=$1 for update",
      [input.account.id],
    );
    const existingMethod = await tx.query<Record<string, unknown>>(
      "select account_id from authentication_methods where provider=$1 and provider_subject=$2 for update",
      [input.method.provider, input.method.subject],
    );
    if (
      existingMethod.rows[0] &&
      existingMethod.rows[0].account_id !== input.account.id
    )
      return "identity-collision" as const;
    if (existingAccount.rows[0]?.state === "deleted")
      return "deleted-account" as const;
    if (!existingAccount.rows[0]) {
      await tx.query(
        "insert into accounts (id,state,verified_contact) values ($1,'active',$2)",
        [input.account.id, input.account.verifiedContact],
      );
    }
    if (!existingMethod.rows[0]) {
      await tx.query(
        "insert into authentication_methods (id,account_id,provider,provider_subject,verified_at) values ($1,$2,$3,$4,$5)",
        [
          input.method.id,
          input.account.id,
          input.method.provider,
          input.method.subject,
          input.method.verifiedAt,
        ],
      );
    }
    await tx.query(
      "insert into account_sessions (id,account_id,reauthenticated_at) values ($1,$2,$3)",
      [input.sessionId, input.account.id, input.method.verifiedAt],
    );
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}

type LifecycleOperation =
  | "activate"
  | "limit"
  | "suspend"
  | "request-deletion"
  | "cancel-deletion"
  | "finalize-deletion";

interface LifecycleCommand {
  readonly accountId: string;
  readonly operation: LifecycleOperation;
  readonly now: Date;
}

export async function persistAccountLifecycle(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly accountId: string;
  readonly operation: LifecycleOperation;
  readonly recentReauthentication: boolean;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<
  "committed" | "invalid-transition" | "not-due" | "reauthentication-required"
> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: input.operation,
    capability: "account.lifecycle",
    targetKind: "account",
    targetId: input.accountId,
  });
  if (
    (input.operation === "request-deletion" ||
      input.operation === "cancel-deletion") &&
    !input.recentReauthentication
  ) {
    return "reauthentication-required";
  }
  return input.runner.run(input.audit.id, async (tx) => {
    const result = await tx.query<Record<string, unknown>>(
      "select state,deletion_requested_at,pre_deletion_state from accounts where id=$1 for update",
      [input.accountId],
    );
    const row = result.rows[0];
    if (!row) return "invalid-transition" as const;
    const state = accountState(row.state);
    const outcome = await applyLifecycleOperation(tx, input, row, state);
    if (outcome !== "committed") return outcome;
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}

export async function persistRecoveryDecision(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly recoveryId: string;
  readonly state: "pending" | "approved" | "denied";
  readonly accountId?: string | null;
  readonly holdUntil?: Date;
  readonly proofVerified?: boolean;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: `recovery-${input.state}`,
    capability: "account.recovery",
    targetKind: "recovery",
    targetId: input.recoveryId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    if (input.state === "pending") {
      if (!input.holdUntil) return "ineligible" as const;
      await tx.query(
        "insert into recovery_reviews (id,account_id,state,hold_until,proof_verified,created_at) values ($1,$2,'pending',$3,$4,$5)",
        [
          input.recoveryId,
          input.accountId ?? null,
          input.holdUntil,
          input.proofVerified ?? false,
          input.now,
        ],
      );
    } else {
      const result = await tx.query<Record<string, unknown>>(
        "select account_id,state,hold_until,proof_verified from recovery_reviews where id=$1 for update",
        [input.recoveryId],
      );
      const row = result.rows[0];
      if (!row || row.state !== "pending") return "ineligible" as const;
      const accountId =
        row.account_id === null
          ? null
          : requiredString(row.account_id, "recovery_reviews.account_id");
      if (
        input.state === "approved" &&
        (!accountId ||
          !requiredBoolean(
            row.proof_verified,
            "recovery_reviews.proof_verified",
          ) ||
          input.now <
            requiredDate(row.hold_until, "recovery_reviews.hold_until"))
      ) {
        return "ineligible" as const;
      }
      await tx.query("update recovery_reviews set state=$2 where id=$1", [
        input.recoveryId,
        input.state,
      ]);
      if (input.state === "approved" && accountId) {
        await revokeSessions(tx, accountId, input.now);
        await tx.query(
          "update accounts set verified_contact=false,recovery_reverification_required=true where id=$1",
          [accountId],
        );
        await tx.query(
          "update profile_claims set reverify_required=true where account_id=$1 and state='verified'",
          [accountId],
        );
        await tx.query(
          "update public_bylines set claimed_profile=false,profile_id=null where account_id=$1",
          [accountId],
        );
        await writeNotice(tx, {
          id: `${input.recoveryId}:notice`,
          accountId,
          kind: "recovery-approved",
          message:
            "Recovery completed; sign in and re-verify sensitive identity controls.",
          now: input.now,
        });
      }
    }
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}

export async function persistAuthenticationMethodChange(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly accountId: string;
  readonly recentReauthentication: boolean;
  readonly operation: "add" | "remove" | "correct";
  readonly method: {
    readonly id: string;
    readonly provider: string;
    readonly subject: string;
    readonly verifiedAt: Date;
  };
  readonly replacedMethodId?: string;
  readonly audit: AuditEvent;
}): Promise<
  "committed" | "last-method" | "method-not-found" | "reauthentication-required"
> {
  requireAuthorization(input.authorization, {
    actorId: input.accountId,
    action: `${input.operation}-authentication-method`,
    capability: "account.authentication-method",
    targetKind: "account",
    targetId: input.accountId,
  });
  if (!input.recentReauthentication) return "reauthentication-required";
  return input.runner.run(input.audit.id, async (tx) => {
    await tx.query("select pg_advisory_xact_lock(hashtextextended($1,0))", [
      input.accountId,
    ]);
    if (input.operation === "remove") {
      const count = await tx.query<Record<string, unknown>>(
        "select count(*)::int as count,bool_or(id=$2) as target_exists from authentication_methods where account_id=$1",
        [input.accountId, input.method.id],
      );
      const countValue = count.rows[0]?.count;
      if (typeof countValue !== "number")
        throw new Error("Invalid PostgreSQL authentication method count");
      if (count.rows[0]?.target_exists !== true)
        return "method-not-found" as const;
      if (countValue <= 1) return "last-method" as const;
      await tx.query(
        "delete from authentication_methods where id=$1 and account_id=$2",
        [input.method.id, input.accountId],
      );
    } else {
      if (input.operation === "correct" && input.replacedMethodId) {
        await tx.query(
          "delete from authentication_methods where id=$1 and account_id=$2",
          [input.replacedMethodId, input.accountId],
        );
      }
      await tx.query(
        "insert into authentication_methods (id,account_id,provider,provider_subject,verified_at) values ($1,$2,$3,$4,$5)",
        [
          input.method.id,
          input.accountId,
          input.method.provider,
          input.method.subject,
          input.method.verifiedAt,
        ],
      );
    }
    await writeNotice(tx, {
      id: `${input.audit.id}:notice`,
      accountId: input.accountId,
      kind: "authentication-method-changed",
      message: "A sign-in method changed on your Account.",
      now: input.audit.occurredAt,
    });
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}

export async function loadAuthorizedAccountData(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly accountId: string;
  readonly requesterAccountId: string;
  readonly recentReauthentication: boolean;
  readonly audit: AuditEvent;
}): Promise<
  | { readonly kind: "not-authorized" }
  | {
      readonly kind: "account-self-restricted";
      readonly account: {
        readonly id: string;
        readonly state: AccountState;
        readonly verifiedContact: boolean;
      };
      readonly methods: readonly {
        readonly provider: string;
        readonly verifiedAt: Date;
      }[];
    }
> {
  requireAuthorization(input.authorization, {
    actorId: input.requesterAccountId,
    action: "account-export",
    capability: "account.export",
    targetKind: "account",
    targetId: input.accountId,
  });
  if (
    input.accountId !== input.requesterAccountId ||
    !input.recentReauthentication
  )
    return { kind: "not-authorized" };
  return input.runner.run(input.audit.id, async (tx) => {
    const accountResult = await tx.query<Record<string, unknown>>(
      "select id,state,verified_contact from accounts where id=$1",
      [input.accountId],
    );
    const methodResult = await tx.query<Record<string, unknown>>(
      "select provider,verified_at from authentication_methods where account_id=$1 order by provider",
      [input.accountId],
    );
    const row = accountResult.rows[0];
    if (!row) return { kind: "not-authorized" as const };
    const projection = {
      kind: "account-self-restricted" as const,
      account: {
        id: requiredString(row.id, "accounts.id"),
        state: accountState(row.state),
        verifiedContact: requiredBoolean(
          row.verified_contact,
          "accounts.verified_contact",
        ),
      },
      methods: methodResult.rows.map((method) => ({
        provider: requiredString(
          method.provider,
          "authentication_methods.provider",
        ),
        verifiedAt: requiredDate(
          method.verified_at,
          "authentication_methods.verified_at",
        ),
      })),
    };
    await writeAudit(tx, input.audit);
    return projection;
  });
}

export async function finalizePrivateIdentityErasure(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly accountId: string;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "legal-hold" | "not-due"> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "erase-private-identity",
    capability: "retention.identity",
    targetKind: "account",
    targetId: input.accountId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const result = await tx.query<Record<string, unknown>>(
      "select state,identity_erasure_due_at,legal_hold from accounts where id=$1 for update",
      [input.accountId],
    );
    const row = result.rows[0];
    if (!row || row.state !== "deleted") return "not-due" as const;
    if (requiredBoolean(row.legal_hold, "accounts.legal_hold"))
      return "legal-hold" as const;
    if (
      input.now <
      requiredDate(
        row.identity_erasure_due_at,
        "accounts.identity_erasure_due_at",
      )
    )
      return "not-due" as const;
    await tx.query("delete from authentication_methods where account_id=$1", [
      input.accountId,
    ]);
    await tx.query("delete from account_sessions where account_id=$1", [
      input.accountId,
    ]);
    await tx.query(
      "update recovery_reviews set account_id=null where account_id=$1",
      [input.accountId],
    );
    await tx.query(
      "update accounts set verified_contact=false where id=$1 and state='deleted'",
      [input.accountId],
    );
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}

async function applyLifecycleOperation(
  tx: Parameters<typeof writeAudit>[0],
  input: LifecycleCommand,
  row: Record<string, unknown>,
  state: AccountState,
): Promise<"committed" | "invalid-transition" | "not-due"> {
  if (input.operation === "request-deletion")
    return requestDeletion(tx, input, state);
  if (input.operation === "cancel-deletion")
    return cancelDeletion(tx, input, row, state);
  if (input.operation === "finalize-deletion")
    return finalizeDeletion(tx, input, row, state);
  return applyEnforcementState(tx, input, state);
}

async function requestDeletion(
  tx: Parameters<typeof writeAudit>[0],
  input: LifecycleCommand,
  state: AccountState,
): Promise<"committed" | "invalid-transition"> {
  if (state === "deletion-pending" || state === "deleted")
    return "invalid-transition";
  await tx.query(
    "update accounts set state='deletion-pending',pre_deletion_state=$2,deletion_requested_at=$3 where id=$1",
    [input.accountId, state, input.now],
  );
  await revokeSessions(tx, input.accountId, input.now);
  return "committed";
}

async function cancelDeletion(
  tx: Parameters<typeof writeAudit>[0],
  input: LifecycleCommand,
  row: Record<string, unknown>,
  state: AccountState,
): Promise<"committed" | "invalid-transition" | "not-due"> {
  if (state !== "deletion-pending") return "invalid-transition";
  const requestedAt = requiredDate(
    row.deletion_requested_at,
    "accounts.deletion_requested_at",
  );
  if (input.now > addDays(requestedAt, 30)) return "not-due";
  const prior = accountState(row.pre_deletion_state);
  if (prior === "deletion-pending" || prior === "deleted")
    return "invalid-transition";
  await tx.query(
    "update accounts set state=$2,pre_deletion_state=null,deletion_requested_at=null where id=$1",
    [input.accountId, prior],
  );
  return "committed";
}

async function finalizeDeletion(
  tx: Parameters<typeof writeAudit>[0],
  input: LifecycleCommand,
  row: Record<string, unknown>,
  state: AccountState,
): Promise<"committed" | "invalid-transition" | "not-due"> {
  if (state !== "deletion-pending") return "invalid-transition";
  const requestedAt = requiredDate(
    row.deletion_requested_at,
    "accounts.deletion_requested_at",
  );
  if (input.now < addDays(requestedAt, 30)) return "not-due";
  await tx.query(
    "update accounts set state='deleted',identity_erasure_due_at=$2,backup_erasure_due_at=$3 where id=$1",
    [input.accountId, addDays(input.now, 30), addDays(input.now, 90)],
  );
  await revokeSessions(tx, input.accountId, input.now);
  return "committed";
}

async function applyEnforcementState(
  tx: Parameters<typeof writeAudit>[0],
  input: LifecycleCommand,
  state: AccountState,
): Promise<"committed" | "invalid-transition"> {
  if (state === "deletion-pending" || state === "deleted")
    return "invalid-transition";
  const next: AccountState =
    input.operation === "activate"
      ? "active"
      : input.operation === "limit"
        ? "limited"
        : "suspended";
  await tx.query("update accounts set state=$2 where id=$1", [
    input.accountId,
    next,
  ]);
  if (next === "suspended")
    await revokeSessions(tx, input.accountId, input.now);
  return "committed";
}

async function revokeSessions(
  tx: Parameters<typeof writeAudit>[0],
  accountId: string,
  now: Date,
): Promise<void> {
  await tx.query(
    "update account_sessions set revoked_at=$2 where account_id=$1 and revoked_at is null",
    [accountId, now],
  );
}

function accountState(value: unknown): AccountState {
  if (
    value === "active" ||
    value === "limited" ||
    value === "suspended" ||
    value === "deletion-pending" ||
    value === "deleted"
  )
    return value;
  throw new Error("Invalid PostgreSQL accounts.state");
}
