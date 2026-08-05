import { describe, expect, it } from "vitest";

import { databaseTransactionRunner } from "@/src/platform/persistence/postgres";

describe("Postgres adapter", () => {
  it("revalidates injected settings before creating a pool", () => {
    expect(() =>
      databaseTransactionRunner({
        appEnvironment: "test",
        databaseUrl:
          "postgres://production:secret@db.production.example:5432/application",
        required: true,
      }),
    ).toThrow("Non-production database guard rejected the database identity");
  });
});
