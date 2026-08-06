import { describe, expect, it } from "vitest";

import {
  appendAudit,
  mayRevealRestrictedField,
  runRetention,
  type AuditEvent,
  type RetainedRecord,
  type RestrictedField,
  type StaffRole,
} from "@/src/modules/identity-safety/server";

const now = new Date("2026-08-05T12:00:00.000Z");
const event: AuditEvent = {
  id: "audit-1",
  category: "moderation",
  actorRole: "moderator",
  occurredAt: now,
  reasonCode: "conduct-rule",
  policyVersion: "identity-safety-v1",
  priorState: "investigating",
  resultingState: "resolved",
  restrictedEvidenceReferences: ["evidence-restricted"],
};

describe("append-only audit history", () => {
  it("records complete sensitive transition fields and appends a denied mutation event", () => {
    const history = appendAudit([], event);
    expect(history).toEqual([event]);
    const attemptedMutation = appendAudit(history, {
      ...event,
      resultingState: "closed",
    });
    expect(attemptedMutation).toHaveLength(2);
    expect(attemptedMutation[0]).toEqual(event);
    expect(attemptedMutation[1]).toMatchObject({
      reasonCode: "audit-mutation-denied",
    });
  });
});

describe("least privilege", () => {
  const fields: readonly RestrictedField[] = [
    "authentication-data",
    "anonymous-author-linkage",
    "block-direction",
    "claim-evidence",
    "legal-hold",
    "reporter-identity",
    "risk-signals",
  ];
  const roles: readonly StaffRole[] = [
    "support",
    "moderator",
    "identity-reviewer",
    "legal",
  ];

  it.each(roles)("requires purpose and approval for %s", (role) => {
    for (const field of fields) {
      expect(
        mayRevealRestrictedField({
          role,
          field,
          caseReason: "",
          approved: true,
        }),
      ).toBe(false);
      expect(
        mayRevealRestrictedField({
          role,
          field,
          caseReason: "case-1",
          approved: false,
        }),
      ).toBe(false);
    }
  });

  it("redacts all restricted classes from support and grants only scoped roles", () => {
    expect(
      fields.some((field) =>
        mayRevealRestrictedField({
          role: "support",
          field,
          caseReason: "ticket-1",
          approved: true,
        }),
      ),
    ).toBe(false);
    expect(
      mayRevealRestrictedField({
        role: "moderator",
        field: "reporter-identity",
        caseReason: "case-1",
        approved: true,
      }),
    ).toBe(true);
    expect(
      mayRevealRestrictedField({
        role: "moderator",
        field: "authentication-data",
        caseReason: "case-1",
        approved: true,
      }),
    ).toBe(false);
  });
});

describe("purpose-limited retention", () => {
  const categories: readonly RetainedRecord["category"][] = [
    "private-identity",
    "recovery",
    "claim-evidence",
    "anonymous-linkage",
    "safety-audit",
    "backup",
  ];

  it.each(categories)("expires %s at its declared deadline", (category) => {
    const result = runRetention(
      [
        {
          id: category,
          category,
          expiresAt: now,
          legalHold: false,
          appealActive: false,
          payloadPresent: true,
        },
      ],
      now,
    );
    expect(result.records[0]).toMatchObject({ payloadPresent: false });
    expect(result.events[0]).toMatchObject({
      category: "retention",
      resultingState: "payload-deleted",
      restrictedEvidenceReferences: [],
    });
  });

  it.each([
    [true, false],
    [false, true],
  ] as const)(
    "pauses only the held or appealed record",
    (legalHold, appealActive) => {
      const result = runRetention(
        [
          {
            id: "held",
            category: "claim-evidence",
            expiresAt: now,
            legalHold,
            appealActive,
            payloadPresent: true,
          },
          {
            id: "ordinary",
            category: "claim-evidence",
            expiresAt: now,
            legalHold: false,
            appealActive: false,
            payloadPresent: true,
          },
        ],
        now,
      );
      expect(result.records).toMatchObject([
        { id: "held", payloadPresent: true },
        { id: "ordinary", payloadPresent: false },
      ]);
    },
  );
});
