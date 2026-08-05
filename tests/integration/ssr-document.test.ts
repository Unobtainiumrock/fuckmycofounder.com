import { describe, expect, it } from "vitest";

const baseUrl = process.env.TEST_BASE_URL;

describe.runIf(baseUrl)("production acquisition document", () => {
  it("renders the complete current experience and canonical metadata in the first response", async () => {
    const response = await fetch(new URL("/", baseUrl), {
      headers: { "User-Agent": "foundation-crawler/1.0" },
    });
    const html = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("x-powered-by")).toBeNull();
    expect(response.headers.get("content-security-policy")).toContain(
      "default-src 'self'",
    );
    expect(response.headers.get("content-security-policy")).not.toContain(
      "https://",
    );
    expect(response.headers.get("x-content-type-options")).toBe("nosniff");
    expect(html).toContain("Some startups need a pivot.");
    expect(html).toContain("Begin emotional paperwork");
    expect(html).toContain("Cofounder Incident Report");
    expect(html).toContain(
      'rel="canonical" href="https://fuckmycofounder.com"',
    );
    expect(html).toContain('property="og:image"');
    expect(html).toContain("/assets/images/share-card.png");
  });

  it("serves the existing client modules and visual assets from stable URLs", async () => {
    const paths = [
      "/assets/js/app.js",
      "/assets/js/modules/dialog.js",
      "/assets/css/tokens.css",
      "/assets/images/share-card.png",
    ];

    const responses = await Promise.all(
      paths.map(async (path) => fetch(new URL(path, baseUrl))),
    );

    for (const response of responses) {
      expect(response.status).toBe(200);
    }
  });
});
