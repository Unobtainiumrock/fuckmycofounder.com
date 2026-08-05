import { charges, dispositions, severities } from "./content";

const maximumFragmentLength = 1800;
const contactRules = [
  {
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/iu,
    label: "email address",
  },
  { pattern: /\+?\d[\d\s().-]{7,}\d/u, label: "phone number" },
] as const;

export type ChargeId = (typeof charges)[number]["id"];
type StatementField = "incident" | "quote" | "translation";

interface Clock {
  now(): Date;
}

export interface CookedQuizSubmission {
  chargeId: string;
  incident: string;
  quote: string;
  translation: string;
}

export interface CookedQuizReport extends CookedQuizSubmission {
  chargeId: ChargeId;
  id: string;
  charge: string;
  severity: string;
  disposition: string;
}

export type SubmissionResult =
  | { status: "accepted"; report: CookedQuizReport }
  | {
      status: "rejected";
      errors: Partial<Record<StatementField | "chargeId", string>>;
    };

export type RestoreResult =
  | { status: "accepted"; report: CookedQuizReport }
  | { status: "ignored" };

export interface CookedQuiz {
  caseTicker(): string;
  encode(report: CookedQuizReport): string;
  restore(fragment: string): RestoreResult;
  submit(submission: CookedQuizSubmission): SubmissionResult;
}

export const cookedQuizCharges = charges;

export function createCookedQuiz({ clock }: { clock: Clock }): CookedQuiz {
  function submit(submission: CookedQuizSubmission): SubmissionResult {
    const errors = validateSubmission(submission);
    if (Object.keys(errors).length > 0) return { status: "rejected", errors };

    return { status: "accepted", report: buildReport(submission) };
  }

  return {
    caseTicker: () =>
      String(
        Math.floor(clock.now().getTime() / 86_400_000) % 1_000_000,
      ).padStart(6, "0"),
    encode: encodeReport,
    restore: (fragment) => {
      const decoded = decodeFragment(fragment);
      if (!decoded) return { status: "ignored" };
      const result = submit(decoded);
      return result.status === "accepted" ? result : { status: "ignored" };
    },
    submit,
  };
}

function normalizeText(value: string): string {
  return value.trim().replace(/\s+/gu, " ");
}

function validateStatement(value: string): string | undefined {
  const normalized = normalizeText(value);
  if (!normalized) return "This blank is doing founder-level work avoidance.";
  if (normalized.length < 8)
    return "Give the board at least eight characters of lore.";

  const contact = contactRules.find(({ pattern }) => pattern.test(normalized));
  return contact
    ? `Leave out the ${contact.label} — no contact info in case files.`
    : undefined;
}

function validateSubmission(
  submission: CookedQuizSubmission,
): Partial<Record<StatementField | "chargeId", string>> {
  const errors: Partial<Record<StatementField | "chargeId", string>> = {};
  if (!isChargeId(submission.chargeId))
    errors.chargeId = "Pick one count of cofounder nonsense.";

  for (const field of ["incident", "quote", "translation"] as const) {
    const error = validateStatement(submission[field]);
    if (error) errors[field] = error;
  }
  return errors;
}

function isChargeId(value: string): value is ChargeId {
  return charges.some(({ id }) => id === value);
}

function hashText(value: string): number {
  let hash = 2_166_136_261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16_777_619);
  }
  return hash >>> 0;
}

function buildReport(submission: CookedQuizSubmission): CookedQuizReport {
  const charge =
    charges.find(({ id }) => id === submission.chargeId) ?? charges[0];
  const incident = normalizeText(submission.incident);
  const quote = normalizeText(submission.quote);
  const translation = normalizeText(submission.translation);
  const hash = hashText(`${charge.id}|${incident}|${quote}|${translation}`);

  return {
    id: `FMC-${hash.toString(36).toUpperCase().padStart(7, "0").slice(-7)}`,
    chargeId: charge.id,
    charge: charge.label,
    incident,
    quote,
    translation,
    severity: severities[hash % severities.length] ?? severities[0],
    disposition:
      dispositions[(hash >>> 5) % dispositions.length] ?? dispositions[0],
  };
}

function encodeReport(report: CookedQuizReport): string {
  const payload = {
    v: 1,
    c: report.chargeId,
    i: report.incident,
    q: report.quote,
    t: report.translation,
  };
  const bytes = new TextEncoder().encode(JSON.stringify(payload));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return `#r=${btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/u, "")}`;
}

function decodeFragment(fragment: string): CookedQuizSubmission | undefined {
  if (!fragment.startsWith("#r=") || fragment.length > maximumFragmentLength)
    return undefined;

  try {
    const value = fragment.slice(3).replaceAll("-", "+").replaceAll("_", "/");
    const binary = atob(value.padEnd(Math.ceil(value.length / 4) * 4, "="));
    const bytes = Uint8Array.from(binary, (character) =>
      character.charCodeAt(0),
    );
    const payload = JSON.parse(new TextDecoder().decode(bytes)) as unknown;
    if (!isEncodedSubmission(payload)) return undefined;
    return {
      chargeId: payload.c,
      incident: payload.i,
      quote: payload.q,
      translation: payload.t,
    };
  } catch {
    return undefined;
  }
}

function isEncodedSubmission(
  value: unknown,
): value is { v: 1; c: string; i: string; q: string; t: string } {
  if (!value || typeof value !== "object") return false;
  const payload = value as Record<string, unknown>;
  return (
    payload.v === 1 &&
    typeof payload.c === "string" &&
    typeof payload.i === "string" &&
    typeof payload.q === "string" &&
    typeof payload.t === "string" &&
    payload.i.length <= 180 &&
    payload.q.length <= 140 &&
    payload.t.length <= 80
  );
}
