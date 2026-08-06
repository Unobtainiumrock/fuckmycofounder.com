import "server-only";

// source-size: reason=identity safety commands keep authorization, one-transaction ownership, state effects, notices, and audit writes colocated

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  EnforcementAction,
  RestrictedModerationCaseRecord,
  RestrictedReportRecord,
  RestrictedTargetSnapshot,
  RestrictedField,
} from "../../modules/identity-safety/server";
import { restrictedAttributionFromAuditedRecord } from "../../modules/identity-safety/server";
import {
  addDays,
  requireAuthorization,
  requiredString,
  writeAudit,
  writeNotice,
} from "./identity-safety-persistence-support";
import type {
  TransactionContext,
  TransactionRunner,
} from "./transaction-runner";

export async function persistReportAndCase(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly report: RestrictedReportRecord;
  readonly moderationCase: RestrictedModerationCaseRecord;
  readonly targetAccountId: string;
  readonly targetClaimId?: string;
  readonly targetSnapshot: RestrictedTargetSnapshot;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "report-create",
    capability: "trust-safety.report",
    targetKind: "report",
    targetId: input.report.id,
  });
  if (input.actorId !== input.report.reporterAccountId)
    throw new Error("Report actor must match reporter identity");
  if (
    input.moderationCase.id !== input.report.caseId ||
    input.moderationCase.targetId !== input.report.targetId
  )
    return "ineligible";
  const targetSnapshot = restrictedSnapshot(
    input.targetSnapshot,
    input.report.targetId,
  );
  const requiredQueue =
    input.report.reason === "threat-or-imminent-harm" ? "urgent" : "ordinary";
  return input.runner.run(input.audit.id, async (tx) => {
    const reporter = await tx.query<Record<string, unknown>>(
      "select state from accounts where id=$1 for update",
      [input.actorId],
    );
    if (reporter.rows[0]?.state !== "active") return "ineligible" as const;
    const createdCase = await tx.query(
      `insert into moderation_cases (id,target_id,state,queue,target_snapshot,created_at,evidence_expires_at,affected_account_id,affected_claim_id) values ($1,$2,$3,$4,$5::jsonb,$6,$7,$8,$9)
       on conflict (id) do nothing`,
      [
        input.moderationCase.id,
        input.moderationCase.targetId,
        input.moderationCase.state,
        requiredQueue,
        targetSnapshot,
        input.report.createdAt,
        null,
        input.targetAccountId,
        input.targetClaimId ?? null,
      ],
    );
    const canonicalCase = await tx.query<Record<string, unknown>>(
      "select target_id,affected_account_id,affected_claim_id,state,queue from moderation_cases where id=$1 for update",
      [input.moderationCase.id],
    );
    const caseRow = canonicalCase.rows[0];
    if (!caseAcceptsReport(caseRow, input)) return "ineligible" as const;
    if (requiredQueue === "urgent" && caseRow.queue !== "urgent") {
      await tx.query("update moderation_cases set queue='urgent' where id=$1", [
        input.moderationCase.id,
      ]);
    }
    await tx.query(
      `insert into reports (id,case_id,reporter_account_id,target_id,reason,private_context,evidence_references,created_at,expires_at)
       values ($1,$2,$3,$4,$5,$6,$7::jsonb,$8,$9) on conflict (case_id,reporter_account_id,target_id,reason) do nothing`,
      [
        input.report.id,
        input.report.caseId,
        input.report.reporterAccountId,
        input.report.targetId,
        input.report.reason,
        input.report.context ?? null,
        JSON.stringify(input.report.evidenceReferences),
        input.report.createdAt,
        null,
      ],
    );
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "report-create",
      reasonCode: `report:${input.report.reason}`,
      priorState:
        createdCase.rowCount === 1 || typeof caseRow.state !== "string"
          ? null
          : caseRow.state,
      resultingState:
        typeof caseRow.state === "string" ? caseRow.state : "received",
    });
    return "committed" as const;
  });
}

