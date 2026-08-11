import type {
  Account,
  EnforcementAction,
  EnforcementOutcome,
  RestrictedModerationCaseRecord,
  ModerationCaseState,
  RestrictedReportRecord,
  ReportReason,
} from "./model";
import {
  matchesAuthorizedDurableCommand,
  type AuthorizedDurableCommand,
} from "./policy";

export function blockApplies(input: {
  readonly viewerAccountId?: string;
  readonly actorAccountId: string;
  readonly blockedPairs: readonly {
    readonly blockerId: string;
    readonly blockedId: string;
  }[];
  readonly surface:
    | "public"
    | "named-byline"
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
      readonly receipt: {
        readonly caseId: string;
        readonly state: ModerationCaseState;
        readonly queue: "ordinary" | "urgent";
      };
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
  readonly existingCase?: RestrictedModerationCaseRecord;
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
  const moderationCase = buildModerationCase(input);
  return {
    kind: "accepted",
    receipt: {
      caseId: moderationCase.id,
      state: moderationCase.state,
      queue: moderationCase.queue,
    },
    ...(moderationCase.queue === "urgent"
      ? {
          emergencyGuidance:
            "If anyone is in immediate danger, contact local emergency services.",
        }
      : {}),
  };
}

interface RestrictedReportIntake {
  readonly kind: "restricted-report-intake";
  readonly report: RestrictedReportRecord;
  readonly moderationCase: RestrictedModerationCaseRecord;
}

export function prepareRestrictedReportIntake(input: {
  readonly authorization: AuthorizedDurableCommand;
  readonly request: Parameters<typeof intakeReport>[0];
}): RestrictedReportIntake | null {
  const accountId = input.request.reporterAccount?.id;
  if (
    !accountId ||
    !matchesAuthorizedDurableCommand(input.authorization, {
      actorId: accountId,
      action: "report-create",
      capability: "trust-safety.report",
      targetKind: "report",
      targetId: input.request.id,
    })
  ) {
    return null;
  }
  const result = intakeReport(input.request);
  if (result.kind !== "accepted") return null;
  return {
    kind: "restricted-report-intake",
    report: buildReport(input.request, accountId),
    moderationCase: buildModerationCase(input.request),
  };
}

function buildReport(
  input: Parameters<typeof intakeReport>[0],
  reporterAccountId: string,
): RestrictedReportRecord {
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
): RestrictedModerationCaseRecord {
  const existingIds = input.existingCase?.reportIds ?? [];
  const fields = {
    id: input.caseId,
    targetId: input.targetId,
    queue:
      input.reason === "threat-or-imminent-harm"
        ? "urgent"
        : (input.existingCase?.queue ?? "ordinary"),
    reportIds: existingIds.includes(input.id)
      ? existingIds
      : [...existingIds, input.id],
  };
  return input.existingCase
    ? { ...input.existingCase, ...fields }
    : { ...fields, state: "received" };
}

export function reportStatusProjection(
  moderationCase: RestrictedModerationCaseRecord,
): {
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
  moderationCase: RestrictedModerationCaseRecord,
  state: ModerationCaseState,
): RestrictedModerationCaseRecord | null {
  if (moderationCase.state === "closed") return null;
  if (!caseTransitions[moderationCase.state].includes(state)) return null;
  if (state === "closed") {
    return {
      ...moderationCase,
      state,
      closedFrom: moderationCase.state,
      originalReviewerId:
        "originalReviewerId" in moderationCase
          ? moderationCase.originalReviewerId
          : null,
      enforcement:
        "enforcement" in moderationCase ? moderationCase.enforcement : null,
      appealDeadline:
        "appealDeadline" in moderationCase
          ? moderationCase.appealDeadline
          : null,
    };
  }
  if (
    (state === "triaged" || state === "investigating") &&
    (moderationCase.state === "received" || moderationCase.state === "triaged")
  ) {
    return { ...moderationCase, state };
  }
  return null;
}

export function applyEnforcement(input: {
  readonly moderationCase: RestrictedModerationCaseRecord;
  readonly reviewerId: string;
  readonly outcome: EnforcementOutcome;
  readonly policyReason: string;
  readonly effectiveAt: Date;
  readonly scopeOrDuration: string;
}): RestrictedModerationCaseRecord | null {
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
    appealDeadline: enforcement.appealable
      ? addDays(input.effectiveAt, 30)
      : null,
  };
}

export function appealCase(input: {
  readonly moderationCase: RestrictedModerationCaseRecord;
  readonly reviewerId: string;
  readonly now: Date;
}): RestrictedModerationCaseRecord | null {
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
  if (input.reason !== "other") {
    return { allowed: false, reasonCode: `conduct:${input.reason}` };
  }
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
