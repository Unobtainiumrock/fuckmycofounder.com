import "server-only";

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  ReportReason,
} from "../../modules/identity-safety/server";
import { abuseDecision } from "../../modules/identity-safety/server";
import {
  addDays,
  requireAuthorization,
  writeAudit,
} from "./identity-safety-persistence-support";
import type { TransactionRunner } from "./transaction-runner";

export async function persistModerationCaseTransition(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly caseId: string;
  readonly operation: "triage" | "investigate" | "close";
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "invalid-transition"> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: `moderation-${input.operation}`,
    capability: "trust-safety.moderate",
    targetKind: "case",
    targetId: input.caseId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const result = await tx.query<Record<string, unknown>>(
      "select state from moderation_cases where id=$1 for update",
      [input.caseId],
    );
    const state = result.rows[0]?.state;
    const valid =
      (input.operation === "triage" && state === "received") ||
      (input.operation === "investigate" && state === "triaged") ||
      (input.operation === "close" &&
        (state === "received" ||
          state === "triaged" ||
          state === "investigating" ||
          state === "resolved"));
    if (!valid) return "invalid-transition" as const;
    const next =
      input.operation === "triage"
        ? "triaged"
        : input.operation === "investigate"
          ? "investigating"
          : "closed";
    await tx.query(
      `update moderation_cases set state=$2,
       resolved_at=case when $2='closed' then $3 else resolved_at end,
       evidence_expires_at=case when $2='closed' then $4 else evidence_expires_at end,
       appeal_active=case when $2='closed' then false else appeal_active end
       where id=$1`,
      [input.caseId, next, input.now, addDays(input.now, 730)],
    );
    if (input.operation === "close") {
      await tx.query("update reports set expires_at=$2 where case_id=$1", [
        input.caseId,
        addDays(input.now, 730),
      ]);
    }
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: `moderation-${input.operation}`,
      priorState: typeof state === "string" ? state : null,
      resultingState: next,
    });
    return "committed" as const;
  });
}

export async function persistAbuseRiskReview(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly reviewId: string;
  readonly caseId: string;
  readonly subjectAccountId: string;
  readonly targetId: string;
  readonly reason: ReportReason;
  readonly attempts: number;
  readonly coordinatedAccounts: number;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<{
  readonly allowed: boolean;
  readonly reasonCode: string;
  readonly caseId: string | null;
}> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "abuse-risk-review",
    capability: "trust-safety.risk-review",
    targetKind: "abuse-review",
    targetId: input.reviewId,
  });
  const decision = abuseDecision(input);
  return input.runner.run(input.audit.id, async (tx) => {
    const subject = await tx.query<Record<string, unknown>>(
      "select state from accounts where id=$1 for update",
      [input.subjectAccountId],
    );
    if (!subject.rows[0]) throw new Error("Abuse-review subject unavailable");
    const routedCaseId = decision.allowed ? null : input.caseId;
    if (routedCaseId) {
      await tx.query(
        `insert into moderation_cases
         (id,target_id,state,queue,target_snapshot,affected_account_id,created_at)
         values ($1,$2,'received',$3,$4::jsonb,$5,$6)`,
        [
          routedCaseId,
          input.targetId,
          input.reason === "sexual-exploitation" ||
          input.reason === "threat-or-imminent-harm"
            ? "urgent"
            : "ordinary",
          JSON.stringify({
            kind: "unavailable",
            targetId: input.targetId,
            summary: "Restricted automated risk signal",
            capturedAt: input.now.toISOString(),
          }),
          input.subjectAccountId,
          input.now,
        ],
      );
    }
    await tx.query(
      `insert into abuse_reviews
       (id,subject_account_id,target_id,reason,attempts,coordinated_accounts,decision,reason_code,case_id,created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        input.reviewId,
        input.subjectAccountId,
        input.targetId,
        input.reason,
        input.attempts,
        input.coordinatedAccounts,
        decision.allowed ? "allowed" : "review-required",
        decision.reasonCode,
        routedCaseId,
        input.now,
      ],
    );
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "abuse-risk-review",
      reasonCode: decision.reasonCode,
      priorState: null,
      resultingState: decision.allowed ? "allowed" : "review-required",
    });
    return { ...decision, caseId: routedCaseId };
  });
}
