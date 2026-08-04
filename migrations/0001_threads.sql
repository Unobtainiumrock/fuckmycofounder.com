-- Per-case conversation threads for Town Board corroboration.
-- One thread per published case; anonymous comments only.

CREATE TABLE threads (
  case_id TEXT PRIMARY KEY NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  comment_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE comments (
  id TEXT PRIMARY KEY NOT NULL,
  case_id TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (case_id) REFERENCES threads(case_id)
);

CREATE INDEX idx_comments_case_created ON comments(case_id, created_at);
