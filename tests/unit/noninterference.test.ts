import { describe, expect, it } from "vitest";

import { findProjectionLeaks } from "../support/noninterference";

const policy = {
  forbiddenKeys: [
    "accountId",
    "anonymousAuthorId",
    "moderationEvidence",
    "blockDirection",
  ],
  forbiddenValues: ["acct_01K2SECRET", "anonymous-linkage-44"],
};

describe("public/restricted noninterference harness", () => {
  it("accepts paired public output, metadata, log, event, export, and error fixtures", () => {
    const safeSurfaces = [
      {
        surface: "response",
        value: { reviewId: "review_public_1", body: "Filed testimony" },
      },
      {
        surface: "metadata",
        value: { title: "Filed assessment", robots: "index,follow" },
      },
      { surface: "log", value: { requestId: "req_1", outcome: "unavailable" } },
      {
        surface: "event",
        value: { type: "review.published", reviewId: "review_public_1" },
      },
      {
        surface: "export",
        value: [{ reviewId: "review_public_1", attribution: "Anonymous" }],
      },
      {
        surface: "error",
        value: { code: "unavailable", message: "This item is unavailable." },
      },
    ];

    for (const fixture of safeSurfaces) {
      expect(
        findProjectionLeaks(fixture.value, policy),
        fixture.surface,
      ).toEqual([]);
    }
  });

  it("reports forbidden fields and stable restricted identifiers at any depth", () => {
    const leaks = findProjectionLeaks(
      {
        response: { reviewId: "review_public_1", accountId: "acct_01K2SECRET" },
        metadata: { description: "anonymous-linkage-44" },
        logs: [{ moderationEvidence: "raw screenshot" }],
      },
      policy,
    );

    expect(leaks).toEqual([
      {
        kind: "forbidden-key",
        path: "$.response.accountId",
        value: "accountId",
      },
      {
        kind: "forbidden-value",
        path: "$.response.accountId",
        value: "acct_01K2SECRET",
      },
      {
        kind: "forbidden-value",
        path: "$.metadata.description",
        value: "anonymous-linkage-44",
      },
      {
        kind: "forbidden-key",
        path: "$.logs[0].moderationEvidence",
        value: "moderationEvidence",
      },
    ]);
  });

  it("supports indistinguishable generic errors without hidden-state fields", () => {
    const hiddenOutcomes = ["blocked", "deleted", "unauthorized"];
    const publicErrors = hiddenOutcomes.map(() => ({
      code: "unavailable",
      message: "This item is unavailable.",
    }));

    expect(
      new Set(publicErrors.map((error) => JSON.stringify(error))).size,
    ).toBe(1);
    expect(findProjectionLeaks(publicErrors, policy)).toEqual([]);
  });
});
