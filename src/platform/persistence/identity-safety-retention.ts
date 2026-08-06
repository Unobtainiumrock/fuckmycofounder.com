import "server-only";

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  RetainedRecord,
} from "../../modules/identity-safety/server";
import {
  requireAuthorization,
  requiredString,
  writeAudit,
} from "./identity-safety-persistence-support";
import type { TransactionRunner } from "./transaction-runner";

export async function runDurableRetention(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly jobId: string;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<readonly RetainedRecord["category"][]> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "retention-run",
    capability: "retention.execute",
    targetKind: "retention-job",
    targetId: input.jobId,
  });
  const completed: RetainedRecord["category"][] = [];
  await input.runner.run(input.audit.id, async (tx) => {
    const claim = await tx.query(
      "update profile_claims set encrypted_evidence=null where evidence_expires_at <= $1 and legal_hold=false and appeal_active=false and encrypted_evidence is not null returning id",
      [input.now],
    );
    if (claim.rowCount) completed.push("claim-evidence");
    const anonymous = await tx.query(
      "update anonymous_linkages set encrypted_payload=null where expires_at <= $1 and legal_hold=false and appeal_active=false and encrypted_payload is not null returning id",
      [input.now],
    );
    if (anonymous.rowCount) completed.push("anonymous-linkage");
    const retained = await tx.query<Record<string, unknown>>(
      "update retained_records set encrypted_payload=null,completed_at=$1 where expires_at <= $1 and legal_hold=false and appeal_active=false and encrypted_payload is not null returning category",
      [input.now],
    );
    for (const row of retained.rows)
      completed.push(retentionCategory(row.category));
    const security = await tx.query(
      "update security_logs set minimized_payload=null where expires_at <= $1 and legal_hold=false and minimized_payload is not null returning id",
      [input.now],
    );
    if (security.rowCount) completed.push("security-log");
    const reports = await tx.query(
      "update reports set private_context=null,evidence_references='[]'::jsonb where expires_at <= $1 and legal_hold=false and appeal_active=false and (private_context is not null or evidence_references <> '[]'::jsonb) returning id",
      [input.now],
    );
    if (reports.rowCount) completed.push("report-evidence");
    const cases = await tx.query(
      "update moderation_cases set target_snapshot='{}'::jsonb where evidence_expires_at <= $1 and legal_hold=false and appeal_active=false and target_snapshot <> '{}'::jsonb returning id",
      [input.now],
    );
    if (cases.rowCount) completed.push("moderation-evidence");
    const auditEvidence = await tx.query(
      "delete from audit_evidence_payloads where expires_at <= $1 and legal_hold=false and appeal_active=false returning audit_id",
      [input.now],
    );
    if (auditEvidence.rowCount) completed.push("audit-evidence");
    await writeAudit(tx, input.audit);
  });
  return completed;
}

type LegalHoldScope =
  | "account"
  | "claim"
  | "report"
  | "case"
  | "audit"
  | "anonymous-linkage"
  | "security-log";

export async function persistLegalHold(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly holdId: string;
  readonly scopeKind: LegalHoldScope;
  readonly scopeId: string;
  readonly authority: string;
  readonly reason: string;
  readonly operation: "apply" | "release";
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: `legal-hold-${input.operation}`,
    capability: "retention.legal-hold",
    targetKind: input.scopeKind,
    targetId: input.scopeId,
  });
  if (!input.authority.trim() || !input.reason.trim()) return "ineligible";
  return input.runner.run(input.audit.id, async (tx) => {
    if (input.operation === "apply") {
      await tx.query(
        "insert into legal_holds (id,scope_kind,scope_id,authority,reason,created_at) values ($1,$2,$3,$4,$5,$6)",
        [
          input.holdId,
          input.scopeKind,
          input.scopeId,
          input.authority,
          input.reason,
          input.now,
        ],
      );
      await setScopedHold(tx, input.scopeKind, input.scopeId, true);
    } else {
      const hold = await tx.query<Record<string, unknown>>(
        "select scope_kind,scope_id from legal_holds where id=$1 and released_at is null for update",
        [input.holdId],
      );
      const row = hold.rows[0];
      if (
        !row ||
        row.scope_kind !== input.scopeKind ||
        row.scope_id !== input.scopeId
      )
        return "ineligible" as const;
      await tx.query("update legal_holds set released_at=$2 where id=$1", [
        input.holdId,
        input.now,
      ]);
      await setScopedHold(tx, input.scopeKind, input.scopeId, false);
    }
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}

async function setScopedHold(
  tx: Parameters<typeof writeAudit>[0],
  kind: LegalHoldScope,
  id: string,
  held: boolean,
): Promise<void> {
  if (kind === "audit") {
    const exists = await tx.query(
      "select id from identity_safety_audit where id=$1",
      [id],
    );
    if (exists.rowCount !== 1)
      throw new Error("Legal hold scope does not exist");
    await tx.query(
      "update audit_evidence_payloads set legal_hold=$2 where audit_id=$1",
      [id, held],
    );
    return;
  }
  const target = {
    account: ["accounts", "id"],
    claim: ["profile_claims", "id"],
    report: ["reports", "id"],
    case: ["moderation_cases", "id"],
    "anonymous-linkage": ["anonymous_linkages", "id"],
    "security-log": ["security_logs", "id"],
  }[kind];
  if (!target) throw new Error("Unsupported legal hold scope");
  const result = await tx.query(
    `update ${target[0]} set legal_hold=$2 where ${target[1]}=$1`,
    [id, held],
  );
  if (result.rowCount !== 1) throw new Error("Legal hold scope does not exist");
}

function retentionCategory(value: unknown): RetainedRecord["category"] {
  const category = requiredString(value, "retained_records.category");
  if (
    category === "private-identity" ||
    category === "recovery" ||
    category === "claim-evidence" ||
    category === "anonymous-linkage" ||
    category === "report-evidence" ||
    category === "moderation-evidence" ||
    category === "security-log" ||
    category === "audit-evidence" ||
    category === "safety-audit" ||
    category === "backup"
  )
    return category;
  throw new Error("Invalid PostgreSQL retained_records.category");
}
