import { expect, test } from "@playwright/test";

test("signed-out protected intent reaches the provider-neutral Account boundary", async ({
  page,
}) => {
  const response = await page.goto(
    "/account?intent=file%20a%20report&returnPath=/reports/new",
  );
  expect(response?.headers()["content-security-policy"]).toContain(
    "connect-src 'self' https://fuckmycofounder.com",
  );
  expect(response?.headers()["content-security-policy"]).not.toContain("*");

  await expect(
    page.getByRole("heading", { name: "Continue your filing" }),
  ).toBeVisible();
  await expect(page.getByText("file a report", { exact: true })).toBeVisible();
  await expect(page.getByText("/reports/new", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Google — unavailable" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Apple — unavailable" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Email link — unavailable" }),
  ).toBeDisabled();
  await expect(page.getByRole("status")).toContainText(
    "protected intent is preserved",
  );

  const csp = await page.evaluate(() =>
    document.querySelector("meta[http-equiv='Content-Security-Policy']"),
  );
  expect(csp).toBeNull();

  const unavailable = await page.request.post("/api/account/authenticate", {
    data: {
      provider: "google",
      proof: "provider-proof",
      intent: { action: "file a report", returnPath: "/reports/new" },
    },
  });
  expect(unavailable.status()).toBe(503);
  await expect(unavailable.json()).resolves.toEqual({
    kind: "retry",
    code: "method-disabled",
    intent: { action: "file a report", returnPath: "/reports/new" },
  });
});
