import "server-only";

import { z } from "zod";

import { assertApplicationDatabaseIdentity } from "../persistence/database-identity";
import { artifactBuildId } from "./artifact-build-id";

const buildIdPattern = /^[A-Za-z0-9._-]+$/u;

const environmentSchema = z.object({
  APP_ENV: z.enum(["local", "test", "preview", "production"]).optional(),
  BUILD_ID: z.string().min(1).max(128).regex(buildIdPattern).optional(),
  DATABASE_URL: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  REQUIRE_DATABASE: z.enum(["true", "false"]).optional(),
});
type EnvironmentConfig = z.infer<typeof environmentSchema>;

interface ApplicationConfig {
  readonly appEnvironment: "local" | "test" | "preview" | "production";
  readonly buildId: string;
  readonly databaseRequired: boolean;
  readonly databaseUrl?: string;
}

let processApplicationConfig: ApplicationConfig | undefined;

function parseEnvironment(
  environment: Readonly<Record<string, string | undefined>>,
): EnvironmentConfig {
  const parsed = environmentSchema.safeParse(environment);

  if (!parsed.success) {
    throw new Error("Application configuration is invalid");
  }

  return parsed.data;
}

function assertRequiredConfiguration(
  environment: EnvironmentConfig,
  appEnvironment: ApplicationConfig["appEnvironment"],
  buildId: string,
  databaseRequired: boolean,
): void {
  const invalidProduction =
    appEnvironment === "production" &&
    (environment.NODE_ENV !== "production" ||
      buildId === "local" ||
      buildId === "development" ||
      !databaseRequired ||
      !environment.DATABASE_URL);

  if (invalidProduction || (databaseRequired && !environment.DATABASE_URL)) {
    throw new Error("Application configuration is invalid");
  }
}

function assertDatabaseConfiguration(
  databaseUrl: string | undefined,
  appEnvironment: ApplicationConfig["appEnvironment"],
): void {
  if (!databaseUrl) {
    return;
  }

  try {
    assertApplicationDatabaseIdentity(databaseUrl, appEnvironment);
  } catch (error) {
    if (
      error instanceof Error &&
      error.message ===
        "Production database guard rejected the database identity"
    ) {
      throw error;
    }

    throw new Error("Application configuration is invalid");
  }
}

export function readApplicationConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): ApplicationConfig {
  if (environment === process.env && processApplicationConfig) {
    return processApplicationConfig;
  }

  const processEnvironment = environment === process.env;
  const parsed = parseEnvironment(
    processEnvironment ? { ...environment, BUILD_ID: undefined } : environment,
  );
  const appEnvironment = parsed.APP_ENV ?? "local";
  const buildId = processEnvironment
    ? artifactBuildId
    : (parsed.BUILD_ID ?? "development");
  const databaseRequired = parsed.REQUIRE_DATABASE === "true";

  assertRequiredConfiguration(
    parsed,
    appEnvironment,
    buildId,
    databaseRequired,
  );
  assertDatabaseConfiguration(parsed.DATABASE_URL, appEnvironment);

  const application = {
    appEnvironment,
    buildId,
    databaseRequired,
    ...(parsed.DATABASE_URL ? { databaseUrl: parsed.DATABASE_URL } : {}),
  } satisfies ApplicationConfig;

  if (environment === process.env) {
    processApplicationConfig = application;
  }

  return application;
}
