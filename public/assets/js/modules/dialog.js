import { CHARGES } from "./content.js";
import { decodeReportFragment } from "./codec.js";
import { buildReport, renderReport } from "./report.js";
import { copyReportLink, downloadReportCard, shareReport } from "./share.js";
import { normalizeText, validateStatement } from "./validation.js";

export function initializeReportDialog() {
  const dialog = document.querySelector("[data-report-dialog]");
  const form = dialog.querySelector("[data-report-form]");
  const chargeGrid = dialog.querySelector("[data-charge-grid]");
  const toast = dialog.querySelector("[data-toast]");
  let currentReport = null;

  function buildCharges() {
    for (const charge of CHARGES) {
      const label = document.createElement("label");
      label.className = "charge-option";
      label.innerHTML = `<input type="radio" name="charge" value="${charge.id}"><span class="charge-option__emoji" aria-hidden="true">${charge.emoji}</span><span class="charge-option__label">${charge.label}</span>`;
      chargeGrid.append(label);
    }
  }

  function showStep(step) {
    for (const section of dialog.querySelectorAll("[data-step]")) {
      const active = Number(section.dataset.step) === step;
      section.hidden = !active;
      section.classList.toggle("is-active", active);
    }
    for (const meter of dialog.querySelectorAll("[data-meter]")) {
      meter.classList.toggle("is-active", Number(meter.dataset.meter) === step);
    }
    toast.textContent = "";
    dialog.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDialog() {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("has-dialog");
  }

  function closeDialog() {
    dialog.close();
    document.body.classList.remove("has-dialog");
  }

  function clearErrors() {
    dialog.querySelectorAll("[data-error], [data-charge-error]").forEach((element) => { element.textContent = ""; });
  }

  function collectPayload() {
    const data = new FormData(form);
    return {
      chargeId: String(data.get("charge") ?? ""),
      incident: normalizeText(String(data.get("incident") ?? "")),
      quote: normalizeText(String(data.get("quote") ?? "")),
      translation: normalizeText(String(data.get("translation") ?? ""))
    };
  }

  function validateForm(payload) {
    clearErrors();
    let valid = true;
    for (const name of ["incident", "quote", "translation"]) {
      const error = validateStatement(name, payload[name]);
      dialog.querySelector(`[data-error="${name}"]`).textContent = error;
      if (error) valid = false;
    }
    return valid;
  }

  function displayReport(report) {
    currentReport = report;
    renderReport(report, dialog);
    showStep(3);
    openDialog();
  }

  function resetReport() {
    form.reset();
    currentReport = null;
    clearErrors();
    form.querySelectorAll("[data-count]").forEach((counter) => { counter.textContent = "0"; });
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    showStep(1);
  }

  async function withBusy(button, action) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Processing emotional paperwork…";
    try {
      toast.textContent = await action();
    } catch (error) {
      if (error?.name !== "AbortError") toast.textContent = "The paperwork jammed. Try the download button.";
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  buildCharges();

  document.querySelectorAll("[data-start-report]").forEach((button) => button.addEventListener("click", () => {
    resetReport();
    openDialog();
  }));
  dialog.querySelector("[data-close-report]").addEventListener("click", closeDialog);
  dialog.addEventListener("close", () => document.body.classList.remove("has-dialog"));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) closeDialog();
  });

  dialog.querySelector('[data-next="2"]').addEventListener("click", () => {
    const selected = form.elements.charge.value;
    dialog.querySelector("[data-charge-error]").textContent = selected ? "" : "Pick one count of cofounder nonsense.";
    if (selected) showStep(2);
  });
  dialog.querySelector('[data-back="1"]').addEventListener("click", () => showStep(1));
  dialog.querySelector("[data-start-over]").addEventListener("click", resetReport);

  form.addEventListener("input", (event) => {
    const counter = dialog.querySelector(`[data-count="${event.target.name}"]`);
    if (counter) counter.textContent = String(event.target.value.length);
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const payload = collectPayload();
    if (!validateForm(payload)) return;
    displayReport(buildReport(payload));
  });

  dialog.querySelector("[data-share-report]").addEventListener("click", (event) => {
    if (currentReport) withBusy(event.currentTarget, () => shareReport(currentReport));
  });
  dialog.querySelector("[data-download-report]").addEventListener("click", (event) => {
    if (currentReport) withBusy(event.currentTarget, async () => {
      await downloadReportCard(currentReport);
      return "Downloaded. Store beside the unsigned SAFE note.";
    });
  });
  dialog.querySelector("[data-copy-link]").addEventListener("click", (event) => {
    if (currentReport) withBusy(event.currentTarget, async () => {
      await copyReportLink(currentReport);
      return "Link copied. The text lives after the #.";
    });
  });

  const shared = decodeReportFragment(location.hash);
  if (shared && CHARGES.some(({ id }) => id === shared.c)) {
    displayReport(buildReport({ chargeId: shared.c, incident: shared.i, quote: shared.q, translation: shared.t }));
  }
}
