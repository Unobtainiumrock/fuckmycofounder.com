import { beforeEach, describe, expect, it, vi } from "vitest";

const { renderCardBlob } = vi.hoisted(() => ({
  renderCardBlob: vi.fn(() => Promise.resolve(new Blob(["card"]))),
}));

vi.mock("@/app/_client/render-card", () => ({ renderCardBlob }));

import { downloadReportCard } from "@/app/_client/share-report";

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

describe("report card sharing", () => {
  beforeEach(() => {
    vi.stubGlobal("document", {
      createElement: vi.fn(() => ({ click: vi.fn() })),
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:card"),
      revokeObjectURL: vi.fn(),
    });
    vi.stubGlobal("window", { setTimeout: vi.fn() });
  });

  it("passes the local mugshot into the downloaded card", async () => {
    await downloadReportCard(report, "blob:subject");

    expect(renderCardBlob).toHaveBeenCalledWith(report, "blob:subject");
  });
});
