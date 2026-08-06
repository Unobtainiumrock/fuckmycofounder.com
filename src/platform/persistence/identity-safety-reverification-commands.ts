import "server-only";

import type {
  AuditEvent,
  AuthorizedDurableCommand,
} from "../../modules/identity-safety/server";
import {
  hasRecentReauthentication,
  requireAuthorization,
  writeAudit,
  writeNotice,
} from "./identity-safety-persistence-support";
import type { TransactionRunner } from "./transaction-runner";

export async function persistRecoveryReverification(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly accountId: string;
  readonly operation: "contact" | "claim";
  readonly claimId?: string;
  readonly sessionId: string;
  readonly freshProofVerified: boolean;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible" | "proof-required"> {
  const targetId =
    input.operation === "contact" ? input.accountId : input.claimId;
  if (!targetId) return "ineligible";
  requireAuthorization(input.authorization, {
    actorId: input.accountId,
    action: `reverify-recovery-${input.operation}`,
    capability: "account.recovery-reverification",
    targetKind: input.operation === "contact" ? "account" : "claim",
    targetId,
  });
  if (!input.freshProofVerified) return "proof-required";
  return input.runner.run(input.audit.id, async (tx) => {
    const accountResult = await tx.query<Record<string, unknown>>(
      "select state,verified_contact,recovery_reverification_required from accounts where id=$1 for update",
      [input.accountId],
    );
    const account = accountResult.rows[0];
    if (!account || account.state !== "active") return "ineligible" as const;
    if (
      !(await hasRecentReauthentication(tx, {
        accountId: input.accountId,
        sessionId: input.sessionId,
        now: input.audit.occurredAt,
      }))
    )
      return "ineligible" as const;

    if (input.operation === "contact") {
      if (account.recovery_reverification_required !== true)
        return "ineligible" as const;
      await tx.query(
        "update accounts set verified_contact=true,recovery_reverification_required=false where id=$1",
        [input.accountId],
      );
    } else {
      if (
        account.verified_contact !== true ||
        account.recovery_reverification_required !== false
      )
        return "ineligible" as const;
      const claim = await tx.query<Record<string, unknown>>(
        "select account_id,state,reverify_required from profile_claims where id=$1 for update",
        [input.claimId],
      );
      if (
        claim.rows[0]?.account_id !== input.accountId ||
        claim.rows[0]?.state !== "verified" ||
        claim.rows[0]?.reverify_required !== true
      )
        return "ineligible" as const;
      await tx.query(
        "update profile_claims set reverify_required=false where id=$1",
        [input.claimId],
      );
    }
    await writeNotice(tx, {
      id: `${input.audit.id}:notice`,
      accountId: input.accountId,
      kind: `recovery-${input.operation}-reverified`,
      message:
        input.operation === "contact"
          ? "Your Account contact was re-verified after recovery."
          : "Your Profile Claim authority was re-verified after recovery.",
      now: input.audit.occurredAt,
    });
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: `reverify-recovery-${input.operation}`,
      priorState: "reverification-required",
      resultingState: "verified",
    });
    return "committed" as const;
  });
}
