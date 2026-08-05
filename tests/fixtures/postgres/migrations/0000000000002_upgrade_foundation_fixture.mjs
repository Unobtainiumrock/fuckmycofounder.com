export const up = (pgm) => {
  pgm.sql(`
    alter table foundation_subjects
      add column updated_at timestamptz not null default now();
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    alter table foundation_subjects drop column updated_at;
  `);
};
