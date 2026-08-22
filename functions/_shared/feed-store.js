export const FEED_PREFIX = "feed:";

// Nothing on the board expires. A public record that quietly deletes itself
// after 90 days is not a record, and the D1 comment threads have no expiry --
// so an expiring case left orphaned corroboration pointing at a case id that
// no longer existed. Rate-limit counters still expire; they are not content.

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
