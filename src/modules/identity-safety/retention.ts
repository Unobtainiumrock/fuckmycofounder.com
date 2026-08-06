import type { AuditEvent, RetainedRecord } from "./model";

interface RetentionResult {
  readonly records: readonly RetainedRecord[];
  readonly events: readonly AuditEvent[];
}

export function runRetention(
  records: readonly RetainedRecord[],
  now: Date,
): RetentionResult {
  const events: AuditEvent[] = [];
  const next = records.map((record) => {
    if (
      !record.payloadPresent ||
      record.legalHold ||
      record.appealActive ||
      now < record.expiresAt
    ) {
      return record;
    }
    events.push({
      id: `${record.id}:retention`,
      category: "retention",
      actorRole: "retention-job",
      occurredAt: now,
      reasonCode: `${record.category}-expired`,
      policyVersion: "identity-safety-v1",
      priorState: "payload-present",
      resultingState: "payload-deleted",
      restrictedEvidenceReferences: [],
    });
    return { ...record, payloadPresent: false };
  });
  return { records: next, events };
}

export function appendAudit(
  history: readonly AuditEvent[],
  event: AuditEvent,
): readonly AuditEvent[] {
  if (history.some(({ id }) => id === event.id)) {
    return [
      ...history,
      {
        ...event,
        id: `${event.id}:denied-mutation:${history.length}`,
        reasonCode: "audit-mutation-denied",
        priorState: event.resultingState,
        resultingState: event.resultingState,
      },
    ];
  }
  return [...history, event];
}
