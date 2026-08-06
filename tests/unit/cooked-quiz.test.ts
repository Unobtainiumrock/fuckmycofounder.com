import { describe, expect, it } from "vitest";

import { createCookedQuiz } from "../../src/modules/cooked-quiz";

const payload = {
  chargeId: "quick-sync",
  incident: "called a six a.m. meeting",
  quote: "we move at the speed of trust",
  translation: "calendar warfare",
} as const;

const fixedClock = { now: () => new Date("2026-08-05T12:00:00.000Z") };

describe("Cooked Quiz module", () => {
  it("returns the established deterministic report through its public interface", () => {
    const quiz = createCookedQuiz({ clock: fixedClock });

    expect(quiz.submit(payload)).toEqual({
      status: "accepted",
      report: {
        id: "FMC-1PV0WBM",
        chargeId: "quick-sync",
        charge: "Weaponized ‘Quick Sync’",
        incident: "called a six a.m. meeting",
        quote: "we move at the speed of trust",
        translation: "calendar warfare",
        severity: "Enterprise-Grade Yikes",
        disposition: "Approved for immediate removal from the shared calendar.",
      },
    });
  });

  it("renders a deterministic draft preview before every required field is complete", () => {
    const quiz = createCookedQuiz({ clock: fixedClock });

    expect(
      quiz.preview({
        chargeId: "quick-sync",
        incident: "missed the launch review",
        quote: "",
        translation: "",
      }),
    ).toMatchObject({
      charge: "Weaponized ‘Quick Sync’",
      incident: "missed the launch review",
      quote: "",
      translation: "",
    });
  });

  it("round-trips an accepted report through the supported fragment", () => {
    const quiz = createCookedQuiz({ clock: fixedClock });
    const submitted = quiz.submit(payload);
    expect(submitted.status).toBe("accepted");
    if (submitted.status !== "accepted") return;

    const fragment = quiz.encode(submitted.report);
    expect(quiz.restore(fragment)).toEqual(submitted);
  });

  it("rejects contact details and malformed fragments without partial output", () => {
    const quiz = createCookedQuiz({ clock: fixedClock });

    expect(
      quiz.submit({
        ...payload,
        incident: "emailed founder@example.com yesterday",
      }),
    ).toEqual({
      status: "rejected",
      errors: {
        incident:
          "Leave out the email address — no contact info in case files.",
      },
    });
    expect(quiz.restore("#r=this-is-not-json")).toEqual({ status: "ignored" });
    expect(quiz.restore(`#r=${"a".repeat(1801)}`)).toEqual({
      status: "ignored",
    });
  });

  it("enforces every UI length limit at the module boundary", () => {
    const quiz = createCookedQuiz({ clock: fixedClock });

    expect(
      quiz.submit({
        ...payload,
        incident: "x".repeat(181),
        quote: "y".repeat(141),
        translation: "z".repeat(81),
      }),
    ).toEqual({
      status: "rejected",
      errors: {
        incident: "Keep this blank to 180 characters or fewer.",
        quote: "Keep this blank to 140 characters or fewer.",
        translation: "Keep this blank to 80 characters or fewer.",
      },
    });
  });

  it("derives the case ticker from the injected clock", () => {
    const quiz = createCookedQuiz({ clock: fixedClock });

    expect(quiz.caseTicker()).toBe("020670");
  });
});
