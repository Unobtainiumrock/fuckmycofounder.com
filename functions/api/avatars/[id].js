import { getCaseRecord, isValidCaseId } from "../../_shared/case-store.js";

export async function onRequestGet(context) {
  const { env, params } = context;
  const id = params.id;
  if (!isValidCaseId(id) || !env.FMC_R2) return new Response("Not found", { status: 404 });

  const record = await getCaseRecord(env, id);
  if (!record?.avatarKey) return new Response("Not found", { status: 404 });

  const object = await env.FMC_R2.get(record.avatarKey);
  if (!object) return new Response("Not found", { status: 404 });

  return new Response(object.body, {
    headers: {
      "content-type": "image/jpeg",
      "cache-control": "public, max-age=86400"
    }
  });
}
