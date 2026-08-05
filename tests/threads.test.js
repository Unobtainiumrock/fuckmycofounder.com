import assert from "node:assert/strict";
import test from "node:test";

import { generateCommentId } from "../functions/_shared/case-id.js";
import { FIELD_LIMITS, validateCommentBody } from "../shared/case-limits.js";

test("comment ids are anonymous opaque tokens", () => {
  assert.match(generateCommentId(), /^CMT-[A-Z2-7]{10}$/u);
  assert.notEqual(generateCommentId(), generateCommentId());
});

test("comment bodies use the shared redaction rules", () => {
  assert.equal(FIELD_LIMITS.comment, 240);
  assert.equal(validateCommentBody("same energy in my seed round sync"), "");
  assert.match(validateCommentBody("email me at founder@example.com"), /email address/u);
  assert.match(validateCommentBody("short"), /eight characters/u);
  assert.match(validateCommentBody("a".repeat(241)), /240 characters/u);
});
