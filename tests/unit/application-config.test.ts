import { describe, expect, it } from "vitest";

import { readApplicationConfig } from "@/src/platform/runtime/application-config";
import { projectPublicBuildConfig } from "@/src/shared/public-build-config";

describe("application configuration", () => {
  it("provides explicit safe local defaults", () => {
    expect(readApplicationConfig({ NODE_ENV: "development" })).toEqual({
      appEnvironment: "local",
      buildId: "development",
      databaseRequired: false,
    });
  });

  it("initializes the process configuration once", () => {
    expect(readApplicationConfig()).toBe(readApplicationConfig());
  });

  it("requires immutable identity and the database in production", () => {
    expect(() =>
      readApplicationConfig({
        APP_ENV: "production",
        NODE_ENV: "production",
      }),
    ).toThrow("Application configuration is invalid");
  });

  it("rejects malformed cross-environment values without echoing them", () => {
    const secret = "secret-value-that-must-not-echo";

    let failure: unknown;
    try {
      readApplicationConfig({
        APP_ENV: `production-${secret}`,
        BUILD_ID: "preview-build",
        NODE_ENV: "production",
      });
    } catch (error) {
      failure = error;
    }

    expect(failure).toBeInstanceOf(Error);
    expect(failure instanceof Error ? failure.message : "").not.toContain(
      secret,
    );
  });

  it("projects only allowlisted public build fields", () => {
    const application = readApplicationConfig({
      APP_ENV: "preview",
      BUILD_ID: "preview-abc",
      DATABASE_URL: "postgres://private:password@db.example.com:5432/app",
      NODE_ENV: "production",
      REQUIRE_DATABASE: "true",
    });

    expect(projectPublicBuildConfig(application)).toEqual({
      appEnvironment: "preview",
      buildId: "preview-abc",
    });
    expect(JSON.stringify(projectPublicBuildConfig(application))).not.toContain(
      "password",
    );
  });
});
