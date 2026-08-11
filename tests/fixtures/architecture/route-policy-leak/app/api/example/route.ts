import { decideInternally } from "../../../src/modules/example/internal-policy";

export function POST(): Response {
  return Response.json(decideInternally());
}
