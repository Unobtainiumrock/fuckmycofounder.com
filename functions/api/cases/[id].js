import { getCaseRecord, isValidCaseId, publicCase } from "../../_shared/case-store.js";
import { error, json } from "../../_shared/env.js";
import { validateCardBytes } from "../../_shared/image-bytes.js";

export async function onRequestGet(context) {
  const { env, request, params } = context;
  const id = params.id;
  if (!isValidCaseId(id)) return error("Case not found.", 404);
  if (!env.FMC_CASES) return error("Storage bindings missing.", 503);

  const record = await getCaseRecord(env, id);
  if (!record) return error("Case not found.", 404);

  return json(publicCase(env, request, record), 200, {
    "cache-control": "public, max-age=300"
  });
}

export async function onRequestPut(context) {
  const { env, request, params } = context;
  const id = params.id;
  if (!isValidCaseId(id)) return error("Case not found.", 404);
  if (!env.FMC_CASES || !env.FMC_R2) return error("Storage bindings missing.", 503);

  const record = await getCaseRecord(env, id);
  if (!record) return error("Case not found.", 404);

  const cardBytes = new Uint8Array(await request.arrayBuffer());
  const cardError = validateCardBytes(cardBytes);
  if (cardError) return error(cardError);

  const cardKey = `cards/${id}.png`;
  await env.FMC_R2.put(cardKey, cardBytes, {
    httpMetadata: { contentType: "image/png" }
  });
  record.cardKey = cardKey;
  await env.FMC_CASES.put(`case:${id}`, JSON.stringify(record), { expirationTtl: 60 * 60 * 24 * 90 });

  const urls = publicCase(env, request, record);
  return json(urls);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, PUT, OPTIONS",
      "access-control-allow-headers": "content-type"
    }
  });
}
