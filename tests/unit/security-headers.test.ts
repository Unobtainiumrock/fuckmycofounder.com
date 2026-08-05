import { describe, expect, it } from "vitest";

import {
  composeContentSecurityPolicy,
  securityHeadersFor,
} from "@/src/platform/http/security-headers";

describe("route-specific security headers", () => {
  it("uses a document policy with no undeclared remote origin", () => {
    const policy = composeContentSecurityPolicy("public-document");

    expect(policy).toMatchInlineSnapshot(
      `"default-src 'self'; base-uri 'self'; connect-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; img-src 'self' data:; object-src 'none'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; upgrade-insecure-requests"`,
    );
    expect(policy).not.toContain("https://");
  });

  it("denies all resource loading for operational JSON", () => {
    expect(composeContentSecurityPolicy("operational-json")).toBe(
      "default-src 'none'; base-uri 'none'; frame-ancestors 'none'",
    );
  });

  it("composes the shared hardening headers", () => {
    expect(securityHeadersFor("operational-json")).toEqual(
      expect.arrayContaining([
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ]),
    );
  });
});
