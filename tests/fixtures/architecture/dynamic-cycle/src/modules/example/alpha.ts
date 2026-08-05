export async function alpha(): Promise<string> {
  const { beta } = await import("./beta");
  return beta();
}
