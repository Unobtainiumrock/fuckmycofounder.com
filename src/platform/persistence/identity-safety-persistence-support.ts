import "server-only";

import {
  matchesAuthorizedDurableCommand,
  type AuditEvent,
  type AuthorizedDurableCommand,
} from "../../modules/identity-safety/server";
import type { TransactionContext } from "./transaction-runner";

interface AuthorizationBinding {
  readonly actorId: string;
  readonly action: string;
  readonly capability: string;
  readonly targetKind: string;
  readonly targetId: string;
  readonly purpose?: string;
}

export function requireAuthorization(
  decision: AuthorizedDurableCommand,
  expected: AuthorizationBinding,
): void {
  if (!matchesAuthorizedDurableCommand(decision, expected)) {
    throw new Error("Durable command authorization does not match the command");
  }
}

export async function writeNotice(
  tx: TransactionContext,
  notice: {
    readonly id: string;
    readonly accountId: string;
    readonly kind: string;
    readonly message: string;
    readonly now: Date;
  },
): Promise<void> {
  await tx.query(
    "insert into identity_safety_notices (id,account_id,kind,safe_message,created_at) values ($1,$2,$3,$4,$5)",
    [notice.id, notice.accountId, notice.kind, notice.message, notice.now],
  );
}

export async function writeAudit(
  tx: TransactionContext,
  event: AuditEvent,
): Promise<void> {
  await tx.query(
    `insert into identity_safety_audit (id,category,actor_role,occurred_at,reason_code,policy_version,prior_state,resulting_state,restricted_evidence_references)
     values ($1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb)`,
    [
      event.id,
      event.category,
      event.actorRole,
      event.occurredAt,
      event.reasonCode,
      event.policyVersion,
      event.priorState,
      event.resultingState,
    ],
  );
  if (event.restrictedEvidenceReferences.length > 0) {
    await tx.query(
      "insert into audit_evidence_payloads (audit_id,restricted_references,expires_at) values ($1,$2::jsonb,$3)",
      [
        event.id,
        JSON.stringify(event.restrictedEvidenceReferences),
        addMonths(event.occurredAt, 24),
      ],
    );
  }
}

export async function hasRecentReauthentication(
  tx: TransactionContext,
  input: {
    readonly accountId: string;
    readonly sessionId: string;
    readonly now: Date;
  },
): Promise<boolean> {
  const result = await tx.query<Record<string, unknown>>(
    `select reauthenticated_at from account_sessions
     where id=$1 and account_id=$2 and revoked_at is null for update`,
    [input.sessionId, input.accountId],
  );
  const value = result.rows[0]?.reauthenticated_at;
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return false;
  const age = input.now.getTime() - value.getTime();
  return age >= 0 && age <= 15 * 60_000;
}

export function requiredDate(value: unknown, field: string): Date {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    throw new Error(`Invalid PostgreSQL ${field}`);
  }
  return value;
}

export function requiredString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value) {
    throw new Error(`Invalid PostgreSQL ${field}`);
  }
  return value;
}

export function requiredBoolean(value: unknown, field: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`Invalid PostgreSQL ${field}`);
  }
  return value;
}

export function addDays(value: Date, days: number): Date {
  return new Date(value.getTime() + days * 86_400_000);
}

function addMonths(value: Date, months: number): Date {
  return new Date(value.getTime() + months * 30 * 86_400_000);
}
