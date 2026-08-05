import { projectPublicBuildConfig } from "../../src/shared/public-build-config";

export const publicConfig = projectPublicBuildConfig({
  appEnvironment: "local",
  buildId: "fixture",
});
