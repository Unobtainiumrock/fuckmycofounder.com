export const up = (pgm) => {
  pgm.sql(`
    alter table accounts add column pre_deletion_state text
      check (pre_deletion_state in ('active', 'limited', 'suspended'));
    alter table accounts add column legal_hold boolean not null default false;
    alter table accounts add column recovery_reverification_required boolean not null default false;
    alter table profile_claims add column legal_hold boolean not null default false;
    alter table profile_claims add column appeal_active boolean not null default false;
    alter table profile_claims add column original_reviewer_id text;
    alter table profile_claims add column reverify_required boolean not null default false;
    alter table profile_claims add column appeal_deadline timestamptz;
    alter table profile_claims add column submission_reauthenticated_at timestamptz;
    alter table reports add column expires_at timestamptz;
    alter table reports add column legal_hold boolean not null default false;
    alter table reports add column appeal_active boolean not null default false;
    alter table moderation_cases add column evidence_expires_at timestamptz;
    alter table moderation_cases add column legal_hold boolean not null default false;
    alter table moderation_cases add column appeal_active boolean not null default false;
    alter table moderation_cases add column resolved_at timestamptz;
    alter table moderation_cases add column affected_account_id text references accounts(id);
    alter table moderation_cases add column affected_claim_id text references profile_claims(id);
    alter table enforcement_actions add column affected_account_id text references accounts(id);
    alter table enforcement_actions add column affected_claim_id text references profile_claims(id);
    alter table enforcement_actions add column prior_account_state text
      check (prior_account_state in ('active', 'limited', 'suspended', 'deletion-pending', 'deleted'));
    alter table enforcement_actions add column prior_claim_state text
      check (prior_claim_state in ('pending', 'verified', 'rejected', 'revoked'));
    alter table appeals add column original_enforcement_id text references enforcement_actions(id);
    alter table appeals add column state text not null default 'pending'
      check (state in ('pending', 'resolved'));
    alter table identity_safety_audit add column expires_at timestamptz;
    alter table identity_safety_audit add column legal_hold boolean not null default false;
    create table audit_evidence_payloads (
      audit_id text primary key references identity_safety_audit(id),
      restricted_references jsonb not null,
      expires_at timestamptz not null,
      legal_hold boolean not null default false,
      appeal_active boolean not null default false
    );
    create table account_sessions (
      id text primary key,
      account_id text not null references accounts(id),
      reauthenticated_at timestamptz not null,
      revoked_at timestamptz
    );
    create table recovery_reviews (
      id text primary key,
      account_id text references accounts(id),
      state text not null check (state in ('pending', 'approved', 'denied')),
      hold_until timestamptz not null,
      proof_verified boolean not null default false,
      created_at timestamptz not null
    );
    create table identity_safety_notices (
      id text primary key,
      account_id text not null references accounts(id),
      kind text not null,
      safe_message text not null,
      created_at timestamptz not null
    );
    create table claim_challenges (
      id text primary key,
      claim_id text not null references profile_claims(id),
      challenger_account_id text not null references accounts(id),
      state text not null check (state in ('open', 'resolved')),
      created_at timestamptz not null
    );
    create table claim_appeals (
      id text primary key,
      claim_id text not null references profile_claims(id),
      appellant_account_id text not null references accounts(id),
      reviewer_id text not null,
      original_reviewer_id text not null,
      original_state text not null check (original_state in ('verified', 'rejected', 'revoked')),
      new_context text not null,
      created_at timestamptz not null,
      state text not null default 'pending' check (state in ('pending', 'resolved')),
      check (reviewer_id <> original_reviewer_id)
    );
    create table appeal_decisions (
      id text primary key,
      appeal_id text not null unique references appeals(id),
      original_enforcement_id text not null references enforcement_actions(id),
      new_enforcement_id text not null unique references enforcement_actions(id),
      reviewer_id text not null,
      decided_at timestamptz not null
    );
    create table claim_appeal_decisions (
      id text primary key,
      claim_appeal_id text not null unique references claim_appeals(id),
      reviewer_id text not null,
      resulting_state text not null check (resulting_state in ('verified', 'rejected', 'revoked')),
      reason_code text not null,
      decided_at timestamptz not null
    );
    create table restricted_reveals (
      id text primary key,
      actor_id text not null,
      approver_id text not null,
      case_reason text not null,
      field_class text not null,
      linkage_id text not null,
      allowed boolean not null,
      audit_id text not null unique references identity_safety_audit(id),
      created_at timestamptz not null
    );
    create table anonymous_linkages (
      id text primary key,
      account_id text not null references accounts(id),
      encrypted_payload bytea,
      expires_at timestamptz not null,
      legal_hold boolean not null default false,
      appeal_active boolean not null default false
    );
    create table restricted_reveal_approvals (
      id text primary key,
      case_id text not null references moderation_cases(id),
      linkage_id text not null references anonymous_linkages(id),
      request_actor_id text not null,
      approver_id text not null,
      case_reason text not null,
      approved_at timestamptz not null,
      used_at timestamptz,
      check (request_actor_id <> approver_id)
    );
    alter table restricted_reveals add column approval_id text not null
      references restricted_reveal_approvals(id);
    alter table restricted_reveals add constraint restricted_reveal_linkage
      foreign key (linkage_id) references anonymous_linkages(id);
    create table abuse_reviews (
      id text primary key,
      subject_account_id text references accounts(id),
      target_id text not null,
      reason text not null,
      attempts integer not null check (attempts >= 0),
      coordinated_accounts integer not null check (coordinated_accounts >= 0),
      decision text not null check (decision in ('allowed', 'review-required')),
      reason_code text not null,
      case_id text unique references moderation_cases(id),
      created_at timestamptz not null
    );
    create table security_logs (
      id text primary key,
      account_id text references accounts(id),
      reason_code text not null,
      minimized_payload jsonb,
      expires_at timestamptz not null,
      legal_hold boolean not null default false
    );
    create table byline_edits (
      id text primary key,
      account_id text not null references accounts(id),
      prior_display_name text,
      created_at timestamptz not null
    );
    create table legal_holds (
      id text primary key,
      scope_kind text not null check (scope_kind in ('account', 'claim', 'report', 'case', 'audit', 'anonymous-linkage', 'security-log')),
      scope_id text not null,
      authority text not null,
      reason text not null,
      created_at timestamptz not null,
      released_at timestamptz
    );
    create unique index one_active_legal_hold_per_scope
      on legal_holds(scope_kind, scope_id) where released_at is null;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    do $$
    begin
      if exists (select 1 from account_sessions)
        or exists (select 1 from audit_evidence_payloads)
        or exists (select 1 from recovery_reviews)
        or exists (select 1 from identity_safety_notices)
        or exists (select 1 from claim_challenges)
        or exists (select 1 from claim_appeals)
        or exists (select 1 from appeal_decisions)
        or exists (select 1 from claim_appeal_decisions)
        or exists (select 1 from restricted_reveals)
        or exists (select 1 from restricted_reveal_approvals)
        or exists (select 1 from anonymous_linkages)
        or exists (select 1 from security_logs)
        or exists (select 1 from byline_edits)
        or exists (select 1 from legal_holds)
        or exists (select 1 from abuse_reviews)
        or exists (select 1 from accounts where pre_deletion_state is not null or legal_hold or recovery_reverification_required)
        or exists (select 1 from profile_claims where legal_hold or appeal_active or original_reviewer_id is not null or reverify_required or appeal_deadline is not null or submission_reauthenticated_at is not null)
        or exists (select 1 from reports where expires_at is not null or legal_hold or appeal_active)
        or exists (select 1 from identity_safety_audit where expires_at is not null or legal_hold)
        or exists (select 1 from enforcement_actions where affected_account_id is not null or affected_claim_id is not null or prior_account_state is not null or prior_claim_state is not null)
        or exists (select 1 from moderation_cases where resolved_at is not null or legal_hold or appeal_active or affected_account_id is not null or affected_claim_id is not null)
      then
        raise exception 'identity safety operations migration rollback requires empty operational data';
      end if;
    end $$;
    drop table legal_holds;
    drop table byline_edits;
    drop table abuse_reviews;
    drop table audit_evidence_payloads;
    drop table security_logs;
    drop table restricted_reveals;
    drop table restricted_reveal_approvals;
    drop table anonymous_linkages;
    drop table claim_appeal_decisions;
    drop table claim_appeals;
    drop table appeal_decisions;
    drop table claim_challenges;
    drop table identity_safety_notices;
    drop table recovery_reviews;
    drop table account_sessions;
    alter table identity_safety_audit drop column legal_hold;
    alter table identity_safety_audit drop column expires_at;
    alter table moderation_cases drop column appeal_active;
    alter table moderation_cases drop column resolved_at;
    alter table moderation_cases drop column affected_claim_id;
    alter table moderation_cases drop column affected_account_id;
    alter table moderation_cases drop column legal_hold;
    alter table moderation_cases drop column evidence_expires_at;
    alter table reports drop column appeal_active;
    alter table reports drop column legal_hold;
    alter table reports drop column expires_at;
    alter table accounts drop column pre_deletion_state;
    alter table accounts drop column recovery_reverification_required;
    alter table accounts drop column legal_hold;
    alter table profile_claims drop column appeal_active;
    alter table profile_claims drop column legal_hold;
    alter table profile_claims drop column original_reviewer_id;
    alter table profile_claims drop column reverify_required;
    alter table profile_claims drop column appeal_deadline;
    alter table profile_claims drop column submission_reauthenticated_at;
    alter table appeals drop column state;
    alter table appeals drop column original_enforcement_id;
    alter table enforcement_actions drop column affected_account_id;
    alter table enforcement_actions drop column affected_claim_id;
    alter table enforcement_actions drop column prior_account_state;
    alter table enforcement_actions drop column prior_claim_state;
  `);
};
