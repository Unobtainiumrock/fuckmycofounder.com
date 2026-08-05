export const FEED_PREFIX = "feed:";
export const FEED_TTL_SECONDS = 60 * 60 * 24 * 90;

// Lexicographic order of inverted timestamps yields newest-first KV listings.
const TIMESTAMP_MAX = 9_999_999_999_999;

export function invertTimestamp(ms) {
  return String(TIMESTAMP_MAX - ms).padStart(13, "0");
}

export function feedKeyFor(id, ms) {
  return `${FEED_PREFIX}${invertTimestamp(ms)}:${id}`;
}

export function feedSnapshot(record, publishedAt) {
  return {
    v: 1,
    id: record.id,
    chargeId: record.chargeId,
    incident: record.incident,
    quote: record.quote,
    translation: record.translation,
    avatarKey: record.avatarKey ?? null,
    cardKey: record.cardKey ?? null,
    createdAt: record.createdAt,
    publishedAt
  };
}
