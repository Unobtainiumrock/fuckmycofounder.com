// source-size: reason=central policy keeps account and verified-staff capability issuance with policy and audit contracts

import type {
  AuditEvent,
  PolicyContext,
  PolicyOutcome,
  StaffRole,
  RestrictedField,
} from "./model";
import { capabilitiesFor } from "./accounts";

declare const authorizedDurableCommandBrand: unique symbol;

export interface AuthorizedDurableCommand {
  readonly [authorizedDurableCommandBrand]: true;
  readonly kind: "authorized-durable-command";
  readonly decisionId: string;
  readonly actorId: string;
  readonly actorRole: CommandActorRole;
  readonly action: string;
  readonly capability: string;
  readonly targetKind: string;
  readonly targetId: string;
  readonly policyVersion: string;
  readonly purpose?: string;
}

interface DurableCommandAuditIdentity {
  readonly actorRole: CommandActorRole;
  readonly action: string;
  readonly policyVersion: string;
}

export type CommandActorRole =
  | "account"
  | StaffRole
  | "recovery-reviewer"
  | "retention-worker"
  | "system";

declare const verifiedStaffActorBrand: unique symbol;
interface VerifiedStaffActor {
  readonly [verifiedStaffActorBrand]: true;
  readonly actorId: string;
  readonly role: Exclude<CommandActorRole, "account">;
  readonly restrictedAccessApproved: boolean;
}

const issuedDurableCommands = new WeakSet<object>();
const issuedStaffActors = new WeakSet<object>();

export function durableCommandAuditIdentity(
  authorization: AuthorizedDurableCommand,
): DurableCommandAuditIdentity | null {
  if (!issuedDurableCommands.has(authorization)) return null;
  return {
    actorRole: authorization.actorRole,
    action: authorization.action,
    policyVersion: authorization.policyVersion,
  };
}

function issueDurableCommand(
  input: Omit<AuthorizedDurableCommand, typeof authorizedDurableCommandBrand>,
): AuthorizedDurableCommand {
  const authorization = Object.freeze(input) as AuthorizedDurableCommand;
  issuedDurableCommands.add(authorization);
  return authorization;
}

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
    !capabilitiesFor(context.account).includes(
      accountCapabilityForAction(context.action),
    )
  ) {
    return { kind: "deny", code: "action-not-available" };
  }
  return { kind: "allow", policyVersion: "identity-safety-v1" };
}

function accountCapabilityForAction(action: string) {
  if (action === "account-export") return "export-data" as const;
  if (action === "request-deletion" || action === "cancel-deletion")
    return "delete-account" as const;
  if (action === "profile-claim-appeal" || action === "moderation-appeal")
    return "appeal" as const;
  return "protected-action" as const;
}

export function authorizeDurableCommand(input: {
  readonly context: PolicyContext;
  readonly decisionId: string;
  readonly capability: string;
  readonly targetKind: string;
  readonly targetId: string;
}):
  | AuthorizedDurableCommand
  | Exclude<PolicyOutcome, { readonly kind: "allow" }> {
  const decision = evaluatePolicy(input.context);
  if (decision.kind !== "allow") return decision;
  if (!input.context.account) {
    return { kind: "deny", code: "action-not-available" };
  }
  if (!accountCommandAllowed(input.context.action, input.capability)) {
    return { kind: "deny", code: "action-not-available" };
  }
  if (
    accountSelfTargetRequired(input.context.action) &&
    (input.targetKind !== "account" ||
      input.targetId !== input.context.account.id)
  ) {
    return { kind: "deny", code: "action-not-available" };
  }
  return issueDurableCommand({
    kind: "authorized-durable-command",
    decisionId: input.decisionId,
    actorId: input.context.account.id,
    actorRole: "account",
    action: input.context.action,
    capability: input.capability,
    targetKind: input.targetKind,
    targetId: input.targetId,
    policyVersion: decision.policyVersion,
  });
}

function accountSelfTargetRequired(action: string): boolean {
  return new Set([
    "account-export",
    "add-authentication-method",
    "remove-authentication-method",
    "correct-authentication-method",
    "request-deletion",
    "cancel-deletion",
    "reverify-recovery-contact",
  ]).has(action);
}

export function authorizeStaffIdentityProof(input: {
  readonly actorId: string;
  readonly role: Exclude<CommandActorRole, "account">;
  readonly identityVerified: boolean;
  readonly restrictedAccessApproved?: boolean;
}):
  | VerifiedStaffActor
  | { readonly kind: "deny"; readonly code: "invalid-proof" } {
  if (!input.identityVerified) return { kind: "deny", code: "invalid-proof" };
  const proof = Object.freeze({
    actorId: input.actorId,
    role: input.role,
    restrictedAccessApproved: input.restrictedAccessApproved ?? false,
  }) as VerifiedStaffActor;
  issuedStaffActors.add(proof);
  return proof;
}

