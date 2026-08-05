import { describe, expect, it } from "vitest";

import { assertMigrationManifest } from "@/src/platform/persistence/migration-manifest";

describe("migration manifest", () => {
  it("accepts an ordered unique forward-migration sequence", () => {
    expect(
      assertMigrationManifest([
        "0000000000001_create_fixture.mjs",
        "0000000000002_upgrade_fixture.mjs",
      ]),
    ).toEqual([
      "0000000000001_create_fixture.mjs",
      "0000000000002_upgrade_fixture.mjs",
    ]);
  });

  it("rejects timestamp collisions", () => {
    expect(() =>
      assertMigrationManifest([
        "0000000000001_create_fixture.mjs",
        "0000000000001_colliding_fixture.mjs",
      ]),
    ).toThrow("Migration order collision: 0000000000001");
  });

  it("rejects invalid and out-of-order names", () => {
    expect(() => assertMigrationManifest(["fixture.mjs"])).toThrow(
      "Invalid migration filename",
    );
    expect(() =>
      assertMigrationManifest([
        "0000000000002_second.mjs",
        "0000000000001_first.mjs",
      ]),
    ).toThrow("Migration manifest is not ordered");
  });
});
