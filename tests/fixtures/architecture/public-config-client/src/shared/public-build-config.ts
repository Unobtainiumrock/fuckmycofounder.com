export function projectPublicBuildConfig(value: {
  readonly appEnvironment: "local";
  readonly buildId: string;
}): typeof value {
  return value;
}