function caseAcceptsReport(
  row: Record<string, unknown> | undefined,
  input: Parameters<typeof persistReportAndCase>[0],
): row is Record<string, unknown> {
  return Boolean(
    row &&
      row.target_id === input.report.targetId &&
      row.affected_account_id === input.targetAccountId &&
      (row.affected_claim_id ?? null) === (input.targetClaimId ?? null) &&
      row.state !== "closed",
  );
}

export async function persistEnforcement(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly reviewerId: string;
  readonly id: string;
  readonly caseId: string;
  readonly targetId: string;
  readonly action: EnforcementAction;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  if (input.actorId !== input.reviewerId)
    throw new Error("Enforcement actor must match the deciding reviewer");
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "moderation-enforce",
    capability: "trust-safety.enforce",
    targetKind: "case",
    targetId: input.caseId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const target = await loadEnforcementTarget(tx, input);
    if (!target) return "ineligible" as const;
    await tx.query(
      "insert into enforcement_actions (id,case_id,outcome,policy_reason,effective_at,scope_or_duration,appeal_deadline,affected_account_id,affected_claim_id,prior_account_state,prior_claim_state) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      [
        input.id,
        input.caseId,
        input.action.outcome,
        input.action.policyReason,
        input.action.effectiveAt,
        input.action.scopeOrDuration,
        input.action.appealable ? addDays(input.action.effectiveAt, 30) : null,
        target.accountId,
        target.claimId,
        target.priorAccountState,
        target.priorClaimState,
      ],
    );
    await tx.query(
      "update moderation_cases set state='resolved',original_reviewer_id=$2,resolved_at=$3,evidence_expires_at=$4 where id=$1 and state='investigating'",
      [
        input.caseId,
        input.reviewerId,
        input.action.effectiveAt,
        addDays(input.action.effectiveAt, 730),
      ],
    );
    await tx.query("update reports set expires_at=$2 where case_id=$1", [
      input.caseId,
      addDays(input.action.effectiveAt, 730),
    ]);
    await applyEnforcementEffects(tx, input, target);
    await writeNotice(tx, {
      id: `${input.id}:notice`,
      accountId: target.accountId,
      kind: "enforcement",
      message: `Target ${input.targetId}; ${input.action.policyReason}; ${input.action.outcome}; effective ${input.action.effectiveAt.toISOString()}; ${input.action.scopeOrDuration}; appeal ${input.action.appealable ? "available for 30 days" : "not available"}.`,
      now: input.action.effectiveAt,
    });
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "moderation-enforce",
      reasonCode: input.action.policyReason,
      priorState: "investigating",
      resultingState: "resolved",
    });
    return "committed" as const;
  });
}

interface EnforcementTarget {
  readonly accountId: string;
  readonly claimId: string | null;
  readonly priorAccountState: string;
  readonly priorClaimState: string | null;
}

async function loadEnforcementTarget(
  tx: TransactionContext,
  input: Parameters<typeof persistEnforcement>[0],
): Promise<EnforcementTarget | null> {
  const result = await tx.query<Record<string, unknown>>(
    "select state,target_id,affected_account_id,affected_claim_id from moderation_cases where id=$1 for update",
    [input.caseId],
  );
  const row = result.rows[0];
  if (
    row?.state !== "investigating" ||
    row.target_id !== input.targetId ||
    typeof row.affected_account_id !== "string"
  )
    return null;
  const accountId = row.affected_account_id;
  const claimId =
    typeof row.affected_claim_id === "string" ? row.affected_claim_id : null;
  const account = await tx.query<Record<string, unknown>>(
    "select state from accounts where id=$1 for update",
    [accountId],
  );
  if (typeof account.rows[0]?.state !== "string") return null;
  let priorClaimState: string | null = null;
  if (input.action.outcome === "profile-claim-revoked") {
    if (!claimId) return null;
    const claim = await tx.query<Record<string, unknown>>(
      "select account_id,state from profile_claims where id=$1 for update",
      [claimId],
    );
    if (
      claim.rows[0]?.account_id !== accountId ||
      typeof claim.rows[0]?.state !== "string"
    )
      return null;
    priorClaimState = claim.rows[0].state;
  }
  return {
    accountId,
    claimId,
    priorAccountState: account.rows[0].state,
    priorClaimState,
  };
}

