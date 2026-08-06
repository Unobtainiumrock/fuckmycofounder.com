export const up = (pgm) => {
  pgm.sql(`
    alter table accounts add column pre_deletion_state text
      check (pre_deletion_state in ('active', 'limited', 'suspended'));
    alter table profile_claims add column legal_hold boolean not null default false;
    alter table profile_claims add column appeal_active boolean not null default false;
    alter table profile_claims add column original_reviewer_id text;
    alter table reports add column expires_at timestamptz;
    alter table reports add column legal_hold boolean not null default false;
    alter table reports add column appeal_active boolean not null default false;
    alter table moderation_cases add column evidence_expires_at timestamptz;
    alter table moderation_cases add column legal_hold boolean not null default false;
    alter table moderation_cases add column appeal_active boolean not null default false;
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
      revoked_at timestamptz
    );
    create table recovery_reviews (
      id text primary key,
      account_id text references accounts(id),
      state text not null check (state in ('pending', 'approved', 'denied')),
      hold_until timestamptz not null,
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
      new_context text not null,
      created_at timestamptz not null,
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
    create table restricted_reveals (
      id text primary key,
      actor_id text not null,
      approver_id text not null,
      case_reason text not null,
      field_class text not null,
      allowed boolean not null,
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
    create table security_logs (
      id text primary key,
      account_id text references accounts(id),
      reason_code text not null,
      minimized_payload jsonb,
      expires_at timestamptz not null,
      legal_hold boolean not null default false
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    drop table audit_evidence_payloads;
    drop table security_logs;
    drop table anonymous_linkages;
    drop table restricted_reveals;
    drop table claim_appeals;
    drop table appeal_decisions;
    drop table claim_challenges;
    drop table identity_safety_notices;
    drop table recovery_reviews;
    drop table account_sessions;
    alter table identity_safety_audit drop column legal_hold;
    alter table identity_safety_audit drop column expires_at;
    alter table moderation_cases drop column appeal_active;
    alter table moderation_cases drop column legal_hold;
    alter table moderation_cases drop column evidence_expires_at;
    alter table reports drop column appeal_active;
    alter table reports drop column legal_hold;
    alter table reports drop column expires_at;
    alter table accounts drop column pre_deletion_state;
    alter table profile_claims drop column appeal_active;
    alter table profile_claims drop column legal_hold;
    alter table profile_claims drop column original_reviewer_id;
  `);
};
