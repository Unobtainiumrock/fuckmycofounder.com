import "server-only";

// source-size: reason=identity safety commands keep authorization, one-transaction ownership, state effects, notices, and audit writes colocated

import type {
  Account,
  AuditEvent,
  AuthorizedDurableCommand,
  EnforcementAction,
  ProfileClaim,
  RestrictedModerationCaseRecord,
  RestrictedReportRecord,
  RestrictedField,
} from "../../modules/identity-safety";
import type {
  TransactionContext,
  TransactionRunner,
} from "./transaction-runner";

export async function persistAuthenticatedAccount(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly account: Account;
  readonly method: {
    readonly id: string;
    readonly provider: string;
    readonly subject: string;
    readonly verifiedAt: Date;
  };
  readonly sessionId: string;
  readonly audit: AuditEvent;
}): Promise<void> {
  assertAuthorized(input.authorization);
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      "insert into accounts (id, state, verified_contact) values ($1, $2, $3) on conflict (id) do nothing",
      [input.account.id, input.account.state, input.account.verifiedContact],
    );
    await tx.query(
      "insert into authentication_methods (id, account_id, provider, provider_subject, verified_at) values ($1,$2,$3,$4,$5)",
      [
        input.method.id,
        input.account.id,
        input.method.provider,
        input.method.subject,
        input.method.verifiedAt,
      ],
    );
    await tx.query(
      "insert into account_sessions (id, account_id) values ($1,$2)",
      [input.sessionId, input.account.id],
    );
    await writeAudit(tx, input.audit);
  });
}

export async function persistAccountLifecycle(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly account: Account;
  readonly recentReauthentication: boolean;
  readonly audit: AuditEvent;
}): Promise<"committed" | "reauthentication-required"> {
  assertAuthorized(input.authorization);
  if (!input.recentReauthentication) return "reauthentication-required";
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      `update accounts set state=$2, deletion_requested_at=$3,
       identity_erasure_due_at=$4, backup_erasure_due_at=$5, pre_deletion_state=$6 where id=$1`,
      [
        input.account.id,
        input.account.state,
        input.account.state === "deletion-pending"
          ? input.account.deletionRequestedAt
          : null,
        input.account.state === "deleted"
          ? input.account.identityErasureDueAt
          : null,
        input.account.state === "deleted"
          ? input.account.backupErasureDueAt
          : null,
        input.account.state === "deletion-pending"
          ? input.account.preDeletionState
          : null,
      ],
    );
    if (
      input.account.state === "suspended" ||
      input.account.state === "deletion-pending" ||
      input.account.state === "deleted"
    ) {
      await tx.query(
        "update account_sessions set revoked_at=now() where account_id=$1 and revoked_at is null",
        [input.account.id],
      );
    }
    await writeAudit(tx, input.audit);
  });
  return "committed";
}

export async function persistRecoveryDecision(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly recoveryId: string;
  readonly accountId: string | null;
  readonly state: "pending" | "approved" | "denied";
  readonly holdUntil: Date;
  readonly audit: AuditEvent;
}): Promise<void> {
  assertAuthorized(input.authorization);
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      "insert into recovery_reviews (id, account_id, state, hold_until, created_at) values ($1,$2,$3,$4,$5)",
      [
        input.recoveryId,
        input.accountId,
        input.state,
        input.holdUntil,
        input.audit.occurredAt,
      ],
    );
    if (input.state === "approved" && input.accountId) {
      await tx.query(
        "update account_sessions set revoked_at=now() where account_id=$1 and revoked_at is null",
        [input.accountId],
      );
      await writeNotice(tx, {
        id: `${input.recoveryId}:notice`,
        accountId: input.accountId,
        kind: "recovery-approved",
        message: "Account recovery completed. Sign in again.",
        now: input.audit.occurredAt,
      });
    }
    await writeAudit(tx, input.audit);
  });
}

export async function persistAuthenticationMethodChange(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly accountId: string;
  readonly recentReauthentication: boolean;
  readonly operation: "add" | "remove" | "correct";
  readonly method: {
    readonly id: string;
    readonly provider: string;
    readonly subject: string;
    readonly verifiedAt: Date;
  };
  readonly replacedMethodId?: string;
  readonly audit: AuditEvent;
}): Promise<"committed" | "reauthentication-required" | "last-method"> {
  assertAuthorized(input.authorization);
  if (!input.recentReauthentication) return "reauthentication-required";
  return input.runner.run(input.audit.id, async (tx) => {
    if (input.operation === "remove") {
      const count = await tx.query<{ count: number }>(
        "select count(*)::int as count from authentication_methods where account_id=$1",
        [input.accountId],
      );
      if ((count.rows[0]?.count ?? 0) <= 1) return "last-method" as const;
      await tx.query(
        "delete from authentication_methods where id=$1 and account_id=$2",
        [input.method.id, input.accountId],
      );
    } else {
      if (input.operation === "correct" && input.replacedMethodId) {
        await tx.query(
          "delete from authentication_methods where id=$1 and account_id=$2",
          [input.replacedMethodId, input.accountId],
        );
      }
      await tx.query(
        "insert into authentication_methods (id,account_id,provider,provider_subject,verified_at) values ($1,$2,$3,$4,$5)",
        [
          input.method.id,
          input.accountId,
          input.method.provider,
          input.method.subject,
          input.method.verifiedAt,
        ],
      );
    }
    await writeNotice(tx, {
      id: `${input.audit.id}:notice`,
      accountId: input.accountId,
      kind: "authentication-method-changed",
      message: "A sign-in method changed on your Account.",
      now: input.audit.occurredAt,
    });
    await writeAudit(tx, input.audit);
    return "committed" as const;
  });
}

