import "server-only";

// source-size: reason=identity safety commands keep authorization, one-transaction ownership, state effects, notices, and audit writes colocated

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  EnforcementAction,
  ProfileClaim,
  RestrictedModerationCaseRecord,
  RestrictedReportRecord,
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
import type { TransactionRunner } from "./transaction-runner";

export async function persistProfileClaim(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly claim: ProfileClaim;
  readonly reviewerId: string | null;
  readonly encryptedEvidence: Uint8Array | null;
  readonly challenge?: {
    readonly id: string;
    readonly challengerAccountId: string;
  };
  readonly audit: AuditEvent;
}): Promise<void> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "profile-claim-write",
    capability: "profile-claim.write",
    targetKind: "claim",
    targetId: input.claim.id,
  });
  if (input.claim.state !== "pending" && !input.reviewerId) {
    throw new Error("Final Profile Claim decisions require a reviewer");
  }
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      `insert into profile_claims (id,account_id,profile_id,state,evidence_kind,encrypted_evidence,decided_at,evidence_expires_at,original_reviewer_id,appeal_deadline)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (id) do update set state=excluded.state, decided_at=excluded.decided_at, evidence_expires_at=excluded.evidence_expires_at, original_reviewer_id=excluded.original_reviewer_id, appeal_deadline=excluded.appeal_deadline`,
      [
        input.claim.id,
        input.claim.accountId,
        input.claim.profileId,
        input.claim.state,
        input.claim.evidenceKind,
        input.encryptedEvidence,
        input.claim.state === "pending" ? null : input.claim.decidedAt,
        input.claim.state === "pending" ? null : input.claim.evidenceExpiresAt,
        input.reviewerId,
        input.claim.state === "pending" ? null : input.claim.appealDeadline,
      ],
    );
    if (input.challenge) {
      await tx.query(
        "insert into claim_challenges (id,claim_id,challenger_account_id,state,created_at) values ($1,$2,$3,'open',$4)",
        [
          input.challenge.id,
          input.claim.id,
          input.challenge.challengerAccountId,
          input.audit.occurredAt,
        ],
      );
    }
    if (input.claim.state === "revoked") {
      await tx.query(
        "update public_bylines set claimed_profile=false, profile_id=null where account_id=$1",
        [input.claim.accountId],
      );
      await tx.query(
        "update account_sessions set revoked_at=$2 where account_id=$1 and revoked_at is null",
        [input.claim.accountId, input.audit.occurredAt],
      );
    }
    await writeNotice(tx, {
      id: `${input.claim.id}:notice:${input.claim.state}`,
      accountId: input.claim.accountId,
      kind: `claim-${input.claim.state}`,
      message: `Profile Claim ${input.claim.state}.`,
      now: input.audit.occurredAt,
    });
    await writeAudit(tx, input.audit);
  });
}

export async function persistReportAndCase(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly report: RestrictedReportRecord;
  readonly moderationCase: RestrictedModerationCaseRecord;
  readonly targetSnapshot: Readonly<Record<string, unknown>>;
  readonly audit: AuditEvent;
}): Promise<void> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "report-create",
    capability: "trust-safety.report",
    targetKind: "report",
    targetId: input.report.id,
  });
  const targetSnapshot = restrictedSnapshot(input.targetSnapshot);
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      `insert into moderation_cases (id,target_id,state,queue,target_snapshot,created_at,evidence_expires_at) values ($1,$2,$3,$4,$5::jsonb,$6,$7)
       on conflict (id) do update set state=excluded.state, queue=excluded.queue`,
      [
        input.moderationCase.id,
        input.moderationCase.targetId,
        input.moderationCase.state,
        input.moderationCase.queue,
        targetSnapshot,
        input.report.createdAt,
        null,
      ],
    );
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
    await writeAudit(tx, input.audit);
  });
}

