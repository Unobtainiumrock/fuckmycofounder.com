export const FIELD_LIMITS = {
  incident: 180,
  quote: 140,
  translation: 80,
  comment: 240
};

export const CHARGE_IDS = new Set([
  "quick-sync",
  "equity-amnesia",
  "pivot-addiction",
  "roadmap-ghosting",
  "ceo-vibes",
  "technical-quotes",
  "calendar-coup",
  "runway-literal"
]);

export const CASE_ID_PATTERN = /^FMC-[A-Z2-7]{7}$/u;

/** Accept "FMC-…", "CASE #FMC-…", or "#FMC-…" and return a canonical id or null. */
export function normalizeCaseId(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim().toUpperCase().replace(/^CASE\s*#?\s*/u, "").replace(/^#/u, "");
  return CASE_ID_PATTERN.test(cleaned) ? cleaned : null;
}

export const MAX_AVATAR_BYTES = 80 * 1024;
export const MAX_CARD_BYTES = 500 * 1024;
export const AVATAR_SIZE = 256;
export const CARD_WIDTH = 1200;
export const CARD_HEIGHT = 1500;

const IDENTIFIER_RULES = [
  { pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu, label: "email address" },
  { pattern: /\b(?:https?:\/\/|www\.)\S+/iu, label: "link" },
  { pattern: /(^|\s)@[a-z0-9_]{2,}/iu, label: "@handle" },
  { pattern: /\+?\d[\d\s().-]{7,}\d/u, label: "phone number" }
];

export function normalizeText(value) {
  return value.trim().replace(/\s+/gu, " ");
}

export function validateStatement(name, value) {
  const normalized = normalizeText(value);
  const limit = FIELD_LIMITS[name];
  if (limit && normalized.length > limit) return `Keep this under ${limit} characters.`;
  if (!normalized) return "This blank is doing founder-level work avoidance.";
  if (normalized.length < 8) return "Give the board at least eight characters of lore.";

  const identifier = IDENTIFIER_RULES.find(({ pattern }) => pattern.test(normalized));
  if (identifier) return `Please redact the ${identifier.label}. Make it unfindable.`;
  return "";
}

export function validateCasePayload(payload) {
  if (!CHARGE_IDS.has(payload.chargeId)) return "Invalid charge.";
  for (const name of ["incident", "quote", "translation"]) {
    const error = validateStatement(name, payload[name]);
    if (error) return error;
  }
  return "";
}

export function validateCommentBody(value) {
  return validateStatement("comment", value);
}
