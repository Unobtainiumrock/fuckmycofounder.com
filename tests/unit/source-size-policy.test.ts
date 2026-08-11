import { describe, expect, it } from "vitest";

import { evaluateSourceSize } from "@/scripts/quality/source-size-policy";

function lines(count: number, firstLine = "const value = true;"): string {
  return [
    firstLine,
    ...Array.from({ length: count - 1 }, () => "// line"),
  ].join("\n");
}

describe("source-size policy", () => {
  it("accepts the 400-line target boundary", () => {
    expect(evaluateSourceSize(lines(400))).toMatchObject({
      accepted: true,
      lineCount: 400,
    });
  });

  it("requires an inline reason above the target", () => {
    expect(evaluateSourceSize(lines(401)).accepted).toBe(false);
    expect(
      evaluateSourceSize(lines(401, "// source-size: reason=cohesive parser")),
    ).toMatchObject({ accepted: true, reason: "cohesive parser" });
  });

  it("enforces the 600-line hard cap even with a reason", () => {
    expect(
      evaluateSourceSize(lines(601, "// source-size: reason=network adapter")),
    ).toMatchObject({ accepted: false, lineCount: 601 });
  });

  it("does not grant network code a category allowlist", () => {
    expect(evaluateSourceSize(lines(401, "// network adapter")).accepted).toBe(
      false,
    );
  });
});
