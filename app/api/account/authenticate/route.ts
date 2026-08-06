import { NextResponse } from "next/server";
import { z } from "zod";

import {
  authenticateProtectedIntent,
  type AuthenticationProvider,
} from "@/src/modules/identity-safety";
import { createDeterministicAuthenticationAdapter } from "@/src/platform/auth/deterministic-auth";

const requestSchema = z.object({
  provider: z.enum(["google", "apple", "email-link"]),
  proof: z.string().max(4096),
  intent: z.object({
    action: z.string().trim().min(1).max(80),
    draftReference: z.string().trim().max(120).optional(),
    returnPath: z.string().startsWith("/").max(300),
  }),
});

const disabled = createDeterministicAuthenticationAdapter({
  google: disabledMethod(),
  apple: disabledMethod(),
  "email-link": disabledMethod(),
});

export async function POST(request: Request): Promise<NextResponse> {
  const parsed = requestSchema.safeParse(
    await request.json().catch(() => null),
  );
  if (!parsed.success) {
    return NextResponse.json(
      { code: "invalid-request", retryable: false },
      { status: 400 },
    );
  }
  const result = await authenticateProtectedIntent(
    {
      provider: parsed.data.provider,
      proof: parsed.data.proof,
      intent: {
        action: parsed.data.intent.action,
        returnPath: parsed.data.intent.returnPath,
        ...(parsed.data.intent.draftReference
          ? { draftReference: parsed.data.intent.draftReference }
          : {}),
      },
    },
    (input) => disabled.authenticate(input),
  );
  return NextResponse.json(result, { status: 503 });
}

function disabledMethod(): {
  readonly availability: "disabled";
  readonly validProof: string;
  readonly provider?: AuthenticationProvider;
} {
  return { availability: "disabled", validProof: "never" };
}