export function authorizeStaffCommand(input: {
  readonly proof: VerifiedStaffActor;
  readonly context: PolicyContext;
  readonly decisionId: string;
  readonly capability: string;
  readonly targetKind: string;
  readonly targetId: string;
  readonly purpose?: string;
}):
  | AuthorizedDurableCommand
  | Exclude<PolicyOutcome, { readonly kind: "allow" }> {
  const decision = evaluatePolicy(input.context);
  if (
    decision.kind !== "allow" ||
    !issuedStaffActors.has(input.proof) ||
    input.context.account?.id !== input.proof.actorId ||
    !staffCommandAllowed(
      input.proof.role,
      input.context.action,
      input.capability,
    )
  )
    return decision.kind === "allow"
      ? { kind: "deny", code: "action-not-available" }
      : decision;
  if (input.capability.startsWith("restricted.")) {
    const field = input.capability.slice(
      "restricted.".length,
    ) as RestrictedField;
    if (
      (input.proof.role !== "moderator" && input.proof.role !== "legal") ||
      !input.purpose ||
      !mayRevealRestrictedField({
        role: input.proof.role,
        field,
        caseReason: input.purpose,
        approved: input.proof.restrictedAccessApproved,
      })
    )
      return { kind: "deny", code: "action-not-available" };
  }
  return issueDurableCommand({
    kind: "authorized-durable-command",
    decisionId: input.decisionId,
    actorId: input.proof.actorId,
    actorRole: input.proof.role,
    action: input.context.action,
    capability: input.capability,
    targetKind: input.targetKind,
    targetId: input.targetId,
    policyVersion: decision.policyVersion,
    ...(input.purpose ? { purpose: input.purpose } : {}),
  });
}

export function authorizeAuthenticationProof(input: {
  readonly decisionId: string;
  readonly accountId: string;
  readonly providerProofVerified: boolean;
}):
  | AuthorizedDurableCommand
  | { readonly kind: "deny"; readonly code: "invalid-proof" } {
  if (!input.providerProofVerified)
    return { kind: "deny", code: "invalid-proof" };
  return issueDurableCommand({
    kind: "authorized-durable-command",
    decisionId: input.decisionId,
    actorId: input.accountId,
    actorRole: "account",
    action: "account-authenticate",
    capability: "account.authenticate",
    targetKind: "account",
    targetId: input.accountId,
    policyVersion: "identity-safety-v1",
  });
}

function accountCommandAllowed(action: string, capability: string): boolean {
  return new Set([
    "account-block:trust-safety.block",
    "account-export:account.export",
    "add-authentication-method:account.authentication-method",
    "remove-authentication-method:account.authentication-method",
    "correct-authentication-method:account.authentication-method",
    "byline-write:public-byline.write",
    "byline-claim-link:public-byline.claim",
    "profile-claim-submit:profile-claim.submit",
    "profile-claim-appeal:profile-claim.appeal",
    "moderation-appeal:trust-safety.appeal",
    "report-create:trust-safety.report",
    "request-deletion:account.lifecycle",
    "cancel-deletion:account.lifecycle",
    "reverify-recovery-contact:account.recovery-reverification",
    "reverify-recovery-claim:account.recovery-reverification",
    "save-protected-intent:protected-action",
  ]).has(`${action}:${capability}`);
}

function staffCommandAllowed(
  role: Exclude<CommandActorRole, "account">,
  action: string,
  capability: string,
): boolean {
  const key = `${action}:${capability}`;
  const grants: Record<
    Exclude<CommandActorRole, "account">,
    ReadonlySet<string>
  > = {
    support: new Set(),
    moderator: new Set([
      "moderation-triage:trust-safety.moderate",
      "moderation-investigate:trust-safety.moderate",
      "moderation-close:trust-safety.moderate",
      "moderation-enforce:trust-safety.enforce",
      "moderation-appeal-decision:trust-safety.appeal-decide",
      "restricted-reveal:restricted.anonymous-author-linkage",
      "restricted-reveal-approve:restricted.anonymous-author-linkage",
      "restricted-reveal-project:restricted.anonymous-author-linkage",
      "audit-mutation-attempt:audit.append-only",
    ]),
    "identity-reviewer": new Set([
      "profile-claim-decide:profile-claim.decide",
      "profile-claim-appeal-decision:profile-claim.appeal-decide",
    ]),
    legal: new Set([
      "legal-hold-apply:retention.legal-hold",
      "legal-hold-release:retention.legal-hold",
      "restricted-reveal:restricted.anonymous-author-linkage",
      "restricted-reveal-approve:restricted.anonymous-author-linkage",
      "restricted-reveal-project:restricted.anonymous-author-linkage",
    ]),
    "recovery-reviewer": new Set([
      "recovery-pending:account.recovery",
      "recovery-approved:account.recovery",
      "recovery-denied:account.recovery",
    ]),
    "retention-worker": new Set([
      "retention-run:retention.execute",
      "erase-private-identity:retention.identity",
    ]),
    system: new Set([
      "finalize-deletion:account.lifecycle",
      "abuse-risk-review:trust-safety.risk-review",
      "restricted-reveal-denied:audit.restricted-reveal-denial",
      "activate:account.lifecycle",
      "limit:account.lifecycle",
      "suspend:account.lifecycle",
    ]),
  };
  return grants[role].has(key);
}

export function matchesAuthorizedDurableCommand(
  decision: AuthorizedDurableCommand,
  expected: {
    readonly actorId: string;
    readonly action: string;
    readonly capability: string;
    readonly targetKind: string;
    readonly targetId: string;
    readonly purpose?: string;
  },
): boolean {
  return (
    issuedDurableCommands.has(decision) &&
    decision.actorId === expected.actorId &&
    decision.action === expected.action &&
    decision.capability === expected.capability &&
    decision.targetKind === expected.targetKind &&
    decision.targetId === expected.targetId &&
    (expected.purpose === undefined || decision.purpose === expected.purpose) &&
    decision.policyVersion === "identity-safety-v1"
  );
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