async function applyEnforcementEffects(
  tx: TransactionContext,
  input: Parameters<typeof persistEnforcement>[0],
  target: EnforcementTarget,
): Promise<void> {
  if (
    input.action.outcome === "account-limited" ||
    input.action.outcome === "account-suspended"
  ) {
    await tx.query("update accounts set state=$2 where id=$1", [
      target.accountId,
      input.action.outcome === "account-limited" ? "limited" : "suspended",
    ]);
    if (input.action.outcome === "account-suspended")
      await revokeAccountSessions(
        tx,
        target.accountId,
        input.action.effectiveAt,
      );
  }
  if (input.action.outcome !== "profile-claim-revoked" || !target.claimId)
    return;
  await tx.query(
    "update profile_claims set state='revoked', decided_at=$2, evidence_expires_at=$3 where id=$1",
    [
      target.claimId,
      input.action.effectiveAt,
      addDays(input.action.effectiveAt, 90),
    ],
  );
  await tx.query(
    "update public_bylines set claimed_profile=false, profile_id=null where account_id=$1",
    [target.accountId],
  );
  await revokeAccountSessions(tx, target.accountId, input.action.effectiveAt);
}

async function revokeAccountSessions(
  tx: TransactionContext,
  accountId: string,
  now: Date,
): Promise<void> {
  await tx.query(
    "update account_sessions set revoked_at=$2 where account_id=$1 and revoked_at is null",
    [accountId, now],
  );
}

export async function recordRestrictedReveal(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly id: string;
  readonly actorId: string;
  readonly approverId: string;
  readonly caseReason: string;
  readonly linkageId: string;
  readonly field: RestrictedField;
  readonly audit: AuditEvent;
}): Promise<{ readonly revealId: string; readonly auditId: string }> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "restricted-reveal",
    capability: `restricted.${input.field}`,
    targetKind: "anonymous-linkage",
    targetId: input.linkageId,
    purpose: input.caseReason,
  });
  if (!input.actorId || !input.approverId || !input.caseReason)
    throw new Error("Restricted reveal requires actor, approver, and reason");
  await input.runner.run(input.audit.id, async (tx) => {
    const linkage = await tx.query<Record<string, unknown>>(
      "select id from anonymous_linkages where id=$1 for update",
      [input.linkageId],
    );
    if (!linkage.rows[0])
      throw new Error("Restricted reveal linkage is unavailable");
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "restricted-reveal",
      reasonCode: input.caseReason,
      priorState: null,
      resultingState: "revealed",
    });
    await tx.query(
      "insert into restricted_reveals (id,actor_id,approver_id,case_reason,field_class,linkage_id,allowed,audit_id,created_at) values ($1,$2,$3,$4,$5,$6,true,$7,$8)",
      [
        input.id,
        input.actorId,
        input.approverId,
        input.caseReason,
        input.field,
        input.linkageId,
        input.audit.id,
        input.audit.occurredAt,
      ],
    );
  });
  return { revealId: input.id, auditId: input.audit.id };
}

export async function recordAuditMutationAttempt(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly targetAuditId: string;
  readonly attemptedOperation: "update" | "delete";
  readonly event: AuditEvent;
}): Promise<void> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "audit-mutation-attempt",
    capability: "audit.append-only",
    targetKind: "audit",
    targetId: input.targetAuditId,
  });
  if (input.event.reasonCode !== "audit-mutation-denied") {
    throw new Error("Audit mutation attempts require the denial reason code");
  }
  await input.runner.run(input.event.id, async (tx) => {
    await tx.query("savepoint rejected_audit_mutation");
    try {
      await tx.query(
        input.attemptedOperation === "update"
          ? "update identity_safety_audit set resulting_state='tampered' where id=$1"
          : "delete from identity_safety_audit where id=$1",
        [input.targetAuditId],
      );
      throw new Error("Append-only audit mutation was not rejected");
    } catch (error) {
      await tx.query("rollback to savepoint rejected_audit_mutation");
      if (!(error instanceof Error) || !/append-only/u.test(error.message))
        throw error;
    }
    await tx.query("release savepoint rejected_audit_mutation");
    await writeAudit(tx, input.event, {
      authorization: input.authorization,
      action: "audit-mutation-attempt",
      reasonCode: "audit-mutation-denied",
      priorState: "immutable",
      resultingState: "mutation-denied",
    });
  });
}

