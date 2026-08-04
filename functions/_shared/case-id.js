const ALPHABET = "234567ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateCaseId() {
  const bytes = crypto.getRandomValues(new Uint8Array(7));
  let id = "FMC-";
  for (const byte of bytes) {
    id += ALPHABET[byte % ALPHABET.length];
  }
  return id;
}
