import { expect, test } from "@playwright/test";

test("landing and Cooked Quiz preserve the approved Caseboard experience", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      name: "Some startups need a pivot. Some need an exorcism.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Visit the Town Board" }),
  ).toHaveAttribute("href", "/board");
  if (process.platform === "darwin") {
    await expect(page.locator("body")).toHaveScreenshot(
      "acquisition-home.png",
      { animations: "disabled" },
    );
  }

  await page.getByRole("button", { name: "Begin emotional paperwork" }).click();
  await page.getByLabel("Weaponized ‘Quick Sync’").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page
    .locator("[data-avatar-input]")
    .setInputFiles("public/assets/images/share-card.png");
  await page.getByLabel("My cofounder…").fill("called a six a.m. meeting");
  await page
    .getByLabel("When asked about it, they said…")
    .fill("we move at the speed of trust");
  await page
    .getByLabel("Sane adults might call this…")
    .fill("calendar warfare");
  await expect(
    page.getByRole("article", { name: "Live case file preview" }),
  ).toContainText("calendar warfare");
  await expect(
    page.locator("[data-case-preview] [data-report-subject]"),
  ).toBeVisible();
  await page.getByRole("button", { name: "Generate case file ↗" }).click();

  const caseFile = page.getByRole("article", {
    name: "Generated cofounder incident report",
  });
  await expect(caseFile).toContainText("Weaponized ‘Quick Sync’");
  await expect(caseFile).toContainText("calendar warfare");
  await expect(caseFile.locator("[data-report-subject]")).toBeVisible();
  if (process.platform === "darwin") {
    await expect(caseFile).toHaveScreenshot("acquisition-case-file.png", {
      animations: "disabled",
    });
  }
});

test.describe("mobile acquisition journey", () => {
  test.use({
    hasTouch: true,
    isMobile: true,
    viewport: { height: 844, width: 390 },
  });

  test("completes the Cooked Quiz without horizontal overflow", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.locator("body")).toHaveJSProperty(
      "scrollWidth",
      await page.locator("body").evaluate((body) => body.clientWidth),
    );
    await page.getByRole("button", { name: "Begin emotional paperwork" }).tap();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("Weaponized ‘Quick Sync’").check();
    await page.getByRole("button", { name: "Continue" }).tap();
    await page.getByLabel("My cofounder…").fill("missed the launch review");
    await page
      .getByLabel("When asked about it, they said…")
      .fill("calendars are a social construct");
    await page
      .getByLabel("Sane adults might call this…")
      .fill("calendar warfare");
    await page.getByRole("button", { name: "Generate case file ↗" }).tap();
    await expect(
      page.getByRole("article", {
        name: "Generated cofounder incident report",
      }),
    ).toBeVisible();
  });
});

test("supports keyboard dialog control and reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");

  await page
    .getByRole("button", { name: "Begin emotional paperwork" })
    .press("Enter");
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  const animationDuration = await dialog.evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).animationDuration),
  );
  expect(animationDuration).toBeLessThanOrEqual(0.001);
  await expect(
    page.getByRole("button", { name: "Close report" }),
  ).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
