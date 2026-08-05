const ALPHABET = "234567ABCDEFGHJKMNPQRSTUVWXYZ";

function randomToken(length) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  let token = "";
  for (const byte of bytes) {
    token += ALPHABET[byte % ALPHABET.length];
  }
  return token;
}

export function generateCaseId() {
  return `FMC-${randomToken(7)}`;
}

export function generateCommentId() {
  return `CMT-${randomToken(10)}`;
}
