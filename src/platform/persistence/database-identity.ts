import "server-only";

const disposableHosts = new Set(["127.0.0.1", "localhost", "::1"]);

export type AppEnvironment = "local" | "test" | "preview" | "production";

interface DatabaseIdentity {
  readonly database: string;
  readonly hasConnectionOverrides: boolean;
  readonly host: string;
  readonly username: string;
}

function readIdentity(databaseUrl: string): DatabaseIdentity {
  let parsed: URL;

  try {
    parsed = new URL(databaseUrl);
  } catch {
    throw new Error("Database URL is invalid");
  }

  if (parsed.protocol !== "postgres:" && parsed.protocol !== "postgresql:") {
    throw new Error("Database URL must use the Postgres protocol");
  }

  return {
    database: decodeURIComponent(parsed.pathname.slice(1)),
    hasConnectionOverrides: parsed.search !== "",
    host: parsed.hostname,
    username: decodeURIComponent(parsed.username),
  };
}

export function assertDisposableDatabaseUrl(
  databaseUrl: string,
  appEnvironment: AppEnvironment,
): DatabaseIdentity {
  const identity = readIdentity(databaseUrl);
  const disposable =
    appEnvironment !== "production" &&
    !identity.hasConnectionOverrides &&
    disposableHosts.has(identity.host) &&
    identity.database.endsWith("_test") &&
    identity.username.endsWith("_test");

  if (!disposable) {
    throw new Error("Disposable database guard rejected the database identity");
  }

  return identity;
}

export function assertApplicationDatabaseIdentity(
  databaseUrl: string,
  appEnvironment: AppEnvironment,
): DatabaseIdentity {
  const identity = readIdentity(databaseUrl);

  if (identity.hasConnectionOverrides) {
    throw new Error(
      appEnvironment === "production"
        ? "Production database guard rejected the database identity"
        : "Non-production database guard rejected the database identity",
    );
  }

  if (
    (appEnvironment === "local" || appEnvironment === "test") &&
    (!disposableHosts.has(identity.host) ||
      !identity.database.endsWith("_test") ||
      !identity.username.endsWith("_test"))
  ) {
    throw new Error(
      "Non-production database guard rejected the database identity",
    );
  }

  if (
    appEnvironment === "production" &&
    (disposableHosts.has(identity.host) ||
      identity.database.endsWith("_test") ||
      identity.username.endsWith("_test"))
  ) {
    throw new Error("Production database guard rejected the database identity");
  }

  return identity;
}
