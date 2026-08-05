export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const { readApplicationConfig } = await import(
    "./src/platform/runtime/application-config"
  );

  readApplicationConfig();
}
