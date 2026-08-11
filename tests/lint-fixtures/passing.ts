async function completedWork(): Promise<void> {}

export async function runCompletedWork(): Promise<void> {
  await completedWork();
}
