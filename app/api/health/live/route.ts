import { readOperationalConfig } from "@/src/platform/runtime/operational-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export function GET(): Response {
  const { buildId } = readOperationalConfig();

  return Response.json(
    { status: "alive" },
    {
      headers: {
        "Cache-Control": "no-store",
        "X-Build-Id": buildId,
      },
    },
  );
}
