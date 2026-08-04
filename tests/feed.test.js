import assert from "node:assert/strict";
import test from "node:test";

import { FEED_PREFIX, feedKeyFor, feedSnapshot, invertTimestamp } from "../functions/_shared/feed-store.js";

test("newer publishes sort first in a prefix listing", () => {
  const older = feedKeyFor("FMC-AAAAAAA", Date.parse("2026-08-01T00:00:00Z"));
  const newer = feedKeyFor("FMC-BBBBBBB", Date.parse("2026-08-04T00:00:00Z"));
  assert.ok(newer < older, "lexicographic order must be newest-first");
  assert.ok(older.startsWith(FEED_PREFIX) && newer.startsWith(FEED_PREFIX));
});

test("inverted timestamps keep a fixed width", () => {
  assert.equal(invertTimestamp(0).length, 13);
  assert.equal(invertTimestamp(Date.now()).length, 13);
});

test("feed snapshots carry only board-safe fields", () => {
  const record = {
    v: 1,
    id: "FMC-ABC2345",
    chargeId: "quick-sync",
    incident: "called a six a.m. meeting",
    quote: "we move at the speed of trust",
    translation: "calendar warfare",
    avatarKey: "avatars/FMC-ABC2345.jpg",
    cardKey: null,
    createdAt: "2026-08-04T00:00:00.000Z",
    internalNote: "should never leak"
  };
  const snapshot = feedSnapshot(record, "2026-08-04T01:00:00.000Z");
  assert.deepEqual(Object.keys(snapshot).sort(), [
    "avatarKey", "cardKey", "chargeId", "createdAt", "id", "incident", "publishedAt", "quote", "translation", "v"
  ]);
  assert.equal(snapshot.publishedAt, "2026-08-04T01:00:00.000Z");
});
