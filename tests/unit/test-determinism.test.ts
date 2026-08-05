import { afterEach, describe, expect, it, vi } from "vitest";

describe("deterministic test runtime", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("provides fake clocks for time-dependent behavior", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-08-05T20:00:00.000Z"));

    expect(new Date().toISOString()).toBe("2026-08-05T20:00:00.000Z");
  });

  it("denies accidental live fetches", async () => {
    await expect(fetch("https://example.com/private-provider")).rejects.toThrow(
      "Live network access is forbidden",
    );
  });
});
