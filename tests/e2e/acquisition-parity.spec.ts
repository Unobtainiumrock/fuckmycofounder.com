import { readFile } from "node:fs/promises";

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
  await expect(
    page.getByRole("article", { name: "Live case file preview" }),
  ).toBeHidden();
  await page.getByLabel("My cofounder…").fill("called a six a.m. meeting");
  await expect(
    page.getByRole("article", { name: "Live case file preview" }),
  ).toContainText("called a six a.m. meeting");
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
  await expect(
    page.locator("[data-case-preview] [data-report-avatar]"),
  ).toHaveJSProperty("naturalWidth", 256);
  await page.getByRole("button", { name: "Generate case file ↗" }).click();

  const caseFile = page.getByRole("article", {
    name: "Generated cofounder incident report",
  });
  await expect(caseFile).toContainText("Weaponized ‘Quick Sync’");
  await expect(caseFile).toContainText("calendar warfare");
  await expect(caseFile.locator("[data-report-subject]")).toBeVisible();
  await expect(caseFile.locator("[data-report-avatar]")).toHaveJSProperty(
    "naturalWidth",
    256,
  );
  await caseFile.locator("[data-report-avatar]").evaluate(async (element) => {
    await (element as HTMLImageElement).decode();
    await new Promise<void>((resolve) => requestAnimationFrame(resolve));
  });
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download card" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/incident-report\.png$/u);
  const downloadPath = await download.path();
  if (!downloadPath) throw new Error("Card download has no local path.");
  const downloadedCard = await readFile(downloadPath);
  const decodedCard = await page.evaluate(async (base64) => {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Downloaded card did not decode."));
      image.src = `data:image/png;base64,${base64}`;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Downloaded card canvas is unavailable.");
    context.drawImage(image, 0, 0);
    const pixels = context.getImageData(916, 184, 200, 200).data;
    let hasSelectedRed = false;
    for (let index = 0; index < pixels.length; index += 4) {
      if (
        pixels[index] > 180 &&
        pixels[index + 1] < 100 &&
        pixels[index + 2] < 100
      ) {
        hasSelectedRed = true;
        break;
      }
    }
    return {
      hasSelectedRed,
      height: image.naturalHeight,
      width: image.naturalWidth,
    };
  }, downloadedCard.toString("base64"));
  expect(decodedCard).toEqual({
    hasSelectedRed: true,
    height: 1500,
    width: 1200,
  });
  await expect(
    page.getByText("Sharing creates a private-ish fragment link."),
  ).toBeVisible();
  if (process.platform === "darwin") {
    await expect(caseFile).toHaveScreenshot("acquisition-case-file.png", {
      animations: "disabled",
    });
  }
});

test("rejects malformed mugshots instead of leaving a broken preview", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin emotional paperwork" }).click();
  await page.getByLabel("Weaponized ‘Quick Sync’").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.locator("[data-avatar-input]").setInputFiles({
    buffer: Buffer.from("not an image"),
    mimeType: "image/png",
    name: "broken.png",
  });

  await expect(page.locator("[data-avatar-error]")).toHaveText(
    "That image refused to load.",
  );
  await expect(page.locator("[data-avatar-preview]")).toBeHidden();
});

test("fits maximum Case File text on desktop", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Begin emotional paperwork" }).click();
  await page.getByLabel("Weaponized ‘Quick Sync’").check();
  await page.getByRole("button", { name: "Continue" }).click();
  await fillMaximumCaseFileText(page);
  await page.getByRole("button", { name: "Generate case file ↗" }).click();
  await expectFittedCaseFile(
    page.getByRole("article", {
      name: "Generated cofounder incident report",
    }),
    false,
  );
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
    await fillMaximumCaseFileText(page);
    await page.getByRole("button", { name: "Generate case file ↗" }).tap();
    await expect(
      page.getByRole("article", {
        name: "Generated cofounder incident report",
      }),
    ).toBeVisible();
    await expectFittedCaseFile(
      page.getByRole("article", {
        name: "Generated cofounder incident report",
      }),
      true,
    );
  });
});

async function fillMaximumCaseFileText(
  page: import("@playwright/test").Page,
): Promise<void> {
  await page.getByLabel("My cofounder…").fill("a".repeat(180));
  await page
    .getByLabel("When asked about it, they said…")
    .fill("b".repeat(140));
  await page.getByLabel("Sane adults might call this…").fill("c".repeat(80));
}

async function expectFittedCaseFile(
  caseFile: import("@playwright/test").Locator,
  mustShrink: boolean,
): Promise<void> {
  const selectors = [
    "[data-report-incident]",
    "[data-report-quote]",
    "[data-report-translation]",
  ];
  for (const selector of selectors) {
    const field = caseFile.locator(selector);
    await expect(field).toHaveJSProperty(
      "scrollWidth",
      await field.evaluate((element) => element.clientWidth),
    );
  }
  if (mustShrink) {
    await expect
      .poll(async () =>
        Math.min(
          ...(await Promise.all(
            selectors.map((selector) =>
              caseFile
                .locator(selector)
                .evaluate((element) =>
                  Number.parseFloat(getComputedStyle(element).fontSize),
                ),
            ),
          )),
        ),
      )
      .toBeLessThan(14.4);
  }
}

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
