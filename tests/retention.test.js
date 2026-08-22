import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(p, import.meta.url), "utf8");

// Content on the Town Board is permanent. It used to carry a 90-day
// expirationTtl, so filings silently deleted themselves off a "public record"
// while their D1 comment threads -- which have no expiry -- survived, leaving
// corroboration pointing at case ids that no longer existed.
const CONTENT_WRITERS = [
  "../functions/api/cases.js",
  "../functions/api/cases/[id].js",
  "../functions/api/cases/[id]/publish.js"
];

test("no content write sets an expiration", () => {
  for (const path of CONTENT_WRITERS) {
    assert.ok(!read(path).includes("expirationTtl"), `${path} must not expire stored cases or feed keys`);
  }
});

test("the retired feed TTL constant is gone, not just unused", () => {
  assert.ok(!read("../functions/_shared/feed-store.js").includes("FEED_TTL_SECONDS"));
});

test("rate-limit counters still expire -- they are not content", () => {
  const source = read("../functions/_shared/rate-limit.js");
  assert.match(source, /expirationTtl:\s*7200/);
});
