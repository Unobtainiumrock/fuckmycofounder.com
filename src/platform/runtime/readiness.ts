import "server-only";

import { readDatabaseSettings } from "../persistence/database-config";
import { probeDatabase } from "../persistence/postgres";
import { readOperationalConfig } from "./operational-config";

export async function isApplicationReady(): Promise<boolean> {
  const { databaseRequired } = readOperationalConfig();

  if (!databaseRequired) {
    return true;
  }

  try {
    return await probeDatabase(readDatabaseSettings());
  } catch {
    return false;
  }
}
