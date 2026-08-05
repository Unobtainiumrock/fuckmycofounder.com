import { describe, expect, it } from "vitest";

import { readDatabaseSettings } from "@/src/platform/persistence/database-config";

describe("database configuration", () => {
  it("does not invent a database URL when the dependency is optional", () => {
    expect(
      readDatabaseSettings({ APP_ENV: "local", REQUIRE_DATABASE: "false" }),
    ).toEqual({
      appEnvironment: "local",
      databaseUrl: undefined,
      required: false,
    });
  });

  it("requires an explicit URL when the dependency is required", () => {
    expect(() =>
      readDatabaseSettings({ APP_ENV: "preview", REQUIRE_DATABASE: "true" }),
    ).toThrow("Database configuration is invalid");
  });

  it("rejects a disposable database identity in production", () => {
    expect(() =>
      readDatabaseSettings({
        APP_ENV: "production",
        DATABASE_URL: "postgres://fmcf_test:secret@localhost:5432/fmcf_test",
        REQUIRE_DATABASE: "true",
      }),
    ).toThrow("Production database guard rejected the database identity");
  });

  it("does not leak credentials through parse failures", () => {
    const secret = "this-must-stay-secret";

    let failure: unknown;
    try {
      readDatabaseSettings({
        APP_ENV: "preview",
        DATABASE_URL: `not-a-url-${secret}`,
        REQUIRE_DATABASE: "true",
      });
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(Error);
    expect(failure instanceof Error ? failure.message : "").not.toContain(
      secret,
    );
  });
});
