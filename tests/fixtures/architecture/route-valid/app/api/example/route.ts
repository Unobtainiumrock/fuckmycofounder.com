import { executeExample } from "../../../src/modules/example/index";

export function POST(): Response {
  return Response.json(executeExample());
}
