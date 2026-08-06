import "server-only";

import {
  createOrEditByline,
  type AuditEvent,
  type AuthorizedDurableCommand,
} from "../../modules/identity-safety/server";
import {
  addDays,
  requireAuthorization,
  requiredString,
  writeAudit,
} from "./identity-safety-persistence-support";
import type { TransactionRunner } from "./transaction-runner";

export async function persistPublicByline(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly accountId: string;
  readonly displayName: string;
  readonly photoUrl?: string;
  readonly now: Date;
  readonly impersonationSignal: boolean;
  readonly editId: string;
  readonly audit: AuditEvent;
}): Promise<
  | "committed"
  | "display-name-required"
  | "impersonation-review"
  | "rate-limited"
  | "reserved-label"
  | "unavailable"
> {
  requireAuthorization(input.authorization, {
    actorId: input.accountId,
    action: "byline-write",
    capability: "public-byline.write",
    targetKind: "account",
    targetId: input.accountId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const account = await tx.query<Record<string, unknown>>(
      "select state from accounts where id=$1 for update",
      [input.accountId],
    );
    if (account.rows[0]?.state !== "active") return "unavailable" as const;
    const edits = await tx.query<Record<string, unknown>>(
      "select count(*)::int as count from byline_edits where account_id=$1 and created_at > $2",
      [input.accountId, addDays(input.now, -1)],
    );
    const editCount = edits.rows[0]?.count;
    if (typeof editCount !== "number")
      throw new Error("Invalid PostgreSQL byline edit count");
    const decision = createOrEditByline({
      account: { id: input.accountId, state: "active", verifiedContact: true },
      displayName: input.displayName,
      ...(input.photoUrl ? { photoUrl: input.photoUrl } : {}),
      now: input.now,
      editsInLastDay: editCount,
      impersonationSignal: input.impersonationSignal,
    });
    if (decision.kind === "rejected") return decision.code;
    const prior = await tx.query<Record<string, unknown>>(
      "select display_name from public_bylines where account_id=$1",
      [input.accountId],
    );
    await tx.query(
      `insert into public_bylines (account_id,display_name,photo_url,profile_id,claimed_profile,updated_at)
       values ($1,$2,$3,null,false,$4)
       on conflict (account_id) do update set display_name=excluded.display_name,photo_url=excluded.photo_url,updated_at=excluded.updated_at`,
      [
        input.accountId,
        decision.byline.displayName,
        decision.byline.photoUrl ?? null,
        input.now,
      ],
    );
    await tx.query(
      "insert into byline_edits (id,account_id,prior_display_name,created_at) values ($1,$2,$3,$4)",
      [
        input.editId,
        input.accountId,
        prior.rows[0]?.display_name ?? null,
        input.now,
      ],
    );
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "byline-write",
      priorState: prior.rows[0] ? "present" : null,
      resultingState: "present",
    });
    return "committed" as const;
  });
}

export async function persistBylineClaimLink(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly accountId: string;
  readonly claimId: string;
  readonly enabled: boolean;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  requireAuthorization(input.authorization, {
    actorId: input.accountId,
    action: "byline-claim-link",
    capability: "public-byline.claim",
    targetKind: "claim",
    targetId: input.claimId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const claim = await tx.query<Record<string, unknown>>(
      "select account_id,profile_id,state,reverify_required from profile_claims where id=$1 for update",
      [input.claimId],
    );
    const row = claim.rows[0];
    if (
      !row ||
      row.account_id !== input.accountId ||
      row.state !== "verified" ||
      row.reverify_required !== false
    )
      return "ineligible" as const;
    await tx.query(
      "update public_bylines set profile_id=$2,claimed_profile=$3 where account_id=$1",
      [
        input.accountId,
        input.enabled
          ? requiredString(row.profile_id, "profile_claims.profile_id")
          : null,
        input.enabled,
      ],
    );
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "byline-claim-link",
      priorState: "verified",
      resultingState: input.enabled ? "linked" : "unlinked",
    });
    return "committed" as const;
  });
}

export async function persistAccountBlock(input: {
  readonly runner: TransactionRunner;
  readonly authorization: AuthorizedDurableCommand;
  readonly blockerId: string;
  readonly blockedId: string;
  readonly now: Date;
  readonly audit: AuditEvent;
}): Promise<"committed" | "ineligible"> {
  requireAuthorization(input.authorization, {
    actorId: input.blockerId,
    action: "account-block",
    capability: "trust-safety.block",
    targetKind: "account",
    targetId: input.blockedId,
  });
  return input.runner.run(input.audit.id, async (tx) => {
    const accounts = await tx.query<Record<string, unknown>>(
      "select id,state from accounts where id=any($1::text[]) order by id for update",
      [[input.blockerId, input.blockedId]],
    );
    if (
      accounts.rows.length !== 2 ||
      accounts.rows.some((row) => row.state !== "active")
    )
      return "ineligible" as const;
    const existing = await tx.query(
      "select 1 from account_blocks where blocker_id=$1 and blocked_id=$2",
      [input.blockerId, input.blockedId],
    );
    await tx.query(
      "insert into account_blocks (blocker_id,blocked_id,created_at) values ($1,$2,$3) on conflict do nothing",
      [input.blockerId, input.blockedId, input.now],
    );
    await writeAudit(tx, input.audit, {
      authorization: input.authorization,
      action: "account-block",
      priorState: existing.rowCount === 1 ? "blocked" : "unblocked",
      resultingState: "blocked",
    });
    return "committed" as const;
  });
}
