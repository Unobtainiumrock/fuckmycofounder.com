interface InstrumentationModule {
  readonly default: { register(): Promise<void> };
}

function isInstrumentationModule(
  value: unknown,
): value is InstrumentationModule {
  if (!value || typeof value !== "object" || !("default" in value)) {
    return false;
  }

  const entry = value.default;
  if (!entry || typeof entry !== "object" || !("register" in entry)) {
    return false;
  }

  return typeof entry.register === "function";
}

const instrumentationPath = "./.next/server/instrumentation.js";
const loaded: unknown = await import(instrumentationPath);

if (!isInstrumentationModule(loaded)) {
  throw new Error("Standalone startup instrumentation is unavailable");
}

await loaded.default.register();
const serverPath = "./server.js";
await import(serverPath);
