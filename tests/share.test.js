import assert from "node:assert/strict";
import test, { mock } from "node:test";

// share.js -> feed.js -> markStoryShared touches document/localStorage.
// Minimal shims so the publish path is exercisable outside a browser.
globalThis.document = { dispatchEvent() {} };
globalThis.CustomEvent = class { constructor(type, init) { this.type = type; Object.assign(this, init); } };
globalThis.window = { location: { origin: "https://fuckmycofounder.com", assign() {} } };

const { postToBoard } = await import("../assets/js/modules/share.js");
const { buildReport } = await import("../assets/js/modules/report.js");

function stubFetch(response) {
  globalThis.fetch = mock.fn(async () => response);
}

const persisted = { id: "FMC-ABC2345", persisted: true };

test("posting to the board is its own operation and hits the publish endpoint", async () => {
  stubFetch({ ok: true, json: async () => ({ id: persisted.id, publishedAt: "2026-08-22T00:00:00.000Z" }) });

  const result = await postToBoard(persisted);

  assert.equal(result.publishedAt, "2026-08-22T00:00:00.000Z");
  assert.equal(result.alreadyPublished, false);
  const [url, init] = globalThis.fetch.mock.calls[0].arguments;
  assert.equal(url, "/api/cases/FMC-ABC2345/publish");
  assert.equal(init.method, "POST");
});

test("a failed publish is reported, never swallowed", async () => {
  // The original defect: the publish error was caught and discarded, and the
  // user was told to file again -- which mints a second case id and orphans
  // the first. A rejection here is what keeps that from coming back.
  stubFetch({ ok: false, json: async () => ({ error: "Case not found." }) });

  await assert.rejects(() => postToBoard(persisted), /Case not found/);
});

test("posting reports an already-published case instead of double-posting", async () => {
  stubFetch({ ok: true, json: async () => ({ id: persisted.id, publishedAt: "2026-08-22T00:00:00.000Z", alreadyPublished: true }) });

  const result = await postToBoard(persisted);
  assert.equal(result.alreadyPublished, true);
});

test("an unpersisted report cannot reach the board", async () => {
  stubFetch({ ok: true, json: async () => ({}) });

  await assert.rejects(() => postToBoard({ id: "FMC-LOCAL22", persisted: false }), /only lives in your link/);
  assert.equal(globalThis.fetch.mock.calls.length, 0);
});

test("buildReport carries publish state so step three can render it", () => {
  const payload = { chargeId: "quick-sync", incident: "a", quote: "b", translation: "c" };
  assert.equal(buildReport(payload).published, false);
  assert.equal(buildReport({ ...payload, published: true }).published, true);
});
