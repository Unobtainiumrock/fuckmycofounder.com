interface PublicBuildConfig {
  readonly appEnvironment: "local" | "test" | "preview" | "production";
  readonly buildId: string;
}

export function projectPublicBuildConfig(application: {
  readonly appEnvironment: PublicBuildConfig["appEnvironment"];
  readonly buildId: string;
}): PublicBuildConfig {
  return {
    appEnvironment: application.appEnvironment,
    buildId: application.buildId,
  };
}
