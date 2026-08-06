import "server-only";

// source-size: reason=appeal persistence keeps canonical case, enforcement, reversal effects, notices, and audit history in one transaction boundary

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  EnforcementAction,
  ProfileClaimState,
} from "../../modules/identity-safety/server";
import {
  addDays,
  requireAuthorization,
  requiredDate,
  requiredString,
  writeAudit,
  writeNotice,
} from "./identity-safety-persistence-support";
import type {
  TransactionContext,
  TransactionRunner,
} from "./transaction-runner";

export async function persistClaimAppeal(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly id: string;
  readonly claimId: string;
  readonly appellantAccountId: string;
  readonly reviewerId: string;
  readonly newContext: string;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible" | "reviewer-conflict"> {
  requireAuthorization(input.authorization, {
    actorId: input.appellantAccountId,
    action: "profile-claim-appeal",
    capability: "profile-claim.appeal",
    targetKind: "claim",
    targetId: input.claimId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const result = await tx.query<Record<string, unknown>>(
      "select account_id,state,appeal_deadline,original_reviewer_id from profile_claims where id=$1 for update",
      [input.claimId],
    );
    const claim = result.rows[0];
    if (
      !claim ||
      claim.account_id !== input.appellantAccountId ||
      claim.state === "pending" ||
      input.now >
        requiredDate(claim.appeal_deadline, "profile_claims.appeal_deadline")
    )
      return "ineligible" as const;
    const originalReviewerId = requiredString(
      claim.original_reviewer_id,
      "profile_claims.original_reviewer_id",
    );
    if (input.reviewerId === originalReviewerId)
      return "reviewer-conflict" as const;
    await tx.query(
      "insert into claim_appeals (id,claim_id,appellant_account_id,reviewer_id,original_reviewer_id,original_state,new_context,created_at) values ($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        input.id,
        input.claimId,
        input.appellantAccountId,
        input.reviewerId,
        originalReviewerId,
        claim.state,
        input.newContext,
        input.now,
      ],
    );
    await tx.query("update profile_claims set appeal_active=true where id=$1", [
      input.claimId,
    ]);
    await writeNotice(tx, {
      id: `${input.id}:notice`,
      accountId: input.appellantAccountId,
      kind: "claim-appeal-received",
      message:
        "Profile Claim appeal received; the current decision remains effective.",
      now: input.now,
    });
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "profile-claim-appeal",
      occurredAt: input.now,
      priorState: requiredString(claim.state, "profile_claims.state"),
      resultingState: "appealed",
      restrictedEvidenceReferences: [`claim-appeal:${input.id}`],
    });
    return "committed" as const;
  });
}

export async function persistClaimAppealDecision(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly id: string;
  readonly appealId: string;
  readonly resultingState: Exclude<ProfileClaimState, "pending">;
  readonly reasonCode: string;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "profile-claim-appeal-decision",
    capability: "profile-claim.appeal-decide",
    targetKind: "claim-appeal",
    targetId: input.appealId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const result = await tx.query<Record<string, unknown>>(
      `select ca.claim_id,ca.appellant_account_id,ca.reviewer_id,ca.state,pc.state claim_state,
              a.state account_state,a.verified_contact
       from claim_appeals ca join profile_claims pc on pc.id=ca.claim_id
       join accounts a on a.id=ca.appellant_account_id
       where ca.id=$1 for update of ca,pc,a`,
      [input.appealId],
    );
    const appeal = result.rows[0];
    if (
      !appeal ||
      appeal.state !== "pending" ||
      appeal.reviewer_id !== input.actorId ||
      (input.resultingState === "verified" &&
        (appeal.account_state !== "active" || appeal.verified_contact !== true))
    )
      return "ineligible" as const;
    const claimId = requiredString(appeal.claim_id, "claim_appeals.claim_id");
    const accountId = requiredString(
      appeal.appellant_account_id,
      "claim_appeals.appellant_account_id",
    );
    await tx.query(
      "insert into claim_appeal_decisions (id,claim_appeal_id,reviewer_id,resulting_state,reason_code,decided_at) values ($1,$2,$3,$4,$5,$6)",
      [
        input.id,
        input.appealId,
        input.actorId,
        input.resultingState,
        input.reasonCode,
        input.now,
      ],
    );
    await tx.query("update claim_appeals set state='resolved' where id=$1", [
      input.appealId,
    ]);
    await tx.query(
      "update profile_claims set state=$2,decided_at=$3,appeal_deadline=$4,evidence_expires_at=$5,appeal_active=false where id=$1",
      [
        claimId,
        input.resultingState,
        input.now,
        addDays(input.now, 30),
        addDays(input.now, 90),
      ],
    );
    if (input.resultingState === "revoked") {
      await tx.query(
        "update public_bylines set claimed_profile=false,profile_id=null where account_id=$1",
        [accountId],
      );
      await tx.query(
        "update account_sessions set revoked_at=$2 where account_id=$1 and revoked_at is null",
        [accountId, input.now],
      );
    }
    await writeNotice(tx, {
      id: `${input.id}:notice`,
      accountId,
      kind: "claim-appeal-decision",
      message: `${input.reasonCode}: Profile Claim ${input.resultingState}.`,
      now: input.now,
    });
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "profile-claim-appeal-decision",
      occurredAt: input.now,
      reasonCode: input.reasonCode,
      priorState: requiredString(appeal.claim_state, "profile_claims.state"),
      resultingState: input.resultingState,
      restrictedEvidenceReferences: [`claim-appeal:${input.appealId}`],
    });
    return "committed" as const;
  });
}

