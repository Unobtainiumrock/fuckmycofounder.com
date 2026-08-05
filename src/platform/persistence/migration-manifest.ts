import "server-only";

const migrationName = /^(?<order>\d{13})_[a-z0-9][a-z0-9_-]*\.mjs$/u;

export function assertMigrationManifest(
  filenames: readonly string[],
): readonly string[] {
  const orders = new Set<string>();
  const sorted = [...filenames].sort((left, right) =>
    left.localeCompare(right),
  );

  for (const filename of filenames) {
    const order = migrationName.exec(filename)?.groups?.order;

    if (!order) {
      throw new Error(`Invalid migration filename: ${filename}`);
    }

    if (orders.has(order)) {
      throw new Error(`Migration order collision: ${order}`);
    }

    orders.add(order);
  }

  if (filenames.some((filename, index) => filename !== sorted[index])) {
    throw new Error("Migration manifest is not ordered");
  }

  return filenames;
}
