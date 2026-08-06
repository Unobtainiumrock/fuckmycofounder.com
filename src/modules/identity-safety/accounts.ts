import type {
  Account,
  AccountCapability,
  AccountState,
  AuthenticationMethod,
  AuthenticationProvider,
  ProtectedIntent,
  ProviderAvailability,
} from "./model";

interface AuthenticationAttempt {
  readonly provider: AuthenticationProvider;
  readonly availability: ProviderAvailability;
  readonly intent: ProtectedIntent;
}

export type AuthenticationResult =
  | {
      readonly kind: "authenticated";
      readonly intent: ProtectedIntent;
      readonly providerSubject: string;
    }
  | {
      readonly kind: "retry";
      readonly intent: ProtectedIntent;
      readonly code:
        | "method-disabled"
        | "method-unavailable"
        | "invalid-or-expired";
    };

export function completeAuthentication(
  attempt: AuthenticationAttempt,
  proof: { readonly valid: boolean; readonly providerSubject?: string },
): AuthenticationResult {
  if (attempt.availability === "disabled") {
    return { kind: "retry", intent: attempt.intent, code: "method-disabled" };
  }
  if (attempt.availability === "unavailable") {
    return {
      kind: "retry",
      intent: attempt.intent,
      code: "method-unavailable",
    };
  }
  if (!proof.valid || !proof.providerSubject) {
    return {
      kind: "retry",
      intent: attempt.intent,
      code: "invalid-or-expired",
    };
  }
  return {
    kind: "authenticated",
    intent: attempt.intent,
    providerSubject: proof.providerSubject,
  };
}

type MethodLinkResult =
  | {
      readonly kind: "linked";
      readonly methods: readonly AuthenticationMethod[];
    }
  | { readonly kind: "reauthentication-required" }
  | { readonly kind: "account-conflict" };

export function linkAuthenticationMethod(input: {
  readonly existingMethods: readonly AuthenticationMethod[];
  readonly newMethod: AuthenticationMethod;
  readonly recentReauthentication: boolean;
  readonly belongsToAnotherAccount: boolean;
}): MethodLinkResult {
  if (!input.recentReauthentication)
    return { kind: "reauthentication-required" };
  if (input.belongsToAnotherAccount) return { kind: "account-conflict" };
  if (input.existingMethods.some(({ id }) => id === input.newMethod.id)) {
    return { kind: "linked", methods: input.existingMethods };
  }
  return {
    kind: "linked",
    methods: [...input.existingMethods, input.newMethod],
  };
}

export function recoveryResponse(_input: {
  readonly accountExists: boolean;
  readonly throttled: boolean;
}): {
  readonly message: "If an Account is eligible, recovery review has started.";
} {
  return { message: "If an Account is eligible, recovery review has started." };
}

type ReviewedRecoveryResult =
  | {
      readonly kind: "approved";
      readonly revokePriorSessions: true;
      readonly notifyVerifiedContacts: true;
      readonly requireFreshAuthentication: true;
      readonly requireClaimReverification: true;
    }
  | { readonly kind: "pending-or-denied" };

export function completeReviewedRecovery(input: {
  readonly approved: boolean;
  readonly holdComplete: boolean;
  readonly proofSufficient: boolean;
}): ReviewedRecoveryResult {
  if (!input.approved || !input.holdComplete || !input.proofSufficient) {
    return { kind: "pending-or-denied" };
  }
  return {
    kind: "approved",
    revokePriorSessions: true,
    notifyVerifiedContacts: true,
    requireFreshAuthentication: true,
    requireClaimReverification: true,
  };
}

const lifecycleTransitions: Readonly<
  Record<AccountState, readonly AccountState[]>
> = {
  active: ["limited", "suspended", "deletion-pending"],
  limited: ["active", "suspended", "deletion-pending"],
  suspended: ["active", "limited", "deletion-pending"],
  "deletion-pending": ["active", "limited", "suspended", "deleted"],
  deleted: [],
};

