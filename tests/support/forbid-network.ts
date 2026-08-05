import { vi } from "vitest";

if (process.env.ALLOW_TEST_NETWORK !== "true") {
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
