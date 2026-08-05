import "server-only";

import { z } from "zod";

const buildIdPattern = /^[A-Za-z0-9._-]+$/u;

const environmentSchema = z.object({
  APP_ENV: z.enum(["local", "test", "preview", "production"]).optional(),
  BUILD_ID: z.string().min(1).max(128).regex(buildIdPattern).optional(),
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  REQUIRE_DATABASE: z.enum(["true", "false"]).optional(),
});

interface ApplicationConfig {
  readonly appEnvironment: "local" | "test" | "preview" | "production";
  readonly buildId: string;
  readonly databaseRequired: boolean;
  readonly databaseUrl?: string;
}

interface PublicBuildConfig {
  readonly appEnvironment: ApplicationConfig["appEnvironment"];
  readonly buildId: string;
}

export function readApplicationConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ApplicationConfig {
  const parsed = environmentSchema.safeParse(environment);

  if (!parsed.success) {
    throw new Error("Application configuration is invalid");
  }

  const appEnvironment = parsed.data.APP_ENV ?? "local";
  const buildId = parsed.data.BUILD_ID ?? "development";
  const databaseRequired = parsed.data.REQUIRE_DATABASE === "true";

  if (
    appEnvironment === "production" &&
    (parsed.data.NODE_ENV !== "production" ||
      !parsed.data.BUILD_ID ||
      !databaseRequired ||
      !parsed.data.DATABASE_URL)
  ) {
    throw new Error("Application configuration is invalid");
  }

  return {
    appEnvironment,
    buildId,
    databaseRequired,
    ...(parsed.data.DATABASE_URL
      ? { databaseUrl: parsed.data.DATABASE_URL }
      : {}),
  };
}

export function projectPublicBuildConfig(
  application: ApplicationConfig,
): PublicBuildConfig {
  return {
    appEnvironment: application.appEnvironment,
    buildId: application.buildId,
  };
}