export function transitionAccount(
  account: Account,
  nextState: AccountState,
  now: Date,
): Account | null {
  if (!lifecycleTransitions[account.state].includes(nextState)) return null;
  if (nextState === "deletion-pending") {
    if (
      account.state !== "active" &&
      account.state !== "limited" &&
      account.state !== "suspended"
    ) {
      return null;
    }
    return {
      ...account,
      state: nextState,
      preDeletionState: account.state,
      deletionRequestedAt: now,
    };
  }
  if (account.state === "deletion-pending" && nextState === "deleted") {
    return {
      ...account,
      state: "deleted",
      identityErasureDueAt: addDays(now, 30),
      backupErasureDueAt: addDays(now, 90),
    };
  }
  return { ...account, state: nextState };
}

export function accountTransitionEffects(
  _prior: AccountState,
  resulting: AccountState,
): {
  readonly revokeSessions: boolean;
  readonly ordinaryCapabilitiesDisabled: boolean;
} {
  return {
    revokeSessions:
      resulting === "suspended" ||
      resulting === "deletion-pending" ||
      resulting === "deleted",
    ordinaryCapabilitiesDisabled: resulting !== "active",
  };
}

export function correctAuthenticationMethod(input: {
  readonly methods: readonly AuthenticationMethod[];
  readonly replacement: AuthenticationMethod;
  readonly replacedMethodId: string;
  readonly recentReauthentication: boolean;
  readonly belongsToAnotherAccount: boolean;
}): MethodLinkResult {
  if (!input.recentReauthentication)
    return { kind: "reauthentication-required" };
  if (input.belongsToAnotherAccount) return { kind: "account-conflict" };
  return {
    kind: "linked",
    methods: [
      ...input.methods.filter(({ id }) => id !== input.replacedMethodId),
      input.replacement,
    ],
  };
}

export function cancelDeletion(account: Account, now: Date): Account | null {
  if (
    account.state !== "deletion-pending" ||
    !account.deletionRequestedAt ||
    now > addDays(account.deletionRequestedAt, 30)
  ) {
    return null;
  }
  const {
    deletionRequestedAt: _deletionRequestedAt,
    preDeletionState,
    ...rest
  } = account;
  return { ...rest, state: preDeletionState ?? "active" };
}

export function finalizeExpiredDeletion(
  account: Account,
  now: Date,
): Account | null {
  if (
    account.state !== "deletion-pending" ||
    !account.deletionRequestedAt ||
    now < addDays(account.deletionRequestedAt, 30)
  ) {
    return null;
  }
  return transitionAccount(account, "deleted", now);
}

export function deletionConsequences(): string {
  return [
    "Sessions are revoked immediately.",
    "Recovery is available for 30 days.",
    "An independent public Profile remains independent.",
    "Authored content follows each content capability's policy.",
    "Minimum safety records and legal holds may remain.",
  ].join(" ");
}

interface AccountExportProjection {
  readonly account: { readonly id: string; readonly state: AccountState };
  readonly authenticationMethods: readonly {
    readonly provider: AuthenticationProvider;
    readonly verifiedAt: string;
  }[];
  readonly byline: { readonly displayName: string } | null;
}

export function accountExport(input: {
  readonly account: Account;
  readonly methods: readonly AuthenticationMethod[];
  readonly byline: { readonly displayName: string } | null;
}): AccountExportProjection {
  return {
    account: { id: input.account.id, state: input.account.state },
    authenticationMethods: input.methods.map(({ provider, verifiedAt }) => ({
      provider,
      verifiedAt: verifiedAt.toISOString(),
    })),
    byline: input.byline,
  };
}

export function capabilitiesFor(
  account: Account,
): readonly AccountCapability[] {
  switch (account.state) {
    case "active":
      return [
        "appeal",
        "delete-account",
        "export-data",
        "protected-action",
        "read-notices",
      ];
    case "limited":
      return ["appeal", "delete-account", "export-data", "read-notices"];
    case "suspended":
      return ["appeal", "delete-account", "export-data", "read-notices"];
    case "deletion-pending":
      return ["appeal", "export-data", "read-notices"];
    case "deleted":
      return [];
  }
}

export function reauthenticationIsRecent(
  authenticatedAt: Date,
  now: Date,
  maximumAgeMinutes = 15,
): boolean {
  return (
    now.getTime() - authenticatedAt.getTime() <= maximumAgeMinutes * 60_000
  );
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
