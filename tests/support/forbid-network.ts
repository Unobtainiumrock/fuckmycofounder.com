import { Socket } from "node:net";

import { vi } from "vitest";

if (process.env.ALLOW_TEST_NETWORK !== "true") {
  const denySocketConnect = function denySocketConnect(this: Socket): never {
    throw new Error(
      "Live network access is forbidden in deterministic Vitest suites",
    );
  };

  Object.defineProperty(Socket.prototype, "connect", {
    configurable: true,
    value: denySocketConnect,
    writable: true,
  });
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.reject(
        new Error(
          "Live network access is forbidden in deterministic Vitest suites",
        ),
      ),
    ),
  );
}
