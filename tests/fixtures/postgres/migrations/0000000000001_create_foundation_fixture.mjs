export const up = (pgm) => {
  pgm.sql(`
    create table foundation_subjects (
      id text primary key,
      state text not null,
      revision bigint not null default 0,
      constraint foundation_subjects_state_check
        check (state in ('active', 'closed'))
    );

    create table foundation_audit (
      id bigint generated always as identity primary key,
      subject_id text not null references foundation_subjects(id),
      action text not null,
      correlation_id text not null,
      created_at timestamptz not null default now()
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    drop table foundation_audit;
    drop table foundation_subjects;
  `);
};
