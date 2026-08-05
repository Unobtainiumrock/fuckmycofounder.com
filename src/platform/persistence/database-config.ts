import {
  assertApplicationDatabaseIdentity,
  type AppEnvironment,
} from "./database-identity";

const environments = new Set<AppEnvironment>([
  "local",
  "test",
  "preview",
  "production",
]);

export interface DatabaseSettings {
  readonly appEnvironment: AppEnvironment;
  readonly databaseUrl: string | undefined;
  readonly required: boolean;
}

export function readDatabaseSettings(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): DatabaseSettings {
  const appEnvironment = environment.APP_ENV ?? "local";
  const required = environment.REQUIRE_DATABASE === "true";
  const databaseUrl = environment.DATABASE_URL;

  if (!environments.has(appEnvironment as AppEnvironment)) {
    throw new Error("Database configuration is invalid");
  }

  if (required && !databaseUrl) {
    throw new Error("Database configuration is invalid");
  }

  if (databaseUrl) {
    try {
      assertApplicationDatabaseIdentity(
        databaseUrl,
        appEnvironment as AppEnvironment,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        error.message ===
          "Production database guard rejected the database identity"
      ) {
        throw error;
      }

      throw new Error("Database configuration is invalid");
    }
  }

  return {
    appEnvironment: appEnvironment as AppEnvironment,
    databaseUrl,
    required,
  };
}
