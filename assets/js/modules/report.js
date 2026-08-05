import { CHARGES, DISPOSITIONS, SEVERITIES } from "./content.js";
import { fitCaseFileFields } from "./text-fit.js";
import { normalizeText } from "./validation.js";

function hashText(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function buildReport(payload) {
  const charge = CHARGES.find(({ id }) => id === payload.chargeId) ?? CHARGES[0];
  const incident = normalizeText(payload.incident);
  const quote = normalizeText(payload.quote);
  const translation = normalizeText(payload.translation);
  const hash = hashText(`${charge.id}|${incident}|${quote}|${translation}`);
  const derivedId = `FMC-${hash.toString(36).toUpperCase().padStart(7, "0").slice(-7)}`;

  return {
    id: payload.id ?? derivedId,
    chargeId: charge.id,
    charge: charge.label,
    incident,
    quote,
    translation,
    severity: SEVERITIES[hash % SEVERITIES.length],
    disposition: DISPOSITIONS[(hash >>> 5) % DISPOSITIONS.length],
    avatarUrl: payload.avatarUrl ?? null,
    cardUrl: payload.cardUrl ?? null,
    persisted: Boolean(payload.persisted)
  };
}

function renderAvatar(report, root) {
  const subject = root.querySelector("[data-report-subject]");
  const avatar = root.querySelector("[data-report-avatar]");
  if (!subject || !avatar) return;

  if (report.avatarUrl) {
    subject.hidden = false;
    avatar.src = report.avatarUrl;
    avatar.alt = "Subject mugshot";
  } else {
    subject.hidden = true;
    avatar.removeAttribute("src");
    avatar.alt = "";
  }
}

export function renderReport(report, root) {
  const fields = {
    "[data-report-id]": `CASE #${report.id}`,
    "[data-report-severity]": `SEVERITY: ${report.severity}`,
    "[data-report-charge]": report.charge,
    "[data-report-incident]": `My cofounder ${report.incident}.`,
    "[data-report-quote]": `“${report.quote}”`,
    "[data-report-translation]": report.translation,
    "[data-report-disposition]": report.disposition
  };

  for (const [selector, text] of Object.entries(fields)) {
    const element = root.querySelector(selector);
    if (element) {
      element.style.fontSize = "";
      element.textContent = text;
    }
  }

  renderAvatar(report, root);
  requestAnimationFrame(() => fitCaseFileFields(root));
}
