import "server-only";

import type {
  AccountState,
  AuditEvent,
  AuthorizedDurableCommand,
} from "../../modules/identity-safety/server";
import {
  hasRecentReauthentication,
  requireAuthorization,
  requiredBoolean,
  requiredDate,
  requiredString,
  writeAudit,
} from "./identity-safety-persistence-support";
import type { TransactionRunner } from "./transaction-runner";

export async function loadAuthorizedAccountData(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly accountId: string;
  readonly requesterAccountId: string;
  readonly sessionId: string;
  readonly now: Date;
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
  if (input.accountId !== input.requesterAccountId)
    return { kind: "not-authorized" };
  return input.runner.run(input.audit.id, async (tx) => {
    const accountResult = await tx.query<Record<string, unknown>>(
      "select id,state,verified_contact from accounts where id=$1 for update",
      [input.accountId],
    );
    const row = accountResult.rows[0];
    if (
      !row ||
      row.state === "deleted" ||
      !(await hasRecentReauthentication(tx, {
        accountId: input.accountId,
        sessionId: input.sessionId,
        now: input.now,
      }))
    )
      return { kind: "not-authorized" as const };
    const methodResult = await tx.query<Record<string, unknown>>(
      "select provider,verified_at from authentication_methods where account_id=$1 order by provider",
      [input.accountId],
    );
    const state = accountState(row.state);
    const projection = {
      kind: "account-self-restricted" as const,
      account: {
        id: requiredString(row.id, "accounts.id"),
        state,
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
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "account-export",
      occurredAt: input.now,
      priorState: state,
      resultingState: state,
    });
    return projection;
  });
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
  throw new Error("Invalid PostgreSQL Account state");
}
