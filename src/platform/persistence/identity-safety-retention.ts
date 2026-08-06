import "server-only";

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  RetainedRecord,
} from "../../modules/identity-safety";
import type { TransactionRunner } from "./transaction-runner";

export async function runDurableRetention(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<readonly RetainedRecord["category"][]> {
  if (input.authorization.kind !== "authorized-durable-command") {
    throw new Error("Retention requires a prior authorization decision");
  }
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
    const retained = await tx.query<{ category: RetainedRecord["category"] }>(
      "update retained_records set encrypted_payload=null, completed_at=$1 where expires_at <= $1 and legal_hold=false and appeal_active=false and encrypted_payload is not null returning category",
      [input.now],
    );
    completed.push(...retained.rows.map(({ category }) => category));
    await tx.query(
      "update security_logs set minimized_payload=null where expires_at <= $1 and legal_hold=false",
      [input.now],
    );
    await tx.query(
      "update reports set private_context=null, evidence_references='[]'::jsonb where expires_at <= $1 and legal_hold=false and appeal_active=false",
      [input.now],
    );
    await tx.query(
      "update moderation_cases set target_snapshot='{}'::jsonb where evidence_expires_at <= $1 and legal_hold=false and appeal_active=false",
      [input.now],
    );
    await tx.query(
      "delete from audit_evidence_payloads where expires_at <= $1 and legal_hold=false and appeal_active=false",
      [input.now],
    );
    await tx.query(
      `insert into identity_safety_audit (id,category,actor_role,occurred_at,reason_code,policy_version,prior_state,resulting_state,restricted_evidence_references)
       values ($1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb)`,
      [
        input.audit.id,
        input.audit.category,
        input.audit.actorRole,
        input.audit.occurredAt,
        input.audit.reasonCode,
        input.audit.policyVersion,
        input.audit.priorState,
        input.audit.resultingState,
      ],
    );
  });
  return completed;
}