export async function persistAppeal(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly id: string;
  readonly caseId: string;
  readonly appellantAccountId: string;
  readonly reviewerId: string;
  readonly newContext: string;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible" | "reviewer-conflict"> {
  requireAuthorization(input.authorization, {
    actorId: input.appellantAccountId,
    action: "moderation-appeal",
    capability: "trust-safety.appeal",
    targetKind: "case",
    targetId: input.caseId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const result = await tx.query<Record<string, unknown>>(
      `select c.state,c.original_reviewer_id,e.id enforcement_id,e.affected_account_id,e.appeal_deadline
       from moderation_cases c join lateral (
         select id,affected_account_id,appeal_deadline from enforcement_actions
         where case_id=c.id order by effective_at desc,id desc limit 1
       ) e on true where c.id=$1 for update of c,e`,
      [input.caseId],
    );
    const row = result.rows[0];
    if (
      !row ||
      row.state !== "resolved" ||
      row.affected_account_id !== input.appellantAccountId ||
      !row.appeal_deadline ||
      input.now >
        requiredDate(row.appeal_deadline, "enforcement.appeal_deadline")
    )
      return "ineligible" as const;
    const originalReviewerId = requiredString(
      row.original_reviewer_id,
      "moderation_cases.original_reviewer_id",
    );
    if (input.reviewerId === originalReviewerId)
      return "reviewer-conflict" as const;
    await tx.query(
      "insert into appeals (id,case_id,appellant_account_id,reviewer_id,original_reviewer_id,new_context,created_at,original_enforcement_id) values ($1,$2,$3,$4,$5,$6,$7,$8)",
      [
        input.id,
        input.caseId,
        input.appellantAccountId,
        input.reviewerId,
        originalReviewerId,
        input.newContext,
        input.now,
        row.enforcement_id,
      ],
    );
    await tx.query(
      "update moderation_cases set state='appealed',appeal_active=true where id=$1",
      [input.caseId],
    );
    await tx.query("update reports set appeal_active=true where case_id=$1", [
      input.caseId,
    ]);
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "moderation-appeal",
      occurredAt: input.now,
      priorState: "resolved",
      resultingState: "appealed",
      restrictedEvidenceReferences: [`moderation-appeal:${input.id}`],
    });
    return "committed" as const;
  });
}

export async function persistAppealDecision(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly id: string;
  readonly appealId: string;
  readonly newEnforcementId: string;
  readonly action: EnforcementAction;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: "moderation-appeal-decision",
    capability: "trust-safety.appeal-decide",
    targetKind: "appeal",
    targetId: input.appealId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const target = await loadAppealDecisionTarget(tx, input);
    if (!target) return "ineligible" as const;
    await tx.query(
      "insert into enforcement_actions (id,case_id,outcome,policy_reason,effective_at,scope_or_duration,appeal_deadline,affected_account_id,affected_claim_id,prior_account_state,prior_claim_state) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)",
      [
        input.newEnforcementId,
        target.caseId,
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
      "insert into appeal_decisions (id,appeal_id,original_enforcement_id,new_enforcement_id,reviewer_id,decided_at) values ($1,$2,$3,$4,$5,$6)",
      [
        input.id,
        input.appealId,
        target.originalEnforcementId,
        input.newEnforcementId,
        input.actorId,
        input.action.effectiveAt,
      ],
    );
    await tx.query("update appeals set state='resolved' where id=$1", [
      input.appealId,
    ]);
    await tx.query(
      "update moderation_cases set state='resolved',appeal_active=false,resolved_at=$2,evidence_expires_at=$3 where id=$1",
      [
        target.caseId,
        input.action.effectiveAt,
        addDays(input.action.effectiveAt, 730),
      ],
    );
    await tx.query(
      "update reports set expires_at=$2,appeal_active=false where case_id=$1",
      [target.caseId, addDays(input.action.effectiveAt, 730)],
    );
    await applyAppealDecisionEffects(tx, input, target);
    await writeNotice(tx, {
      id: `${input.id}:notice`,
      accountId: target.accountId,
      kind: "appeal-decision",
      message: `Target ${target.targetId}; ${input.action.policyReason}; ${input.action.outcome}; effective ${input.action.effectiveAt.toISOString()}; ${input.action.scopeOrDuration}.`,
      now: input.action.effectiveAt,
    });
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "moderation-appeal-decision",
      occurredAt: input.action.effectiveAt,
      reasonCode: input.action.policyReason,
      priorState: "appealed",
      resultingState: "resolved",
      restrictedEvidenceReferences: [`moderation-appeal:${input.appealId}`],
    });
    return "committed" as const;
  });
}

