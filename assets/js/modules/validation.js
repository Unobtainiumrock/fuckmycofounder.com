export const FIELD_LIMITS = {
  incident: 180,
  quote: 140,
  translation: 80
};

const IDENTIFIER_RULES = [
  { pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu, label: "email address" },
  { pattern: /\b(?:https?:\/\/|www\.)\S+/iu, label: "link" },
  { pattern: /(^|\s)@[a-z0-9_]{2,}/iu, label: "@handle" },
  { pattern: /\+?\d[\d\s().-]{7,}\d/u, label: "phone number" }
];

export function normalizeText(value) {
  return value.trim().replace(/\s+/gu, " ");
}

export function clampFieldValue(name, value) {
  const limit = FIELD_LIMITS[name];
  if (!limit || value.length <= limit) return value;
  return value.slice(0, limit);
}

export function enforceFieldLimit(field) {
  if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
  const limit = FIELD_LIMITS[field.name];
  if (!limit) return;
  const clamped = clampFieldValue(field.name, field.value);
  if (clamped !== field.value) {
    const end = Math.min(field.selectionStart ?? clamped.length, clamped.length);
    field.value = clamped;
    field.setSelectionRange(end, end);
  }
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

export function validatePayload(payload) {
  return [
    validateStatement("incident", payload.incident),
    validateStatement("quote", payload.quote),
    validateStatement("translation", payload.translation)
  ].every((error) => !error);
}
