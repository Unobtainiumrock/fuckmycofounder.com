import { CASE_ID_PATTERN } from "../../../shared/case-limits.js";

const MAX_FRAGMENT_LENGTH = 1800;

function bytesToBase64(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "");
}

function base64ToBytes(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

export function encodeReport(report) {
  const payload = {
    v: 1,
    c: report.chargeId,
    i: report.incident,
    q: report.quote,
    t: report.translation
  };
  return bytesToBase64(new TextEncoder().encode(JSON.stringify(payload)));
}

export function decodeReportFragment(hash) {
  if (!hash.startsWith("#r=") || hash.length > MAX_FRAGMENT_LENGTH) return null;

  try {
    const payload = JSON.parse(new TextDecoder().decode(base64ToBytes(hash.slice(3))));
    if (payload?.v !== 1) return null;
    if (![payload.c, payload.i, payload.q, payload.t].every((value) => typeof value === "string")) return null;
    if (payload.i.length > 180 || payload.q.length > 140 || payload.t.length > 80) return null;
    return payload;
  } catch {
    return null;
  }
}

export function decodeCaseFragment(hash) {
  if (!hash.startsWith("#c=")) return null;
  const id = hash.slice(3).trim();
  return CASE_ID_PATTERN.test(id) ? id : null;
}

export function parseCasePath(pathname) {
  const match = pathname.match(/^\/c\/(FMC-[A-Z2-7]{7})\/?$/u);
  return match ? match[1] : null;
}
