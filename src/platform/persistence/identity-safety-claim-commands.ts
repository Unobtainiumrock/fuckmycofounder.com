import "server-only";

import type {
  AuditEvent,
  AuthorizedDurableCommand,
  ProfileClaim,
} from "../../modules/identity-safety/server";
import {
  hasRecentReauthentication,
  requireAuthorization,
  writeAudit,
  writeNotice,
} from "./identity-safety-persistence-support";
import type {
  TransactionContext,
  TransactionRunner,
} from "./transaction-runner";

export async function persistProfileClaim(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly actorId: string;
  readonly sessionId?: string;
  readonly claim: ProfileClaim;
  readonly reviewerId: string | null;
  readonly encryptedEvidence: Uint8Array | null;
  readonly now: Date;
  readonly challenge?: {
    readonly id: string;
    readonly challengerAccountId: string;
  };
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  const isSubmission = input.claim.state === "pending";
  requireAuthorization(input.authorization, {
    actorId: input.actorId,
    action: isSubmission ? "profile-claim-submit" : "profile-claim-decide",
    capability: isSubmission ? "profile-claim.submit" : "profile-claim.decide",
    targetKind: "claim",
    targetId: input.claim.id,
  });
  if (!validClaimCommandInput(input, isSubmission)) return "ineligible";
  return input.runner.run(input.audit.id, async (tx) => {
    if (
      (isSubmission || input.claim.state === "verified") &&
      !(await claimantEligible(tx, input.claim.accountId))
    )
      return "ineligible" as const;
    const existing = await tx.query<Record<string, unknown>>(
      "select account_id,profile_id,state,evidence_kind,encrypted_evidence,submission_reauthenticated_at from profile_claims where id=$1 for update",
      [input.claim.id],
    );
    const persisted = isSubmission
      ? await persistClaimSubmission(tx, input, existing.rows[0])
      : await persistClaimDecision(tx, input, existing.rows[0]);
    if (!persisted) return "ineligible" as const;
    await persistClaimSideEffects(tx, input);
    await writeNotice(tx, {
      id: `${input.claim.id}:notice:${input.claim.state}`,
      accountId: input.claim.accountId,
      kind: `claim-${input.claim.state}`,
      message: `Profile Claim ${input.claim.state}.`,
      now: input.now,
    });
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: isSubmission ? "profile-claim-submit" : "profile-claim-decide",
      occurredAt: input.now,
      priorState:
        typeof existing.rows[0]?.state === "string"
          ? existing.rows[0].state
          : null,
      resultingState: input.claim.state,
    });
    return "committed" as const;
  });
}

async function claimantEligible(
  tx: TransactionContext,
  accountId: string,
): Promise<boolean> {
  const account = await tx.query<Record<string, unknown>>(
    "select state,verified_contact from accounts where id=$1 for update",
    [accountId],
  );
  return (
    account.rows[0]?.state === "active" &&
    account.rows[0]?.verified_contact === true
  );
}

function validClaimCommandInput(
  input: Parameters<typeof persistProfileClaim>[0],
  isSubmission: boolean,
): boolean {
  if (input.claim.evidenceKind === "surface-attribute") return false;
  if (isSubmission)
    return (
      input.actorId === input.claim.accountId &&
      input.reviewerId === null &&
      Boolean(input.sessionId && input.encryptedEvidence)
    );
  return Boolean(input.reviewerId && input.reviewerId === input.actorId);
}

async function persistClaimSubmission(
  tx: TransactionContext,
  input: Parameters<typeof persistProfileClaim>[0],
  existing: Record<string, unknown> | undefined,
): Promise<boolean> {
  if (
    existing ||
    !input.sessionId ||
    !(await hasRecentReauthentication(tx, {
      accountId: input.claim.accountId,
      sessionId: input.sessionId,
      now: input.now,
    }))
  )
    return false;
  await tx.query(
    `insert into profile_claims
     (id,account_id,profile_id,state,evidence_kind,encrypted_evidence,submission_reauthenticated_at)
     values ($1,$2,$3,'pending',$4,$5,$6)`,
    [
      input.claim.id,
      input.claim.accountId,
      input.claim.profileId,
      input.claim.evidenceKind,
      input.encryptedEvidence,
      input.now,
    ],
  );
  return true;
}

async function persistClaimDecision(
  tx: TransactionContext,
  input: Parameters<typeof persistProfileClaim>[0],
  existing: Record<string, unknown> | undefined,
): Promise<boolean> {
  if (
    input.claim.state === "pending" ||
    !existing ||
    existing.account_id !== input.claim.accountId ||
    existing.profile_id !== input.claim.profileId ||
    existing.evidence_kind === "surface-attribute" ||
    !existing.encrypted_evidence ||
    !(existing.submission_reauthenticated_at instanceof Date) ||
    !claimTransitionAllowed(existing.state, input.claim.state)
  )
    return false;
  await tx.query(
    `update profile_claims set state=$2,decided_at=$3,evidence_expires_at=$4,
     original_reviewer_id=$5,appeal_deadline=$6 where id=$1`,
    [
      input.claim.id,
      input.claim.state,
      input.claim.decidedAt,
      input.claim.evidenceExpiresAt,
      input.reviewerId,
      input.claim.appealDeadline,
    ],
  );
  return true;
}

async function persistClaimSideEffects(
  tx: TransactionContext,
  input: Parameters<typeof persistProfileClaim>[0],
): Promise<void> {
  if (input.challenge) {
    await tx.query(
      "insert into claim_challenges (id,claim_id,challenger_account_id,state,created_at) values ($1,$2,$3,'open',$4)",
      [
        input.challenge.id,
        input.claim.id,
        input.challenge.challengerAccountId,
        input.now,
      ],
    );
  }
  if (input.claim.state !== "revoked") return;
  await tx.query(
    "update public_bylines set claimed_profile=false, profile_id=null where account_id=$1",
    [input.claim.accountId],
  );
  await tx.query(
    "update account_sessions set revoked_at=$2 where account_id=$1 and revoked_at is null",
    [input.claim.accountId, input.now],
  );
}

function claimTransitionAllowed(
  from: unknown,
  to: ProfileClaim["state"],
): boolean {
  return (
    typeof from === "string" &&
    (
      {
        pending: ["verified", "rejected"],
        verified: ["verified", "revoked"],
        rejected: ["rejected"],
        revoked: ["revoked"],
      } as const
    )[from as ProfileClaim["state"]]?.includes(to as never) === true
  );
}
