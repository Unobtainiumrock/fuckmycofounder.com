import "server-only";

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  StaffRole,
} from "../../modules/identity-safety/server";
import {
  requireAuthorization,
  writeAudit,
} from "./identity-safety-persistence-support";
import type { TransactionRunner } from "./transaction-runner";

export async function recordRestrictedRevealDenial(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly deniedActorId: string;
  readonly deniedActorRole: Exclude<StaffRole, "moderator" | "legal">;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<void> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "restricted-reveal-denied",
    capability: "audit.restricted-reveal-denial",
    targetKind: "actor",
    targetId: input.deniedActorId,
  });
  if (!unauthorizedRevealRoles.has(input.deniedActorRole))
    throw new Error(
      "Restricted reveal denial requires an unauthorized staff role",
    );
  await input.runner.run(input.audit.id, async (tx) => {
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "restricted-reveal-denied",
      occurredAt: input.now,
      reasonCode: `restricted-reveal-role-denied:${input.deniedActorRole}`,
      priorState: "requested",
      resultingState: "denied",
      restrictedEvidenceReferences: [],
    });
  });
}

const unauthorizedRevealRoles: ReadonlySet<StaffRole> = new Set([
  "support",
  "identity-reviewer",
]);
