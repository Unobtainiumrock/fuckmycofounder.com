import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

export const standaloneRoot = path.resolve(".next/standalone");
export const standaloneServer = path.join(
  standaloneRoot,
  "start-standalone.mts",
);

export async function prepareStandalone(): Promise<void> {
  await mkdir(path.join(standaloneRoot, ".next"), { recursive: true });
  await Promise.all([
    cp("public", path.join(standaloneRoot, "public"), { recursive: true }),
    cp(".next/static", path.join(standaloneRoot, ".next/static"), {
      recursive: true,
    }),
    cp(
      "scripts/runtime/start-standalone.mts",
      path.join(standaloneRoot, "start-standalone.mts"),
    ),
  ]);
}
