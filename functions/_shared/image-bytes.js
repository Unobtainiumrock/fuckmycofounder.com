import { MAX_AVATAR_BYTES, MAX_CARD_BYTES } from "../../shared/case-limits.js";

const JPEG_SOI = [0xff, 0xd8, 0xff];
const PNG_SIG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

function hasPrefix(bytes, prefix) {
  if (bytes.length < prefix.length) return false;
  return prefix.every((value, index) => bytes[index] === value);
}

export function validateAvatarBytes(bytes) {
  if (!bytes || bytes.byteLength === 0) return "Avatar missing.";
  if (bytes.byteLength > MAX_AVATAR_BYTES) return "Avatar too large.";
  if (!hasPrefix(bytes, JPEG_SOI)) return "Avatar must be JPEG.";
  return "";
}

export function validateCardBytes(bytes) {
  if (!bytes || bytes.byteLength === 0) return "Card missing.";
  if (bytes.byteLength > MAX_CARD_BYTES) return "Card too large.";
  if (!hasPrefix(bytes, PNG_SIG)) return "Card must be PNG.";
  return "";
}