export async function persistEnforcement(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly reviewerId: string;
  readonly id: string;
  readonly caseId: string;
  readonly targetId: string;
  readonly affectedAccountId: string;
  readonly affectedClaimId?: string;
  readonly action: EnforcementAction;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "moderation-enforce",
    capability: "trust-safety.enforce",
    targetKind: "case",
    targetId: input.caseId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const moderationCase = await tx.query<Record<string, unknown>>(
      "select state,target_id from moderation_cases where id=$1 for update",
      [input.caseId],
    );
    if (
      moderationCase.rows[0]?.state !== "investigating" ||
      moderationCase.rows[0]?.target_id !== input.targetId
    )
      return "ineligible" as const;
    await tx.query(
      "insert into enforcement_actions (id,case_id,outcome,policy_reason,effective_at,scope_or_duration,appeal_deadline,affected_account_id) values ($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        input.id,
        input.caseId,
        input.action.outcome,
        input.action.policyReason,
        input.action.effectiveAt,
        input.action.scopeOrDuration,
        input.action.appealable ? addDays(input.action.effectiveAt, 30) : null,
        input.affectedAccountId,
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
    if (
      input.action.outcome === "account-limited" ||
      input.action.outcome === "account-suspended"
    ) {
      await tx.query("update accounts set state=$2 where id=$1", [
        input.affectedAccountId,
        input.action.outcome === "account-limited" ? "limited" : "suspended",
      ]);
      if (input.action.outcome === "account-suspended")
        await tx.query(
          "update account_sessions set revoked_at=$2 where account_id=$1 and revoked_at is null",
          [input.affectedAccountId, input.action.effectiveAt],
        );
    }
    if (
      input.action.outcome === "profile-claim-revoked" &&
      input.affectedClaimId
    ) {
      await tx.query(
        "update profile_claims set state='revoked', decided_at=$2, evidence_expires_at=$3 where id=$1",
        [
          input.affectedClaimId,
          input.action.effectiveAt,
          addDays(input.action.effectiveAt, 90),
        ],
      );
      await tx.query(
        "update public_bylines set claimed_profile=false, profile_id=null where account_id=$1",
        [input.affectedAccountId],
      );
      await tx.query(
        "update account_sessions set revoked_at=$2 where account_id=$1 and revoked_at is null",
        [input.affectedAccountId, input.action.effectiveAt],
      );
    }
    await writeNotice(tx, {
      id: `${input.id}:notice`,
      accountId: input.affectedAccountId,
      kind: "enforcement",
      message: `Target ${input.caseId}; ${input.action.policyReason}; ${input.action.outcome}; effective ${input.action.effectiveAt.toISOString()}; ${input.action.scopeOrDuration}; appeal ${input.action.appealable ? "available for 30 days" : "not available"}.`,
      now: input.action.effectiveAt,
    });
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}

export async function recordRestrictedReveal(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly id: string;
  readonly actorId: string;
  readonly approverId: string;
  readonly caseReason: string;
  readonly field: RestrictedField;
  readonly audit: AuditEvent;
}): Promise<{ readonly revealId: string; readonly auditId: string }> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "restricted-reveal",
    capability: `restricted.${input.field}`,
    targetKind: "case",
    targetId: input.caseReason,
  });
  if (!input.actorId || !input.approverId || !input.caseReason)
    throw new Error("Restricted reveal requires actor, approver, and reason");
  await input.runner.run(input.audit.id, async (tx) => {
    await writeAudit(tx, input.audit);
    await tx.query(
      "insert into restricted_reveals (id,actor_id,approver_id,case_reason,field_class,allowed,audit_id,created_at) values ($1,$2,$3,$4,$5,true,$6,$7)",
      [
        input.id,
        input.actorId,
        input.approverId,
        input.caseReason,
        input.field,
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
    await writeAudit(tx, input.event);
  });
}

export async function loadRestrictedAttributionProjection(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly revealId: string;
  readonly linkageId: string;
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
    targetKind: "reveal",
    targetId: input.revealId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const result = await tx.query<Record<string, unknown>>(
      `select r.case_reason,r.audit_id,l.account_id
       from restricted_reveals r
       join identity_safety_audit a on a.id=r.audit_id
       join anonymous_linkages l on l.id=$2
       where r.id=$1 and r.actor_id=$3 and r.allowed=true and r.field_class='anonymous-author-linkage'`,
      [input.revealId, input.linkageId, input.actorId],
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
    await writeAudit(tx, input.audit);
    return { kind: "restricted" as const, ...projection };
  });
}

export {
  persistAppeal,
  persistAppealDecision,
  persistClaimAppeal,
  persistClaimAppealDecision,
} from "./identity-safety-appeals";

export {
  finalizePrivateIdentityErasure,
  loadAuthorizedAccountData,
  persistAccountLifecycle,
  persistAuthenticatedAccount,
  persistAuthenticationMethodChange,
  persistRecoveryDecision,
} from "./identity-safety-account-commands";
export {
  persistAccountBlock,
  persistBylineClaimLink,
  persistPublicByline,
} from "./identity-safety-public-commands";
export { persistModerationCaseTransition } from "./identity-safety-moderation-commands";

function restrictedSnapshot(value: Readonly<Record<string, unknown>>): string {
  const serialized = JSON.stringify(value);
  if (!serialized || serialized.length > 100_000)
    throw new Error("Restricted target snapshot is invalid");
  return serialized;
}
