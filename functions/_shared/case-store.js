import { CASE_ID_PATTERN } from "../../shared/case-limits.js";
import { mediaBaseUrl } from "./env.js";

export function isValidCaseId(id) {
  return CASE_ID_PATTERN.test(id);
}

export function caseUrls(env, request, id, record) {
  const base = mediaBaseUrl(env, request);
  return {
    avatarUrl: record.avatarKey ? `${base}/avatars/${id}` : null,
    cardUrl: record.cardKey ? `${base}/cards/${id}` : null
  };
}

export async function getCaseRecord(env, id) {
  if (!isValidCaseId(id)) return null;
  const raw = await env.FMC_CASES.get(`case:${id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function publicCase(env, request, record) {
  const urls = caseUrls(env, request, record.id, record);
  return {
    id: record.id,
    chargeId: record.chargeId,
    incident: record.incident,
    quote: record.quote,
    translation: record.translation,
    avatarUrl: urls.avatarUrl,
    cardUrl: urls.cardUrl,
    createdAt: record.createdAt
  };
}
