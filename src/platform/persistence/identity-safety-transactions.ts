import "server-only";

import type {
  AuditEvent,
  ProtectedActionTransactionOwner,
} from "../../modules/identity-safety/server";
import type { TransactionRunner } from "./transaction-runner";

export function createPostgresProtectedActionTransactions(
  runner: TransactionRunner,
): ProtectedActionTransactionOwner {
  return {
    run: (correlationId, operation) =>
      runner.run(correlationId, (transaction) =>
        operation({
          async writeAction(action): Promise<void> {
            await transaction.query(
              "insert into protected_actions (id, actor_account_id, action, target_id) values ($1, $2, $3, $4)",
              [
                action.actionId,
                action.actorAccountId,
                action.action,
                action.targetId ?? null,
              ],
            );
          },
          async appendAudit(event: AuditEvent): Promise<void> {
            await transaction.query(
              `insert into identity_safety_audit
                (id, category, actor_role, occurred_at, reason_code, policy_version, prior_state, resulting_state, restricted_evidence_references)
               values ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb)`,
              [
                event.id,
                event.category,
                event.actorRole,
                event.occurredAt,
                event.reasonCode,
                event.policyVersion,
                event.priorState,
                event.resultingState,
                JSON.stringify(event.restrictedEvidenceReferences),
              ],
            );
          },
        }),
      ),
  };
}
