import {
  normalizeText,
  validateCommentBody
} from "../../../../shared/case-limits.js";
import { getCaseRecord, isValidCaseId } from "../../../_shared/case-store.js";
import { error, json } from "../../../_shared/env.js";
import { checkRateLimit } from "../../../_shared/rate-limit.js";
import {
  COMMENT_PAGE_DEFAULT,
  addComment,
  ensureThread,
  getThread,
  listComments
} from "../../../_shared/thread-store.js";

async function requirePublishedCase(env, id) {
  if (!isValidCaseId(id)) return { error: error("Case not found.", 404) };
  if (!env.FMC_CASES || !env.FMC_DB) return { error: error("Storage bindings missing.", 503) };

  const record = await getCaseRecord(env, id);
  if (!record?.publishedAt) return { error: error("Case not found.", 404) };
  return { record };
}

export async function onRequestGet(context) {
  const { env, request, params } = context;
  const gate = await requirePublishedCase(env, params.id);
  if (gate.error) return gate.error;

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit")) || COMMENT_PAGE_DEFAULT;
  const cursor = url.searchParams.get("cursor");

  await ensureThread(env, params.id, gate.record.publishedAt);
  const thread = await getThread(env, params.id);
  const page = await listComments(env, params.id, { limit, cursor });

  return json({
    thread: {
      caseId: params.id,
      commentCount: thread?.commentCount ?? 0,
      updatedAt: thread?.updatedAt ?? null
    },
    items: page.items,
    cursor: page.cursor,
    complete: page.complete
  }, 200, {
    "cache-control": "public, max-age=15"
  });
}

export async function onRequestPost(context) {
  const { env, request, params } = context;
  const gate = await requirePublishedCase(env, params.id);
  if (gate.error) return gate.error;

  if (!(await checkRateLimit(env, request, {
    prefix: "rl:comment",
    limitEnv: "COMMENT_RATE_LIMIT",
    defaultLimit: 20
  }))) {
    return error("Too many notes this hour. Let the lore breathe.", 429);
  }

  let payload;
  try {
    payload = await request.json();
  } catch {
    return error("Invalid JSON payload.");
  }

  const body = normalizeText(String(payload?.body ?? ""));
  const validationError = validateCommentBody(body);
  if (validationError) return error(validationError);

  const { comment, thread } = await addComment(env, params.id, body);
  return json({
    comment,
    thread: {
      caseId: params.id,
      commentCount: thread?.commentCount ?? 1,
      updatedAt: thread?.updatedAt ?? comment.createdAt
    }
  }, 201);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}