export async function loadAuthorizedAccountData(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly accountId: string;
  readonly requesterAccountId: string;
  readonly recentReauthentication: boolean;
  readonly audit: AuditEvent;
}): Promise<
  | { readonly kind: "not-authorized" }
  | {
      readonly kind: "account-self-restricted";
      readonly account: {
        readonly id: string;
        readonly state: string;
        readonly verifiedContact: boolean;
      };
      readonly methods: readonly {
        readonly provider: string;
        readonly verifiedAt: Date;
      }[];
    }
> {
  assertAuthorized(input.authorization);
  if (
    input.accountId !== input.requesterAccountId ||
    !input.recentReauthentication
  ) {
    return { kind: "not-authorized" };
  }
  return input.runner.run(input.audit.id, async (tx) => {
    const account = await tx.query<{
      id: string;
      state: string;
      verified_contact: boolean;
    }>("select id,state,verified_contact from accounts where id=$1", [
      input.accountId,
    ]);
    const methods = await tx.query<{ provider: string; verified_at: Date }>(
      "select provider,verified_at from authentication_methods where account_id=$1 order by provider",
      [input.accountId],
    );
    const row = account.rows[0];
    if (!row) return { kind: "not-authorized" as const };
    const projection = {
      kind: "account-self-restricted" as const,
      account: {
        id: row.id,
        state: row.state,
        verifiedContact: row.verified_contact,
      },
      methods: methods.rows.map(({ provider, verified_at }) => ({
        provider,
        verifiedAt: verified_at,
      })),
    };
    await writeAudit(tx, input.audit);
    return projection;
  });
}

export async function finalizePrivateIdentityErasure(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly account: Extract<Account, { readonly state: "deleted" }>;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "not-due"> {
  assertAuthorized(input.authorization);
  if (input.now < input.account.identityErasureDueAt) return "not-due";
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query("delete from authentication_methods where account_id=$1", [
      input.account.id,
    ]);
    await tx.query("delete from account_sessions where account_id=$1", [
      input.account.id,
    ]);
    await tx.query(
      "update recovery_reviews set account_id=null where account_id=$1",
      [input.account.id],
    );
    await tx.query(
      "update accounts set verified_contact=false where id=$1 and state='deleted'",
      [input.account.id],
    );
    await writeAudit(tx, input.audit);
  });
  return "committed";
}

export async function persistProfileClaim(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly claim: ProfileClaim;
  readonly reviewerId: string | null;
  readonly encryptedEvidence: Uint8Array | null;
  readonly challenge?: {
    readonly id: string;
    readonly challengerAccountId: string;
  };
  readonly audit: AuditEvent;
}): Promise<void> {
  assertAuthorized(input.authorization);
  if (input.claim.state !== "pending" && !input.reviewerId) {
    throw new Error("Final Profile Claim decisions require a reviewer");
  }
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      `insert into profile_claims (id,account_id,profile_id,state,evidence_kind,encrypted_evidence,decided_at,evidence_expires_at,original_reviewer_id)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do update set state=excluded.state, decided_at=excluded.decided_at, evidence_expires_at=excluded.evidence_expires_at, original_reviewer_id=excluded.original_reviewer_id`,
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
        "update account_sessions set revoked_at=now() where account_id=$1 and revoked_at is null",
        [input.claim.accountId],
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
  readonly report: RestrictedReportRecord;
  readonly moderationCase: RestrictedModerationCaseRecord;
  readonly targetSnapshot: unknown;
  readonly audit: AuditEvent;
}): Promise<void> {
  assertAuthorized(input.authorization);
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      `insert into moderation_cases (id,target_id,state,queue,target_snapshot,created_at,evidence_expires_at) values ($1,$2,$3,$4,$5::jsonb,$6,$7)
       on conflict (id) do update set state=excluded.state, queue=excluded.queue`,
      [
        input.moderationCase.id,
        input.moderationCase.targetId,
        input.moderationCase.state,
        input.moderationCase.queue,
        JSON.stringify(input.targetSnapshot),
        input.report.createdAt,
        new Date(input.report.createdAt.getTime() + 24 * 30 * 86400000),
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
        new Date(input.report.createdAt.getTime() + 24 * 30 * 86400000),
      ],
    );
    await writeAudit(tx, input.audit);
  });
}

