import assert from "node:assert/strict";
import test from "node:test";

import { decodeReportFragment, encodeReport } from "../assets/js/modules/codec.js";
import { buildReport } from "../assets/js/modules/report.js";
import { validateStatement } from "../assets/js/modules/validation.js";

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

test("generated reports are deterministic", () => {
  assert.deepEqual(buildReport(payload), buildReport(payload));
  assert.match(buildReport(payload).id, /^FMC-[A-Z0-9]{7}$/u);
});

test("contact info is rejected, names and handles pass", () => {
  assert.match(validateStatement("incident", "emailed founder@example.com yesterday"), /email address/u);
  assert.match(validateStatement("incident", "texted me from 415-555-0134 at midnight"), /phone number/u);
  assert.equal(validateStatement("incident", "slacked @definitely_a_person"), "");
  assert.equal(validateStatement("incident", "posted it at https://example.com first"), "");
  assert.equal(validateStatement("incident", payload.incident), "");
});

test("malformed and oversized fragments fail closed", () => {
  assert.equal(decodeReportFragment("#r=this-is-not-json"), null);
  assert.equal(decodeReportFragment(`#r=${"a".repeat(1801)}`), null);
});
