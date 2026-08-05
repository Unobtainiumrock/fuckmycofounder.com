import { spawn, type ChildProcess } from "node:child_process";
import path from "node:path";

import {
  prepareStandalone,
  standaloneRoot,
  standaloneServer,
} from "./standalone.ts";

const vitestBinary = path.resolve("node_modules/vitest/vitest.mjs");

interface Scenario {
  readonly environment: Readonly<Record<string, string>>;
  readonly expectedReadyStatus: 200 | 503;
  readonly port: number;
}

async function waitForServer(
  baseUrl: string,
  process: ChildProcess,
): Promise<void> {
  const deadline = Date.now() + 15_000;

  while (Date.now() < deadline) {
    if (process.exitCode !== null) {
      throw new Error(`Production server exited with ${process.exitCode}`);
    }

    try {
      const response = await fetch(new URL("/api/health/live", baseUrl));
      if (response.ok) return;
    } catch {
      // The socket is expected to refuse connections until Next is ready.
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  throw new Error("Production server did not become ready in time");
}

async function stopServer(process: ChildProcess): Promise<void> {
  if (process.exitCode !== null) return;

  process.kill("SIGTERM");
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => {
      process.kill("SIGKILL");
      reject(new Error("Production server did not stop after SIGTERM"));
    }, 10_000);

    process.once("exit", () => {
      clearTimeout(timeout);
      resolve();
    });
  });
}

async function assertInvalidStartupRejected(): Promise<void> {
  const server = spawn(process.execPath, [standaloneServer], {
    cwd: standaloneRoot,
    env: {
      ...process.env,
      APP_ENV: "production",
      HOSTNAME: "127.0.0.1",
      PORT: "4334",
      REQUIRE_DATABASE: "false",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let output = "";
  server.stdout?.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });
  server.stderr?.on("data", (chunk: Buffer) => {
    output += chunk.toString();
  });

  const exitCode = await Promise.race([
    new Promise<number | null>((resolve) => server.once("exit", resolve)),
    new Promise<"timeout">((resolve) =>
      setTimeout(() => resolve("timeout"), 10_000),
    ),
  ]);

  if (exitCode === "timeout") {
    await stopServer(server);
    throw new Error("Invalid production configuration did not fail startup");
  }
  if (
    exitCode === 0 ||
    !output.includes("Application configuration is invalid")
  ) {
    throw new Error("Invalid production configuration failed unsafely");
  }
}

async function runScenario(scenario: Scenario): Promise<void> {
  const baseUrl = `http://127.0.0.1:${scenario.port}`;
  const server = spawn(process.execPath, [standaloneServer], {
    cwd: standaloneRoot,
    env: {
      ...process.env,
      APP_ENV: "test",
      BUILD_ID: `http-test-${scenario.expectedReadyStatus}`,
      HOSTNAME: "127.0.0.1",
      PORT: String(scenario.port),
      ...scenario.environment,
    },
    stdio: "inherit",
  });

  try {
    await waitForServer(baseUrl, server);
    const tests = spawn(
      process.execPath,
      [
        vitestBinary,
        "run",
        "tests/integration/health.test.ts",
        "tests/integration/ssr-document.test.ts",
      ],
      {
        env: {
          ...process.env,
          ALLOW_TEST_NETWORK: "true",
          EXPECT_READY_STATUS: String(scenario.expectedReadyStatus),
          TEST_BASE_URL: baseUrl,
        },
        stdio: "inherit",
      },
    );
    const exitCode = await new Promise<number | null>((resolve) =>
      tests.once("exit", resolve),
    );

    if (exitCode !== 0) {
      throw new Error(`Production HTTP tests failed with ${exitCode}`);
    }
  } finally {
    await stopServer(server);
  }
}

await prepareStandalone();
await assertInvalidStartupRejected();
await runScenario({
  environment: { REQUIRE_DATABASE: "false" },
  expectedReadyStatus: 200,
  port: 4332,
});
await runScenario({
  environment: {
    DATABASE_URL:
      "postgres://unavailable_test:unavailable@127.0.0.1:1/unavailable_test",
    REQUIRE_DATABASE: "true",
  },
  expectedReadyStatus: 503,
  port: 4333,
});
