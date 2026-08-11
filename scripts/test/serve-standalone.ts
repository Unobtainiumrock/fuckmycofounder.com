import { spawn } from "node:child_process";

import {
  prepareStandalone,
  standaloneRoot,
  standaloneServer,
} from "./standalone.ts";

await prepareStandalone();

const server = spawn(process.execPath, [standaloneServer], {
  cwd: standaloneRoot,
  env: {
    ...process.env,
    HOSTNAME: process.env.HOSTNAME ?? "127.0.0.1",
    PORT: process.env.PORT ?? "4317",
  },
  stdio: "inherit",
});

for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => server.kill(signal));
}

process.exitCode = await new Promise<number | null>((resolve) =>
  server.once("exit", resolve),
);
