import { queryDirectly } from "../../../src/platform/persistence/database";

export function POST(): Response {
  return Response.json(queryDirectly());
}
