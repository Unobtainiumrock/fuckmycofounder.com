import "server-only";

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  EnforcementAction,
  ProfileClaim,
} from "../../modules/identity-safety";
import type {
  TransactionContext,
  TransactionRunner,
} from "./transaction-runner";

export async function persistClaimAppeal(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly id: string;
  readonly claim: Exclude<ProfileClaim, { readonly state: "pending" }>;
  readonly appellantAccountId: string;
  readonly reviewerId: string;
  readonly originalReviewerId: string;
  readonly newContext: string;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible" | "reviewer-conflict"> {
  assertAuthorized(input.authorization);
  if (input.reviewerId === input.originalReviewerId) return "reviewer-conflict";
  if (
    input.now > input.claim.appealDeadline ||
    input.claim.accountId !== input.appellantAccountId
  )
    return "ineligible";
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      "insert into claim_appeals (id,claim_id,appellant_account_id,reviewer_id,original_reviewer_id,new_context,created_at) values ($1,$2,$3,$4,$5,$6,$7)",
      [
        input.id,
        input.claim.id,
        input.appellantAccountId,
        input.reviewerId,
        input.originalReviewerId,
        input.newContext,
        input.now,
      ],
    );
    await writeAudit(tx, input.audit);
  });
  return "committed";
}

export async function persistAppeal(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly id: string;
  readonly caseId: string;
  readonly appellantAccountId: string;
  readonly reviewerId: string;
  readonly originalReviewerId: string;
  readonly newContext: string;
  readonly now: Date;
  readonly audit: AuditEvent;
  readonly affectedAccountId: string;
  readonly appealDeadline: Date | null;
}): Promise<"committed" | "ineligible" | "reviewer-conflict"> {
  assertAuthorized(input.authorization);
  if (input.reviewerId === input.originalReviewerId) return "reviewer-conflict";
  if (
    input.affectedAccountId !== input.appellantAccountId ||
    !input.appealDeadline ||
    input.now > input.appealDeadline
  )
    return "ineligible";
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      "insert into appeals (id,case_id,appellant_account_id,reviewer_id,original_reviewer_id,new_context,created_at) values ($1,$2,$3,$4,$5,$6,$7)",
      [
        input.id,
        input.caseId,
        input.appellantAccountId,
        input.reviewerId,
        input.originalReviewerId,
        input.newContext,
        input.now,
      ],
    );
    await tx.query("update moderation_cases set state='appealed' where id=$1", [
      input.caseId,
    ]);
    await writeAudit(tx, input.audit);
  });
  return "committed";
}

export async function persistAppealDecision(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly id: string;
  readonly appealId: string;
  readonly originalEnforcementId: string;
  readonly newEnforcementId: string;
  readonly affectedAccountId: string;
  readonly reviewerId: string;
  readonly action: EnforcementAction;
  readonly resultingAccountState?: "active" | "limited" | "suspended";
  readonly audit: AuditEvent;
}): Promise<void> {
  assertAuthorized(input.authorization);
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      `insert into enforcement_actions (id,case_id,outcome,policy_reason,effective_at,scope_or_duration,appeal_deadline)
       select $2,case_id,$3,$4,$5,$6,$7 from appeals where id=$1`,
      [
        input.appealId,
        input.newEnforcementId,
        input.action.outcome,
        input.action.policyReason,
        input.action.effectiveAt,
        input.action.scopeOrDuration,
        input.action.appealable
          ? new Date(input.action.effectiveAt.getTime() + 30 * 86_400_000)
          : null,
      ],
    );
    await tx.query(
      "insert into appeal_decisions (id,appeal_id,original_enforcement_id,new_enforcement_id,reviewer_id,decided_at) values ($1,$2,$3,$4,$5,$6)",
      [
        input.id,
        input.appealId,
        input.originalEnforcementId,
        input.newEnforcementId,
        input.reviewerId,
        input.action.effectiveAt,
      ],
    );
    await tx.query(
      "update moderation_cases set state='resolved' where id=(select case_id from appeals where id=$1)",
      [input.appealId],
    );
    if (input.resultingAccountState) {
      await tx.query("update accounts set state=$2 where id=$1", [
        input.affectedAccountId,
        input.resultingAccountState,
      ]);
      if (input.resultingAccountState === "suspended") {
        await tx.query(
          "update account_sessions set revoked_at=now() where account_id=$1 and revoked_at is null",
          [input.affectedAccountId],
        );
      }
    }
    await tx.query(
      "insert into identity_safety_notices (id,account_id,kind,safe_message,created_at) values ($1,$2,'appeal-decision',$3,$4)",
      [
        `${input.id}:notice`,
        input.affectedAccountId,
        `${input.action.policyReason}: ${input.action.outcome}; ${input.action.scopeOrDuration}`,
        input.action.effectiveAt,
      ],
    );
    await writeAudit(tx, input.audit);
  });
}

function assertAuthorized(decision: AuthorizedDurableCommand): void {
  if (
    decision.kind !== "authorized-durable-command" ||
    !decision.decisionId ||
    !decision.actorId ||
    !decision.capability ||
    !decision.policyVersion
  ) {
    throw new Error("Durable command requires a prior authorization decision");
  }
}

async function writeAudit(
  tx: TransactionContext,
  event: AuditEvent,
): Promise<void> {
  await tx.query(
    `insert into identity_safety_audit (id,category,actor_role,occurred_at,reason_code,policy_version,prior_state,resulting_state,restricted_evidence_references) values ($1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb)`,
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
        new Date(event.occurredAt.getTime() + 24 * 30 * 86_400_000),
      ],
    );
  }
}
