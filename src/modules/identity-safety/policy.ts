import type {
  AuditEvent,
  PolicyContext,
  PolicyOutcome,
  StaffRole,
  RestrictedField,
} from "./model";
import { capabilitiesFor } from "./accounts";

export function evaluatePolicy(context: PolicyContext): PolicyOutcome {
  if (!context.policyAvailable) return { kind: "unavailable", retryable: true };
  if (!context.account) return { kind: "deny", code: "action-not-available" };
  if (context.sensitive && !context.recentReauthentication) {
    return { kind: "unmet-requirement", requirement: "reauthenticate" };
  }
  if (!context.account.verifiedContact && context.sensitive) {
    return { kind: "unmet-requirement", requirement: "verified-contact" };
  }
  if (
    context.blocked ||
    !context.capabilityEligible ||
    !context.riskApproved ||
    !capabilitiesFor(context.account).includes("protected-action")
  ) {
    return { kind: "deny", code: "action-not-available" };
  }
  return { kind: "allow", policyVersion: "identity-safety-v1" };
}

export interface ProtectedActionTransaction {
  writeAction(input: {
    readonly actionId: string;
    readonly actorAccountId: string;
    readonly action: string;
    readonly targetId?: string;
  }): Promise<void>;
  appendAudit(event: AuditEvent): Promise<void>;
}

export interface ProtectedActionTransactionOwner {
  run<Result>(
    correlationId: string,
    operation: (transaction: ProtectedActionTransaction) => Promise<Result>,
  ): Promise<Result>;
}

interface MemoryProtectedActionTransactions
  extends ProtectedActionTransactionOwner {
  snapshot(): {
    readonly actions: readonly {
      readonly actionId: string;
      readonly actorAccountId: string;
      readonly action: string;
      readonly targetId?: string;
    }[];
    readonly audits: readonly AuditEvent[];
    readonly transactionCount: number;
  };
}

export function createMemoryProtectedActionTransactions(): MemoryProtectedActionTransactions {
  const actions: {
    actionId: string;
    actorAccountId: string;
    action: string;
    targetId?: string;
  }[] = [];
  const audits: AuditEvent[] = [];
  let transactionCount = 0;

  return {
    async run<Result>(
      _correlationId: string,
      operation: (transaction: ProtectedActionTransaction) => Promise<Result>,
    ): Promise<Result> {
      const pendingActions: typeof actions = [];
      const pendingAudits: AuditEvent[] = [];
      const result = await operation({
        writeAction(action): Promise<void> {
          pendingActions.push(action);
          return Promise.resolve();
        },
        appendAudit(event): Promise<void> {
          pendingAudits.push(event);
          return Promise.resolve();
        },
      });
      transactionCount += 1;
      actions.push(...pendingActions);
      audits.push(...pendingAudits);
      return result;
    },
    snapshot: () => ({ actions, audits, transactionCount }),
  };
}

type ProtectedActionResult =
  | { readonly kind: "committed"; readonly actionId: string }
  | Exclude<PolicyOutcome, { readonly kind: "allow" }>;

export async function executeProtectedAction(input: {
  readonly context: PolicyContext;
  readonly actionId: string;
  readonly correlationId: string;
  readonly targetId?: string;
  readonly now: Date;
  readonly transactions: ProtectedActionTransactionOwner;
}): Promise<ProtectedActionResult> {
  const decision = evaluatePolicy(input.context);
  if (decision.kind !== "allow") return decision;
  if (!input.context.account) {
    return { kind: "deny", code: "action-not-available" };
  }

  await input.transactions.run(input.correlationId, async (transaction) => {
    await transaction.writeAction({
      actionId: input.actionId,
      actorAccountId: input.context.account!.id,
      action: input.context.action,
      ...(input.targetId ? { targetId: input.targetId } : {}),
    });
    await transaction.appendAudit({
      id: `${input.actionId}:audit`,
      category: "policy",
      actorRole: "account",
      occurredAt: input.now,
      reasonCode: input.context.action,
      policyVersion: decision.policyVersion,
      priorState: null,
      resultingState: "committed",
      restrictedEvidenceReferences: [],
    });
  });

  return { kind: "committed", actionId: input.actionId };
}

const staffGrants: Readonly<Record<StaffRole, readonly RestrictedField[]>> = {
  support: [],
  moderator: ["anonymous-author-linkage", "reporter-identity", "risk-signals"],
  "identity-reviewer": [
    "authentication-data",
    "claim-evidence",
    "risk-signals",
  ],
  legal: [
    "authentication-data",
    "anonymous-author-linkage",
    "block-direction",
    "claim-evidence",
    "legal-hold",
    "reporter-identity",
    "risk-signals",
  ],
};

export function mayRevealRestrictedField(input: {
  readonly role: StaffRole;
  readonly field: RestrictedField;
  readonly caseReason: string;
  readonly approved: boolean;
}): boolean {
  return Boolean(
    input.caseReason.trim() &&
      input.approved &&
      staffGrants[input.role].includes(input.field),
  );
}
