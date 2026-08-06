import "server-only";

import {
  durableCommandAuditIdentity,
  matchesAuthorizedDurableCommand,
  type AuditEvent,
  type AuthorizedDurableCommand,
  type RestrictedTargetSnapshot,
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
  event: Pick<AuditEvent, "id">,
  input: {
    readonly authorization: AuthorizedDurableCommand;
    readonly action: string;
    readonly occurredAt: Date;
    readonly reasonCode?: string;
    readonly priorState: string | null;
    readonly resultingState: string;
    readonly restrictedEvidenceReferences?: readonly string[];
  },
): Promise<void> {
  const identity = durableCommandAuditIdentity(input.authorization);
  if (!identity || identity.action !== input.action)
    throw new Error("Audit transition authorization does not match command");
  await tx.query(
    `insert into identity_safety_audit (id,category,actor_role,occurred_at,reason_code,policy_version,prior_state,resulting_state,restricted_evidence_references)
     values ($1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb)`,
    [
      event.id,
      auditCategory(identity.action),
      identity.actorRole,
      input.occurredAt,
      input.reasonCode ?? identity.action,
      identity.policyVersion,
      input.priorState,
      input.resultingState,
    ],
  );
  const restrictedReferences = input.restrictedEvidenceReferences ?? [];
  if (restrictedReferences.length > 0) {
    await tx.query(
      "insert into audit_evidence_payloads (audit_id,restricted_references,expires_at) values ($1,$2::jsonb,$3)",
      [
        event.id,
        JSON.stringify(restrictedReferences),
        addMonths(input.occurredAt, 24),
      ],
    );
  }
}

const exactAuditCategories = new Map<string, AuditEvent["category"]>([
  ["byline-claim-link", "claim"],
  ["profile-claim-appeal", "appeal"],
  ["profile-claim-appeal-decision", "appeal"],
  ["moderation-enforce", "enforcement"],
  ["report-create", "moderation"],
  ["account-block", "moderation"],
  ["abuse-risk-review", "moderation"],
  ["restricted-reveal", "policy"],
  ["restricted-reveal-approve", "policy"],
  ["restricted-reveal-project", "policy"],
  ["audit-mutation-attempt", "policy"],
  ["account-authenticate", "identity"],
  ["account-export", "identity"],
  ["byline-write", "identity"],
  ["request-deletion", "identity"],
  ["cancel-deletion", "identity"],
  ["finalize-deletion", "identity"],
  ["erase-private-identity", "identity"],
  ["activate", "identity"],
  ["limit", "identity"],
  ["suspend", "identity"],
]);

const prefixAuditCategories = [
  ["profile-claim-", "claim"],
  ["moderation-appeal", "appeal"],
  ["retention-", "retention"],
  ["legal-hold-", "retention"],
  ["moderation-", "moderation"],
  ["recovery-", "identity"],
  ["reverify-recovery-", "identity"],
] as const;

function auditCategory(action: string): AuditEvent["category"] {
  const exact = exactAuditCategories.get(action);
  if (exact) return exact;
  if (action.includes("authentication-method")) return "identity";
  const prefixed = prefixAuditCategories.find(([prefix]) =>
    action.startsWith(prefix),
  )?.[1];
  if (prefixed) return prefixed;
  throw new Error(`Audit category unavailable for action: ${action}`);
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

export function restrictedSnapshot(
  value: RestrictedTargetSnapshot,
  expectedTargetId: string,
): string {
  if (
    !["account", "profile", "public-object", "unavailable"].includes(
      value.kind,
    ) ||
    !bounded(value.targetId, 200) ||
    value.targetId !== expectedTargetId ||
    !bounded(value.summary, 2_000) ||
    !(value.capturedAt instanceof Date) ||
    Number.isNaN(value.capturedAt.getTime()) ||
    (value.contentReference !== undefined &&
      !bounded(value.contentReference, 500))
  )
    throw new Error("Restricted target snapshot is invalid");
  return JSON.stringify({
    kind: value.kind,
    targetId: value.targetId,
    summary: value.summary,
    capturedAt: value.capturedAt.toISOString(),
    ...(value.contentReference
      ? { contentReference: value.contentReference }
      : {}),
  });
}

function bounded(value: unknown, maximum: number): value is string {
  return (
    typeof value === "string" && value.length > 0 && value.length <= maximum
  );
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
