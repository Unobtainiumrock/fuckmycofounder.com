import { readApplicationConfig } from "./application-config";

interface OperationalConfig {
  readonly appEnvironment: "local" | "test" | "preview" | "production";
  readonly buildId: string;
  readonly databaseRequired: boolean;
}

export function readOperationalConfig(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): OperationalConfig {
  const application = readApplicationConfig(environment);

  return {
    appEnvironment: application.appEnvironment,
    buildId: application.buildId,
    databaseRequired: application.databaseRequired,
  };
}
