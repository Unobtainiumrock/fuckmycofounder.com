export const up = (pgm) => {
  pgm.sql(`
    create table accounts (
      id text primary key,
      state text not null check (state in ('active', 'limited', 'suspended', 'deletion-pending', 'deleted')),
      verified_contact boolean not null default false,
      deletion_requested_at timestamptz,
      identity_erasure_due_at timestamptz,
      backup_erasure_due_at timestamptz,
      created_at timestamptz not null default now()
    );

    create table authentication_methods (
      id text primary key,
      account_id text not null references accounts(id),
      provider text not null check (provider in ('google', 'apple', 'email-link')),
      provider_subject text not null,
      verified_at timestamptz not null,
      unique (provider, provider_subject)
    );

    create table public_bylines (
      account_id text primary key references accounts(id),
      display_name text not null check (length(trim(display_name)) > 0),
      photo_url text,
      profile_id text,
      claimed_profile boolean not null default false,
      updated_at timestamptz not null
    );

    create table profile_claims (
      id text primary key,
      account_id text not null references accounts(id),
      profile_id text not null,
      state text not null check (state in ('pending', 'verified', 'rejected', 'revoked')),
      evidence_kind text not null check (evidence_kind in ('authoritative-control', 'human-review', 'surface-attribute')),
      encrypted_evidence bytea,
      decided_at timestamptz,
      evidence_expires_at timestamptz
    );
    create unique index one_verified_claim_per_account on profile_claims(account_id) where state = 'verified';
    create unique index one_verified_claim_per_profile on profile_claims(profile_id) where state = 'verified';

    create table account_blocks (
      blocker_id text not null references accounts(id),
      blocked_id text not null references accounts(id),
      created_at timestamptz not null,
      primary key (blocker_id, blocked_id),
      check (blocker_id <> blocked_id)
    );

    create table moderation_cases (
      id text primary key,
      target_id text not null,
      state text not null check (state in ('received', 'triaged', 'investigating', 'resolved', 'appealed', 'closed')),
      queue text not null check (queue in ('ordinary', 'urgent')),
      target_snapshot jsonb not null,
      original_reviewer_id text,
      created_at timestamptz not null
    );

    create table reports (
      id text primary key,
      case_id text not null references moderation_cases(id),
      reporter_account_id text not null references accounts(id),
      target_id text not null,
      reason text not null,
      private_context text,
      evidence_references jsonb not null,
      created_at timestamptz not null,
      unique (case_id, reporter_account_id, target_id, reason)
    );

    create table enforcement_actions (
      id text primary key,
      case_id text not null references moderation_cases(id),
      outcome text not null check (outcome in ('none', 'changes-required', 'visibility-limited', 'removed', 'account-limited', 'account-suspended', 'profile-claim-revoked')),
      policy_reason text not null,
      effective_at timestamptz not null,
      scope_or_duration text not null,
      appeal_deadline timestamptz
    );

    create table appeals (
      id text primary key,
      case_id text not null references moderation_cases(id),
      appellant_account_id text not null references accounts(id),
      reviewer_id text not null,
      original_reviewer_id text not null,
      new_context text not null,
      created_at timestamptz not null,
      check (reviewer_id <> original_reviewer_id)
    );

    create table protected_actions (
      id text primary key,
      actor_account_id text not null references accounts(id),
      action text not null,
      target_id text,
      created_at timestamptz not null default now()
    );

    create table identity_safety_audit (
      id text primary key,
      category text not null,
      actor_role text not null,
      occurred_at timestamptz not null,
      reason_code text not null,
      policy_version text not null,
      prior_state text,
      resulting_state text not null,
      restricted_evidence_references jsonb not null
    );

    create table retained_records (
      id text primary key,
      category text not null,
      expires_at timestamptz not null,
      legal_hold boolean not null default false,
      appeal_active boolean not null default false,
      encrypted_payload bytea
    );

    create or replace function reject_identity_safety_audit_mutation()
    returns trigger language plpgsql as $$
    begin
      raise exception 'identity_safety_audit is append-only';
    end;
    $$;
    create trigger identity_safety_audit_no_update_delete
      before update or delete on identity_safety_audit
      for each row execute function reject_identity_safety_audit_mutation();
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    drop trigger identity_safety_audit_no_update_delete on identity_safety_audit;
    drop function reject_identity_safety_audit_mutation();
    drop table retained_records;
    drop table identity_safety_audit;
    drop table protected_actions;
    drop table appeals;
    drop table enforcement_actions;
    drop table reports;
    drop table moderation_cases;
    drop table account_blocks;
    drop table profile_claims;
    drop table public_bylines;
    drop table authentication_methods;
    drop table accounts;
  `);
};
