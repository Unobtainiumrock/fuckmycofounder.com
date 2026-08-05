let shuttingDown = false;

export function beginShutdown(): boolean {
  if (shuttingDown) {
    return false;
  }

  shuttingDown = true;
  return true;
}

export function isShuttingDown(): boolean {
  return shuttingDown;
}

export function resetShutdownStateForTests(): void {
  shuttingDown = false;
}
