import { describe, expect, it } from "vitest";

const baseUrl = process.env.TEST_BASE_URL;
const expectedReadyStatus = Number(process.env.EXPECT_READY_STATUS ?? "200");

describe.runIf(baseUrl)("operational health routes", () => {
  it("keeps liveness independent from dependency readiness", async () => {
    const [live, ready] = await Promise.all([
      fetch(new URL("/api/health/live", baseUrl)),
      fetch(new URL("/api/health/ready", baseUrl)),
    ]);

    expect(live.status).toBe(200);
    expect(await live.json()).toEqual({ status: "alive" });
    expect(live.headers.get("cache-control")).toContain("no-store");
    expect(live.headers.get("x-build-id")).toMatch(/^[A-Za-z0-9._-]+$/u);

    expect(ready.status).toBe(expectedReadyStatus);
    expect(await ready.json()).toEqual({
      status: expectedReadyStatus === 200 ? "ready" : "unavailable",
    });
    expect(ready.headers.get("cache-control")).toContain("no-store");
    expect(ready.headers.get("content-security-policy")).toBe(
      "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
    expect(ready.headers.get("x-content-type-options")).toBe("nosniff");
  });
});
