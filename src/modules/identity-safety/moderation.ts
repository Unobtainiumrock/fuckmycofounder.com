import type {
  Account,
  EnforcementAction,
  EnforcementOutcome,
  ModerationCase,
  ModerationCaseState,
  Report,
  ReportReason,
} from "./model";

export function blockApplies(input: {
  readonly viewerAccountId?: string;
  readonly actorAccountId: string;
  readonly blockedPairs: readonly {
    readonly blockerId: string;
    readonly blockedId: string;
  }[];
  readonly surface:
    | "public"
    | "direct-interaction"
    | "targeted-discovery"
    | "notification";
}): boolean {
  if (!input.viewerAccountId || input.surface === "public") return false;
  return input.blockedPairs.some(
    ({ blockerId, blockedId }) =>
      (blockerId === input.viewerAccountId &&
        blockedId === input.actorAccountId) ||
      (blockerId === input.actorAccountId &&
        blockedId === input.viewerAccountId),
  );
}

type ReportIntakeResult =
  | {
      readonly kind: "accepted";
      readonly report: Report;
      readonly moderationCase: ModerationCase;
      readonly emergencyGuidance?: string;
    }
  | { readonly kind: "authentication-required" }
  | { readonly kind: "case-closed"; readonly retryable: false }
  | { readonly kind: "unavailable"; readonly retryable: true }
  | { readonly kind: "target-unavailable"; readonly supportPath: true };

export function intakeReport(input: {
  readonly id: string;
  readonly caseId: string;
  readonly reporterAccount: Account | null;
  readonly targetId: string;
  readonly targetAvailable: boolean;
  readonly intakeAvailable: boolean;
  readonly reason: ReportReason;
  readonly context?: string;
  readonly evidenceReferences: readonly string[];
  readonly createdAt: Date;
  readonly existingCase?: ModerationCase;
}): ReportIntakeResult {
  if (!input.reporterAccount || input.reporterAccount.state !== "active") {
    return { kind: "authentication-required" };
  }
  if (input.existingCase?.state === "closed") {
    return { kind: "case-closed", retryable: false };
  }
  if (!input.intakeAvailable) return { kind: "unavailable", retryable: true };
  if (!input.targetAvailable)
    return { kind: "target-unavailable", supportPath: true };
  const report = buildReport(input, input.reporterAccount.id);
  const moderationCase = buildModerationCase(input);
  return {
    kind: "accepted",
    report,
    moderationCase,
    ...(moderationCase.queue === "urgent"
      ? {
          emergencyGuidance:
            "If anyone is in immediate danger, contact local emergency services.",
        }
      : {}),
  };
}

function buildReport(
  input: Parameters<typeof intakeReport>[0],
  reporterAccountId: string,
): Report {
  return {
    id: input.id,
    caseId: input.caseId,
    reporterAccountId,
    targetId: input.targetId,
    reason: input.reason,
    ...(input.context ? { context: input.context } : {}),
    evidenceReferences: input.evidenceReferences,
    createdAt: input.createdAt,
  };
}

function buildModerationCase(
  input: Parameters<typeof intakeReport>[0],
): ModerationCase {
  const existingIds = input.existingCase?.reportIds ?? [];
  return {
    id: input.caseId,
    targetId: input.targetId,
    state: input.existingCase?.state ?? "received",
    queue:
      input.reason === "threat-or-imminent-harm"
        ? "urgent"
        : (input.existingCase?.queue ?? "ordinary"),
    reportIds: existingIds.includes(input.id)
      ? existingIds
      : [...existingIds, input.id],
    ...(input.existingCase?.originalReviewerId
      ? { originalReviewerId: input.existingCase.originalReviewerId }
      : {}),
  };
}

export function reportStatusProjection(moderationCase: ModerationCase): {
  readonly caseId: string;
  readonly state: ModerationCaseState;
  readonly queue: "ordinary" | "urgent";
  readonly reportCount: number;
} {
  return {
    caseId: moderationCase.id,
    state: moderationCase.state,
    queue: moderationCase.queue,
    reportCount: moderationCase.reportIds.length,
  };
}

const caseTransitions: Readonly<
  Record<ModerationCaseState, readonly ModerationCaseState[]>
> = {
  received: ["triaged", "closed"],
  triaged: ["investigating", "resolved", "closed"],
  investigating: ["resolved", "closed"],
  resolved: ["appealed", "closed"],
  appealed: ["resolved", "closed"],
  closed: [],
};

export function transitionModerationCase(
  moderationCase: ModerationCase,
  state: ModerationCaseState,
): ModerationCase | null {
  return caseTransitions[moderationCase.state].includes(state)
    ? { ...moderationCase, state }
    : null;
}

export function applyEnforcement(input: {
  readonly moderationCase: ModerationCase;
  readonly reviewerId: string;
  readonly outcome: EnforcementOutcome;
  readonly policyReason: string;
  readonly effectiveAt: Date;
  readonly scopeOrDuration: string;
}): ModerationCase | null {
  if (input.moderationCase.state !== "investigating") return null;
  const enforcement: EnforcementAction = {
    outcome: input.outcome,
    policyReason: input.policyReason,
    effectiveAt: input.effectiveAt,
    scopeOrDuration: input.scopeOrDuration,
    appealable: input.outcome !== "none",
  };
  return {
    ...input.moderationCase,
    state: "resolved",
    originalReviewerId: input.reviewerId,
    enforcement,
    ...(enforcement.appealable
      ? { appealDeadline: addDays(input.effectiveAt, 30) }
      : {}),
  };
}

export function appealCase(input: {
  readonly moderationCase: ModerationCase;
  readonly reviewerId: string;
  readonly now: Date;
}): ModerationCase | null {
  if (
    input.moderationCase.state !== "resolved" ||
    !input.moderationCase.enforcement?.appealable ||
    !input.moderationCase.appealDeadline ||
    input.now > input.moderationCase.appealDeadline ||
    input.reviewerId === input.moderationCase.originalReviewerId
  ) {
    return null;
  }
  return { ...input.moderationCase, state: "appealed" };
}

export function abuseDecision(input: {
  readonly reason: ReportReason;
  readonly attempts: number;
  readonly coordinatedAccounts: number;
}): { readonly allowed: boolean; readonly reasonCode: string } {
  const rateLimited = input.attempts > 5;
  const coordinated = input.coordinatedAccounts >= 3;
  return rateLimited || coordinated
    ? {
        allowed: false,
        reasonCode: coordinated
          ? "coordinated-abuse"
          : `rate-limit:${input.reason}`,
      }
    : { allowed: true, reasonCode: "risk-approved" };
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 86_400_000);
}