export async function loadRestrictedAttributionProjection(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly revealId: string;
  readonly linkageId: string;
  readonly caseReason: string;
  readonly audit: AuditEvent;
}): Promise<
  | { readonly kind: "not-authorized" }
  | {
      readonly kind: "restricted";
      readonly accountId: string;
      readonly caseReason: string;
    }
> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "restricted-reveal-project",
    capability: "restricted.anonymous-author-linkage",
    targetKind: "anonymous-linkage",
    targetId: input.linkageId,
    purpose: input.caseReason,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const result = await tx.query<Record<string, unknown>>(
      `select r.case_reason,r.audit_id,l.account_id
       from restricted_reveals r
       join identity_safety_audit a on a.id=r.audit_id
       join anonymous_linkages l on l.id=r.linkage_id
       where r.id=$1 and r.linkage_id=$2 and r.actor_id=$3 and r.case_reason=$4 and r.allowed=true and r.field_class='anonymous-author-linkage'`,
      [input.revealId, input.linkageId, input.actorId, input.caseReason],
    );
    const row = result.rows[0];
    if (!row) return { kind: "not-authorized" as const };
    const projection = restrictedAttributionFromAuditedRecord({
      accountId: requiredString(
        row.account_id,
        "anonymous_linkages.account_id",
      ),
      caseReason: requiredString(
        row.case_reason,
        "restricted_reveals.case_reason",
      ),
      revealId: input.revealId,
      auditId: requiredString(row.audit_id, "restricted_reveals.audit_id"),
    });
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "restricted-reveal-project",
      reasonCode: input.caseReason,
      priorState: "revealed",
      resultingState: "projected",
    });
    return { kind: "restricted" as const, ...projection };
  });
}

export {
  persistAppeal,
  persistAppealDecision,
  persistClaimAppeal,
  persistClaimAppealDecision,
} from "./identity-safety-appeals";
export { persistProfileClaim } from "./identity-safety-claim-commands";

export {
  finalizePrivateIdentityErasure,
  persistAccountLifecycle,
  persistAuthenticatedAccount,
  persistAuthenticationMethodChange,
  persistRecoveryDecision,
} from "./identity-safety-account-commands";
export { loadAuthorizedAccountData } from "./identity-safety-account-export";
export { persistRecoveryReverification } from "./identity-safety-reverification-commands";
export {
  persistAccountBlock,
  persistBylineClaimLink,
  persistPublicByline,
} from "./identity-safety-public-commands";
export {
  persistAbuseRiskReview,
  persistModerationCaseTransition,
} from "./identity-safety-moderation-commands";

function restrictedSnapshot(
  value: RestrictedTargetSnapshot,
  expectedTargetId: string,
): string {
  if (
    !["account", "profile", "public-object", "unavailable"].includes(
      value.kind,
    ) ||
    !bounded(value.targetId, 200) ||
    value.targetId !== expectedTargetId ||
    !bounded(value.summary, 2_000) ||
    !(value.capturedAt instanceof Date) ||
    Number.isNaN(value.capturedAt.getTime()) ||
    (value.contentReference !== undefined &&
      !bounded(value.contentReference, 500))
  )
    throw new Error("Restricted target snapshot is invalid");
  return JSON.stringify({
    kind: value.kind,
    targetId: value.targetId,
    summary: value.summary,
    capturedAt: value.capturedAt.toISOString(),
    ...(value.contentReference
      ? { contentReference: value.contentReference }
      : {}),
  });
}

function bounded(value: unknown, maximum: number): value is string {
  return (
    typeof value === "string" && value.length > 0 && value.length <= maximum
  );
}
