import { describe, expect, it, vi } from "vitest";

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

  it("inspects non-enumerable Error messages and causes", () => {
    const error = new Error("Public operation failed", {
      cause: new Error("driver leaked acct_01K2SECRET"),
    });

    expect(findProjectionLeaks(error, policy)).toContainEqual({
      kind: "forbidden-value",
      path: "$.cause.message",
      value: "acct_01K2SECRET",
    });
  });

  it("inspects enumerable accessor values that JSON serialization exposes", () => {
    const getter = vi.fn(() => "anonymous-linkage-44");
    const value = Object.defineProperty({}, "description", {
      enumerable: true,
      get: getter,
    });

    expect(findProjectionLeaks(value, policy)).toContainEqual({
      kind: "forbidden-value",
      path: "$.description",
      value: "anonymous-linkage-44",
    });
    expect(getter).toHaveBeenCalledOnce();
    expect(JSON.stringify(value)).toContain("anonymous-linkage-44");
  });

  it("does not invoke non-enumerable accessors that serialization omits", () => {
    const getter = vi.fn(() => "acct_01K2SECRET");
    const value = Object.defineProperty({}, "description", { get: getter });

    expect(findProjectionLeaks(value, policy)).toEqual([]);
    expect(getter).not.toHaveBeenCalled();
  });
});
