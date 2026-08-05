export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") {
    return;
  }

  const [{ readApplicationConfig }, { installGracefulShutdown }] =
    await Promise.all([
      import("./src/platform/runtime/application-config"),
      import("./src/platform/runtime/graceful-shutdown"),
    ]);

  readApplicationConfig();
  installGracefulShutdown();
}
