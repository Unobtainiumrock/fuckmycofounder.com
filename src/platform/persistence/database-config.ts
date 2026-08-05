import "server-only";

import { readApplicationConfig } from "../runtime/application-config";
import { type AppEnvironment } from "./database-identity";

export interface DatabaseSettings {
  readonly appEnvironment: AppEnvironment;
  readonly databaseUrl: string | undefined;
  readonly required: boolean;
}

export function readDatabaseSettings(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): DatabaseSettings {
  const application = readApplicationConfig(environment);

  return {
    appEnvironment: application.appEnvironment,
    databaseUrl: application.databaseUrl,
    required: application.databaseRequired,
  };
}
