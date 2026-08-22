import {
  normalizeText,
  validateCasePayload
} from "../../shared/case-limits.js";
import { generateCaseId } from "../_shared/case-id.js";
import { caseUrls, getCaseRecord, publicCase } from "../_shared/case-store.js";
import { error, json } from "../_shared/env.js";
import { validateAvatarBytes } from "../_shared/image-bytes.js";
import { checkRateLimit } from "../_shared/rate-limit.js";

async function parseCaseForm(request) {
  const form = await request.formData();
  return {
    chargeId: String(form.get("chargeId") ?? ""),
    incident: normalizeText(String(form.get("incident") ?? "")),
    quote: normalizeText(String(form.get("quote") ?? "")),
    translation: normalizeText(String(form.get("translation") ?? "")),
    avatar: form.get("avatar")
  };
}

export async function onRequestPost(context) {
  const { env, request } = context;
  if (!env.FMC_CASES || !env.FMC_R2) return error("Storage bindings missing.", 503);
  if (!(await checkRateLimit(env, request))) return error("Too many filings this hour. Touch grass, then retry.", 429);

  let form;
  try {
    form = await parseCaseForm(request);
  } catch {
    return error("Invalid form payload.");
  }

  const payload = {
    chargeId: form.chargeId,
    incident: form.incident,
    quote: form.quote,
    translation: form.translation
  };
  const validationError = validateCasePayload(payload);
  if (validationError) return error(validationError);

  const id = generateCaseId();
  const createdAt = new Date().toISOString();
  const record = {
    v: 1,
    id,
    chargeId: payload.chargeId,
    incident: payload.incident,
    quote: payload.quote,
    translation: payload.translation,
    avatarKey: null,
    cardKey: null,
    createdAt
  };

  if (form.avatar instanceof File && form.avatar.size > 0) {
    const avatarBytes = new Uint8Array(await form.avatar.arrayBuffer());
    const avatarError = validateAvatarBytes(avatarBytes);
    if (avatarError) return error(avatarError);
    const avatarKey = `avatars/${id}.jpg`;
    await env.FMC_R2.put(avatarKey, avatarBytes, {
      httpMetadata: { contentType: "image/jpeg" }
    });
    record.avatarKey = avatarKey;
  }

  await env.FMC_CASES.put(`case:${id}`, JSON.stringify(record));

  return json({
    ...publicCase(env, request, record),
    cardUrl: null
  }, 201);
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
