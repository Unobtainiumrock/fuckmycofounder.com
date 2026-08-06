import "server-only";

import {
  type PolicyContext,
  type PolicyOutcome,
} from "../../modules/identity-safety/server";
import {
  attemptRestrictedRevealAuthorization,
  type AuthorizedDurableCommand,
  type VerifiedStaffActor,
} from "../../modules/identity-safety/policy";
import { writeAudit } from "./identity-safety-persistence-support";
import type { TransactionRunner } from "./transaction-runner";

export async function authorizeRestrictedRevealBoundary(input: {
  readonly runner: TransactionRunner;
  readonly proof: VerifiedStaffActor;
  readonly context: Omit<PolicyContext, "action">;
  readonly decisionId: string;
  readonly linkageId: string;
  readonly caseId: string;
  readonly now: Date;
  readonly denialAuditId: string;
}): Promise<
  | {
      readonly kind: "authorized";
      readonly authorization: AuthorizedDurableCommand;
    }
  | {
      readonly kind: "denied";
      readonly outcome: Exclude<PolicyOutcome, { readonly kind: "allow" }>;
    }
> {
  const result = attemptRestrictedRevealAuthorization(input);
  if (result.kind === "authorized") return result;
  await input.runner.run(input.denialAuditId, async (tx) => {
    await writeAudit(
      tx,
      { id: input.denialAuditId },
      {
        authorization: result.denialAuthorization,
        action: "restricted-reveal-denied",
        occurredAt: input.now,
        reasonCode: "restricted-reveal-authorization-denied",
        priorState: "requested",
        resultingState: "denied",
        restrictedEvidenceReferences: [
          `denied-actor-id:${result.deniedActorId}`,
          `denied-actor-role:${result.deniedActorRole}`,
          `attempted-anonymous-linkage:${result.linkageId}`,
          `moderation-case:${result.caseId}`,
          `documented-purpose:${result.caseId}`,
        ],
      },
    );
  });
  return { kind: "denied", outcome: result.outcome };
}
