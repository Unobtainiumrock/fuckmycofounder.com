export const up = (pgm) => {
  pgm.sql(`
    alter table retained_records add column completed_at timestamptz;
    create index retained_records_due_idx
      on retained_records (expires_at)
      where encrypted_payload is not null and legal_hold = false and appeal_active = false;
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    drop index retained_records_due_idx;
    alter table retained_records drop column completed_at;
  `);
};
