import "server-only";

import {
  completeAuthentication,
  type AuthenticationProvider,
  type AuthenticationResult,
  type ProtectedIntent,
  type ProviderAvailability,
} from "../../modules/identity-safety";

interface DeterministicMethod {
  readonly availability: ProviderAvailability;
  readonly validProof: string;
}

type AuthenticationConfiguration = Partial<
  Readonly<Record<AuthenticationProvider, DeterministicMethod>>
>;

interface DeterministicAuthenticationAdapter {
  authenticate(input: {
    readonly provider: AuthenticationProvider;
    readonly proof: string;
    readonly intent: ProtectedIntent;
  }): Promise<AuthenticationResult>;
}

export function createDeterministicAuthenticationAdapter(
  configuration: AuthenticationConfiguration,
): DeterministicAuthenticationAdapter {
  return {
    authenticate(input): Promise<AuthenticationResult> {
      const method = configuration[input.provider];
      const availability = method?.availability ?? "disabled";
      return Promise.resolve(
        completeAuthentication(
          { provider: input.provider, availability, intent: input.intent },
          {
            valid:
              availability === "available" &&
              input.proof === method?.validProof,
            ...(availability === "available" &&
            input.proof === method?.validProof
              ? { providerSubject: `${input.provider}:deterministic-subject` }
              : {}),
          },
        ),
      );
    },
  };
}
