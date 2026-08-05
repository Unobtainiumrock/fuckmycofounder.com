import "server-only";

import type { EventEmitter } from "node:events";

import { closeDatabase } from "../persistence/postgres";
import { beginShutdown } from "./shutdown-state";

let installed = false;

export function installGracefulShutdown(
  close: () => Promise<void> = closeDatabase,
  signals: Pick<EventEmitter, "once"> = process,
): void {
  if (installed) {
    return;
  }

  installed = true;
  const shutdown = () => {
    if (!beginShutdown()) {
      return;
    }

    void close().catch(() => undefined);
  };

  signals.once("SIGINT", shutdown);
  signals.once("SIGTERM", shutdown);
}

export function resetGracefulShutdownForTests(): void {
  installed = false;
}
