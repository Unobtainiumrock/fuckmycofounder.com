import { describe, expect, it } from "vitest";

import {
  assertApplicationDatabaseIdentity,
  assertDisposableDatabaseUrl,
} from "@/src/platform/persistence/database-identity";

describe("database identity guards", () => {
  it("accepts an explicit local disposable test database", () => {
    expect(
      assertDisposableDatabaseUrl(
        "postgres://fmcf_test:secret@127.0.0.1:55432/fmcf_test",
        "test",
      ).database,
    ).toBe("fmcf_test");
  });

  it.each([
    ["postgres://postgres:secret@127.0.0.1:5432/postgres", "test"],
    ["postgres://fmcf_test:secret@db.example.com:5432/fmcf_test", "test"],
    ["postgres://fmcf_test:secret@127.0.0.1:5432/fmcf_test", "production"],
  ] as const)(
    "rejects a non-disposable identity",
    (databaseUrl, appEnvironment) => {
      expect(() =>
        assertDisposableDatabaseUrl(databaseUrl, appEnvironment),
      ).toThrow("Disposable database guard rejected the database identity");
    },
  );

  it("rejects test database identities in production configuration", () => {
    expect(() =>
      assertApplicationDatabaseIdentity(
        "postgres://fmcf_test:secret@db.example.com:5432/fmcf_test",
        "production",
      ),
    ).toThrow("Production database guard rejected the database identity");
  });

  it("never includes credentials in a guard failure", () => {
    const secret = "super-secret-password";

    let failure: unknown;
    try {
      assertDisposableDatabaseUrl(
        `postgres://fmcf_test:${secret}@db.example.com:5432/fmcf_test`,
        "test",
      );
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(Error);
    expect(failure instanceof Error ? failure.message : "").not.toContain(
      secret,
    );
  });
});
