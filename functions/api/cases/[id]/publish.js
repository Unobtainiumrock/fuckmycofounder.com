import { getCaseRecord, isValidCaseId } from "../../../_shared/case-store.js";
import { error, json } from "../../../_shared/env.js";
import { feedKeyFor, feedSnapshot } from "../../../_shared/feed-store.js";
import { ensureThread } from "../../../_shared/thread-store.js";

export async function onRequestPost(context) {
  const { env, params } = context;
  const id = params.id;
  if (!isValidCaseId(id)) return error("Case not found.", 404);
  if (!env.FMC_CASES) return error("Storage bindings missing.", 503);

  const record = await getCaseRecord(env, id);
  if (!record) return error("Case not found.", 404);

  if (record.publishedAt) {
    if (env.FMC_DB) await ensureThread(env, id, record.publishedAt);
    return json({ id, publishedAt: record.publishedAt, alreadyPublished: true });
  }

  const publishedAt = new Date().toISOString();
  record.publishedAt = publishedAt;

  await env.FMC_CASES.put(feedKeyFor(id, Date.parse(publishedAt)), JSON.stringify(feedSnapshot(record, publishedAt)));
  await env.FMC_CASES.put(`case:${id}`, JSON.stringify(record));
  if (env.FMC_DB) await ensureThread(env, id, publishedAt);

  return json({ id, publishedAt, alreadyPublished: false }, 201);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "POST, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}
