import { EventEmitter } from "node:events";

import { afterEach, describe, expect, it, vi } from "vitest";

import {
  installGracefulShutdown,
  resetGracefulShutdownForTests,
} from "@/src/platform/runtime/graceful-shutdown";
import {
  isShuttingDown,
  resetShutdownStateForTests,
} from "@/src/platform/runtime/shutdown-state";

afterEach(() => {
  resetGracefulShutdownForTests();
  resetShutdownStateForTests();
});

describe("graceful shutdown coordination", () => {
  it("marks readiness draining before closing dependencies once", () => {
    const signals = new EventEmitter();
    const close = vi.fn().mockResolvedValue(undefined);
    installGracefulShutdown(close, signals);

    signals.emit("SIGTERM");
    signals.emit("SIGINT");

    expect(isShuttingDown()).toBe(true);
    expect(close).toHaveBeenCalledOnce();
  });
});
