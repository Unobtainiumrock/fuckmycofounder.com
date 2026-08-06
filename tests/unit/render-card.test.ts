import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderCardBlob } from "@/app/_client/render-card";

const report = {
  id: "FMC-ABC1234",
  chargeId: "quick-sync" as const,
  charge: "Weaponized ‘Quick Sync’",
  severity: "Series B",
  disposition: "Calendar probation",
  incident: "missed the launch review",
  quote: "I was in another meeting",
  translation: "calendar warfare",
};

describe("report card renderer", () => {
  const drawImage = vi.fn();
  const fillText = vi.fn();
  const measureText = vi.fn();

  beforeEach(() => {
    drawImage.mockReset();
    fillText.mockReset();
    measureText.mockReset();
    measureText.mockReturnValue({ width: 1 });
    const context = {
      beginPath: vi.fn(),
      drawImage,
      fillRect: vi.fn(),
      fillText,
      lineTo: vi.fn(),
      measureText,
      moveTo: vi.fn(),
      restore: vi.fn(),
      rotate: vi.fn(),
      save: vi.fn(),
      stroke: vi.fn(),
      translate: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({
        getContext: () => context,
        toBlob: (callback: BlobCallback) => callback(new Blob(["card"])),
      })),
    });
    vi.stubGlobal(
      "Image",
      class {
        naturalHeight = 200;
        naturalWidth = 300;
        onerror: (() => void) | undefined;
        onload: (() => void) | undefined;

        set src(_: string) {
          this.onload?.();
        }
      },
    );
  });

  it("includes the local mugshot in the rendered card", async () => {
    await expect(
      renderCardBlob(report, "blob:subject"),
    ).resolves.toBeInstanceOf(Blob);

    expect(drawImage).toHaveBeenCalledWith(
      expect.anything(),
      50,
      0,
      200,
      200,
      12,
      12,
      200,
      200,
    );
    expect(fillText).toHaveBeenCalledWith("SUBJECT", 112, 240);
  });

  it("keeps the static renderer's fifth statement line", async () => {
    measureText.mockReturnValue({ width: 2000 });

    await renderCardBlob(
      { ...report, incident: "one two three four five six" },
      "blob:subject",
    );

    expect(fillText).toHaveBeenCalledWith("three", 72, expect.any(Number));
  });
});
