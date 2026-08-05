import { generateCommentId } from "./case-id.js";

export const COMMENT_PAGE_DEFAULT = 20;
export const COMMENT_PAGE_MAX = 50;

export async function ensureThread(env, caseId, at = new Date().toISOString()) {
  await env.FMC_DB.prepare(
    `INSERT INTO threads (case_id, created_at, updated_at, comment_count)
     VALUES (?, ?, ?, 0)
     ON CONFLICT(case_id) DO NOTHING`
  ).bind(caseId, at, at).run();
}

export async function getThread(env, caseId) {
  return env.FMC_DB.prepare(
    `SELECT case_id AS caseId, created_at AS createdAt, updated_at AS updatedAt, comment_count AS commentCount
     FROM threads WHERE case_id = ?`
  ).bind(caseId).first();
}

function decodeCursor(cursor) {
  if (!cursor) return null;
  try {
    const [createdAt, id] = atob(cursor).split("|");
    if (!createdAt || !id) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

function encodeCursor(row) {
  return btoa(`${row.createdAt}|${row.id}`);
}

/**
 * Returns a page of comments in chronological order (oldest → newest).
 * The first page is the newest slice of the thread; `cursor` walks toward older notes.
 */
export async function listComments(env, caseId, { limit = COMMENT_PAGE_DEFAULT, cursor = null } = {}) {
  const pageLimit = Math.min(Math.max(1, limit), COMMENT_PAGE_MAX);
  const decoded = decodeCursor(cursor);

  let result;
  if (decoded) {
    result = await env.FMC_DB.prepare(
      `SELECT id, case_id AS caseId, body, created_at AS createdAt
       FROM comments
       WHERE case_id = ?
         AND (created_at < ? OR (created_at = ? AND id < ?))
       ORDER BY created_at DESC, id DESC
       LIMIT ?`
    ).bind(caseId, decoded.createdAt, decoded.createdAt, decoded.id, pageLimit + 1).all();
  } else {
    result = await env.FMC_DB.prepare(
      `SELECT id, case_id AS caseId, body, created_at AS createdAt
       FROM comments
       WHERE case_id = ?
       ORDER BY created_at DESC, id DESC
       LIMIT ?`
    ).bind(caseId, pageLimit + 1).all();
  }

  const rows = result.results ?? [];
  const complete = rows.length <= pageLimit;
  const newestFirst = complete ? rows : rows.slice(0, pageLimit);
  const items = [...newestFirst].reverse();
  const oldest = items[0];
  const next = complete || !oldest ? null : encodeCursor(oldest);
  return { items, cursor: next, complete };
}

export async function addComment(env, caseId, body) {
  const id = generateCommentId();
  const createdAt = new Date().toISOString();
  await ensureThread(env, caseId, createdAt);

  await env.FMC_DB.batch([
    env.FMC_DB.prepare(
      `INSERT INTO comments (id, case_id, body, created_at) VALUES (?, ?, ?, ?)`
    ).bind(id, caseId, body, createdAt),
    env.FMC_DB.prepare(
      `UPDATE threads
       SET comment_count = comment_count + 1, updated_at = ?
       WHERE case_id = ?`
    ).bind(createdAt, caseId)
  ]);

  const thread = await getThread(env, caseId);
  return {
    comment: { id, caseId, body, createdAt },
    thread
  };
}