interface AppealDecisionTarget {
  readonly caseId: string;
  readonly accountId: string;
  readonly claimId: string | null;
  readonly targetId: string;
  readonly originalEnforcementId: string;
  readonly originalOutcome: unknown;
  readonly priorAccountState: unknown;
  readonly priorClaimState: unknown;
}

async function loadAppealDecisionTarget(
  tx: TransactionContext,
  input: Parameters<typeof persistAppealDecision>[0],
): Promise<AppealDecisionTarget | null> {
  const result = await tx.query<Record<string, unknown>>(
    `select a.case_id,a.appellant_account_id,a.reviewer_id,a.original_enforcement_id,a.state,
            e.case_id original_case_id,e.outcome original_outcome,e.affected_account_id,
            e.affected_claim_id,e.prior_account_state,e.prior_claim_state,c.target_id
     from appeals a join enforcement_actions e on e.id=a.original_enforcement_id
     join moderation_cases c on c.id=a.case_id
     where a.id=$1 for update of a,c,e`,
    [input.appealId],
  );
  const row = result.rows[0];
  if (
    !row ||
    row.state !== "pending" ||
    row.reviewer_id !== input.actorId ||
    row.case_id !== row.original_case_id
  )
    return null;
  const accountId = requiredString(
    row.affected_account_id,
    "enforcement_actions.affected_account_id",
  );
  if (row.appellant_account_id !== accountId) return null;
  const account = await tx.query<Record<string, unknown>>(
    "select state from accounts where id=$1 for update",
    [accountId],
  );
  if (!account.rows[0]) return null;
  const claimId =
    typeof row.affected_claim_id === "string" ? row.affected_claim_id : null;
  if (input.action.outcome === "profile-claim-revoked" && !claimId) return null;
  if (claimId) {
    const claim = await tx.query<Record<string, unknown>>(
      "select account_id,state from profile_claims where id=$1 for update",
      [claimId],
    );
    if (claim.rows[0]?.account_id !== accountId) return null;
  }
  return {
    caseId: requiredString(row.case_id, "appeals.case_id"),
    accountId,
    claimId,
    targetId: requiredString(row.target_id, "moderation_cases.target_id"),
    originalEnforcementId: requiredString(
      row.original_enforcement_id,
      "appeals.original_enforcement_id",
    ),
    originalOutcome: row.original_outcome,
    priorAccountState: row.prior_account_state,
    priorClaimState: row.prior_claim_state,
  };
}

async function applyAppealDecisionEffects(
  tx: TransactionContext,
  input: Parameters<typeof persistAppealDecision>[0],
  target: AppealDecisionTarget,
): Promise<void> {
  const accountState = accountStateForAppealOutcome({
    newOutcome: input.action.outcome,
    originalOutcome: target.originalOutcome,
    priorState: target.priorAccountState,
  });
  if (accountState) {
    await tx.query("update accounts set state=$2 where id=$1", [
      target.accountId,
      accountState,
    ]);
    if (accountState === "suspended")
      await tx.query(
        "update account_sessions set revoked_at=$2 where account_id=$1 and revoked_at is null",
        [target.accountId, input.action.effectiveAt],
      );
  }
  if (input.action.outcome === "profile-claim-revoked" && target.claimId) {
    await tx.query(
      "update profile_claims set state='revoked',decided_at=$2,evidence_expires_at=$3 where id=$1",
      [
        target.claimId,
        input.action.effectiveAt,
        addDays(input.action.effectiveAt, 90),
      ],
    );
    await tx.query(
      "update public_bylines set claimed_profile=false,profile_id=null where account_id=$1",
      [target.accountId],
    );
    return;
  }
  if (
    target.originalOutcome === "profile-claim-revoked" &&
    target.claimId &&
    typeof target.priorClaimState === "string"
  )
    await tx.query("update profile_claims set state=$2 where id=$1", [
      target.claimId,
      target.priorClaimState,
    ]);
}

function accountStateForAppealOutcome(input: {
  readonly newOutcome: EnforcementAction["outcome"];
  readonly originalOutcome: unknown;
  readonly priorState: unknown;
}): "active" | "limited" | "suspended" | null {
  if (input.newOutcome === "account-limited") return "limited";
  if (input.newOutcome === "account-suspended") return "suspended";
  if (
    (input.originalOutcome === "account-limited" ||
      input.originalOutcome === "account-suspended") &&
    (input.priorState === "active" ||
      input.priorState === "limited" ||
      input.priorState === "suspended")
  )
    return input.priorState;
  return null;
}
