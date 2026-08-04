import assert from "node:assert/strict";
import test from "node:test";

import { decodeCaseFragment, decodeReportFragment, encodeReport, parseCasePath } from "../assets/js/modules/codec.js";
import { AVATAR_SIZE, ACCEPTED_TYPES } from "../assets/js/modules/avatar.js";
import { buildReport } from "../assets/js/modules/report.js";
import { validateStatement, clampFieldValue, FIELD_LIMITS } from "../assets/js/modules/validation.js";
import { validateCasePayload } from "../shared/case-limits.js";

const payload = {
  chargeId: "quick-sync",
  incident: "called a six a.m. meeting",
  quote: "we move at the speed of trust",
  translation: "calendar warfare"
};

test("share fragments round-trip without a server", () => {
  const decoded = decodeReportFragment(`#r=${encodeReport(payload)}`);
  assert.deepEqual(decoded, {
    v: 1,
    c: payload.chargeId,
    i: payload.incident,
    q: payload.quote,
    t: payload.translation
  });
});

test("case fragments and paths decode persisted ids", () => {
  assert.equal(decodeCaseFragment("#c=FMC-ABC2345"), "FMC-ABC2345");
  assert.equal(decodeCaseFragment("#c=not-valid"), null);
  assert.equal(parseCasePath("/c/FMC-ABC2345"), "FMC-ABC2345");
  assert.equal(parseCasePath("/"), null);
});

test("generated reports are deterministic", () => {
  assert.deepEqual(buildReport(payload), buildReport(payload));
  assert.match(buildReport(payload).id, /^FMC-[A-Z0-9]{7}$/u);
});

test("persisted reports keep server ids and urls", () => {
  const report = buildReport({
    ...payload,
    id: "FMC-234567A",
    avatarUrl: "/api/avatars/FMC-234567A",
    cardUrl: "/api/cards/FMC-234567A",
    persisted: true
  });
  assert.equal(report.id, "FMC-234567A");
  assert.equal(report.persisted, true);
  assert.match(report.avatarUrl, /avatars/u);
});

test("redaction checks reject common identifiers", () => {
  assert.match(validateStatement("incident", "emailed founder@example.com yesterday"), /email address/u);
  assert.match(validateStatement("incident", "posted it at https:\/\/example.com"), /link/u);
  assert.match(validateStatement("incident", "slacked @definitely_a_person"), /@handle/u);
  assert.equal(validateStatement("incident", payload.incident), "");
});

test("field values clamp to their character caps", () => {
  assert.equal(clampFieldValue("incident", "a".repeat(200)).length, FIELD_LIMITS.incident);
  assert.equal(clampFieldValue("quote", "b".repeat(200)).length, FIELD_LIMITS.quote);
  assert.equal(clampFieldValue("translation", "c".repeat(200)).length, FIELD_LIMITS.translation);
});

test("malformed and oversized fragments fail closed", () => {
  assert.equal(decodeReportFragment("#r=this-is-not-json"), null);
  assert.equal(decodeReportFragment(`#r=${"a".repeat(1801)}`), null);
});

test("avatar upload accepts common image types at fixed size", () => {
  assert.equal(AVATAR_SIZE, 256);
  assert.ok(ACCEPTED_TYPES.has("image/jpeg"));
  assert.ok(ACCEPTED_TYPES.has("image/png"));
  assert.ok(ACCEPTED_TYPES.has("image/webp"));
});

test("case payload validation rejects invalid charges", () => {
  assert.equal(validateCasePayload(payload), "");
  assert.match(validateCasePayload({ ...payload, chargeId: "not-real" }), /Invalid charge/u);
});
