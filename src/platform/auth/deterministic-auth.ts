import "server-only";

import {
  authenticateProtectedIntent,
  completeAuthentication,
  type AuthenticationProvider,
  type AuthenticationResult,
  type ProtectedIntent,
  type ProviderAvailability,
} from "../../modules/identity-safety/server";

interface DeterministicMethod {
  readonly availability: ProviderAvailability;
  readonly validProof: string;
}

type AuthenticationConfiguration = Partial<
  Readonly<Record<AuthenticationProvider, DeterministicMethod>>
>;

export function createDeterministicAuthenticationAdapter(
  configuration: AuthenticationConfiguration,
): {
  authenticate(input: {
    readonly provider: AuthenticationProvider;
    readonly proof: string;
    readonly intent: ProtectedIntent;
  }): Promise<AuthenticationResult>;
} {
  return {
    authenticate(input): Promise<AuthenticationResult> {
      return authenticateProtectedIntent(input, (protectedInput) => {
        const method = configuration[protectedInput.provider];
        const availability = method?.availability ?? "disabled";
        return Promise.resolve(
          completeAuthentication(
            {
              provider: protectedInput.provider,
              availability,
              intent: protectedInput.intent,
            },
            {
              valid:
                availability === "available" &&
                protectedInput.proof === method?.validProof,
              ...(availability === "available" &&
              protectedInput.proof === method?.validProof
                ? {
                    providerSubject: `${protectedInput.provider}:deterministic-subject`,
                  }
                : {}),
            },
          ),
        );
      });
    },
  };
}
