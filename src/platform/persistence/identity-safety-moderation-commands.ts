import "server-only";

import type {
  AuditEvent,
  AuthorizedDurableCommand,
} from "../../modules/identity-safety/server";
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
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}
