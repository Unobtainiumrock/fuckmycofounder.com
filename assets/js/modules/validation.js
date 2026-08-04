import {
  FIELD_LIMITS,
  normalizeText,
  validateStatement
} from "../../../shared/case-limits.js";

export { FIELD_LIMITS, normalizeText, validateStatement };

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

export function validatePayload(payload) {
  return [
    validateStatement("incident", payload.incident),
    validateStatement("quote", payload.quote),
    validateStatement("translation", payload.translation)
  ].every((error) => !error);
}
