import { cp, mkdir } from "node:fs/promises";
import path from "node:path";

export const standaloneRoot = path.resolve(".next/standalone");
export const standaloneServer = path.join(standaloneRoot, "server.js");

export async function prepareStandalone(): Promise<void> {
  await mkdir(path.join(standaloneRoot, ".next"), { recursive: true });
  await Promise.all([
    cp("public", path.join(standaloneRoot, "public"), { recursive: true }),
    cp(".next/static", path.join(standaloneRoot, ".next/static"), {
      recursive: true,
    }),
  ]);
}