export async function persistEnforcement(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly id: string;
  readonly caseId: string;
  readonly affectedAccountId: string;
  readonly affectedClaimId?: string;
  readonly action: EnforcementAction;
  readonly audit: AuditEvent;
}): Promise<void> {
  assertAuthorized(input.authorization);
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      "insert into enforcement_actions (id,case_id,outcome,policy_reason,effective_at,scope_or_duration,appeal_deadline) values ($1,$2,$3,$4,$5,$6,$7)",
      [
        input.id,
        input.caseId,
        input.action.outcome,
        input.action.policyReason,
        input.action.effectiveAt,
        input.action.scopeOrDuration,
        input.action.appealable
          ? new Date(input.action.effectiveAt.getTime() + 30 * 86400000)
          : null,
      ],
    );
    await tx.query("update moderation_cases set state='resolved' where id=$1", [
      input.caseId,
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
          "update account_sessions set revoked_at=now() where account_id=$1 and revoked_at is null",
          [input.affectedAccountId],
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
          new Date(input.action.effectiveAt.getTime() + 90 * 86400000),
        ],
      );
      await tx.query(
        "update public_bylines set claimed_profile=false, profile_id=null where account_id=$1",
        [input.affectedAccountId],
      );
      await tx.query(
        "update account_sessions set revoked_at=now() where account_id=$1 and revoked_at is null",
        [input.affectedAccountId],
      );
    }
    await writeNotice(tx, {
      id: `${input.id}:notice`,
      accountId: input.affectedAccountId,
      kind: "enforcement",
      message: `${input.action.policyReason}: ${input.action.outcome}; ${input.action.scopeOrDuration}`,
      now: input.action.effectiveAt,
    });
    await writeAudit(tx, input.audit);
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
  readonly allowed: boolean;
  readonly audit: AuditEvent;
}): Promise<void> {
  assertAuthorized(input.authorization);
  if (!input.actorId || !input.approverId || !input.caseReason)
    throw new Error("Restricted reveal requires actor, approver, and reason");
  await input.runner.run(input.audit.id, async (tx) => {
    await tx.query(
      "insert into restricted_reveals (id,actor_id,approver_id,case_reason,field_class,allowed,created_at) values ($1,$2,$3,$4,$5,$6,$7)",
      [
        input.id,
        input.actorId,
        input.approverId,
        input.caseReason,
        input.field,
        input.allowed,
        input.audit.occurredAt,
      ],
    );
    await writeAudit(tx, input.audit);
  });
}

export async function recordAuditMutationAttempt(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly event: AuditEvent;
}): Promise<void> {
  assertAuthorized(input.authorization);
  if (input.event.reasonCode !== "audit-mutation-denied") {
    throw new Error("Audit mutation attempts require the denial reason code");
  }
  await input.runner.run(input.event.id, (tx) => writeAudit(tx, input.event));
}

function assertAuthorized(
  decision: AuthorizedDurableCommand,
): asserts decision is AuthorizedDurableCommand {
  if (
    decision.kind !== "authorized-durable-command" ||
    !decision.decisionId ||
    !decision.actorId ||
    !decision.capability ||
    !decision.policyVersion
  ) {
    throw new Error("Durable command requires a prior authorization decision");
  }
}

export {
  persistAppeal,
  persistAppealDecision,
  persistClaimAppeal,
} from "./identity-safety-appeals";

async function writeNotice(
  tx: TransactionContext,
  notice: {
    readonly id: string;
    readonly accountId: string;
    readonly kind: string;
    readonly message: string;
    readonly now: Date;
  },
): Promise<void> {
  await tx.query(
    "insert into identity_safety_notices (id,account_id,kind,safe_message,created_at) values ($1,$2,$3,$4,$5)",
    [notice.id, notice.accountId, notice.kind, notice.message, notice.now],
  );
}

async function writeAudit(
  tx: TransactionContext,
  event: AuditEvent,
): Promise<void> {
  await tx.query(
    `insert into identity_safety_audit (id,category,actor_role,occurred_at,reason_code,policy_version,prior_state,resulting_state,restricted_evidence_references) values ($1,$2,$3,$4,$5,$6,$7,$8,'[]'::jsonb)`,
    [
      event.id,
      event.category,
      event.actorRole,
      event.occurredAt,
      event.reasonCode,
      event.policyVersion,
      event.priorState,
      event.resultingState,
    ],
  );
  if (event.restrictedEvidenceReferences.length > 0) {
    await tx.query(
      "insert into audit_evidence_payloads (audit_id,restricted_references,expires_at) values ($1,$2::jsonb,$3)",
      [
        event.id,
        JSON.stringify(event.restrictedEvidenceReferences),
        new Date(event.occurredAt.getTime() + 24 * 30 * 86400000),
      ],
    );
  }
}
