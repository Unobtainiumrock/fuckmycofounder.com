import { CHARGES } from "./content.js";
import { decodeReportFragment } from "./codec.js";
import { buildReport, renderReport } from "./report.js";
import { copyReportLink, downloadReportCard, shareReport } from "./share.js";
import { clampFieldValue, enforceFieldLimit, FIELD_LIMITS, normalizeText, validateStatement } from "./validation.js";

export function initializeReportDialog() {
  const dialog = document.querySelector("[data-report-dialog]");
  const form = dialog.querySelector("[data-report-form]");
  const chargeGrid = dialog.querySelector("[data-charge-grid]");
  const toast = dialog.querySelector("[data-toast]");
  const previewWrap = dialog.querySelector("[data-case-preview-wrap]");
  const previewRoot = dialog.querySelector("[data-case-preview]");
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
      incident: clampFieldValue("incident", normalizeText(String(data.get("incident") ?? ""))),
      quote: clampFieldValue("quote", normalizeText(String(data.get("quote") ?? ""))),
      translation: clampFieldValue("translation", normalizeText(String(data.get("translation") ?? "")))
    };
  }

  function updateFieldCounter(field) {
    const counter = dialog.querySelector(`[data-count="${field.name}"]`);
    if (counter) counter.textContent = String(field.value.length);
  }

  function updateLivePreview() {
    if (!previewWrap || !previewRoot) return;
    const payload = collectPayload();
    const hasDraft = payload.chargeId && (payload.incident || payload.quote || payload.translation);
    previewWrap.hidden = !hasDraft;
    if (!hasDraft) return;
    renderReport(buildReport(payload), previewRoot);
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
    if (previewWrap) previewWrap.hidden = true;
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
    if (selected) {
      showStep(2);
      updateLivePreview();
    }
  });
  dialog.querySelector('[data-back="1"]').addEventListener("click", () => showStep(1));
  dialog.querySelector("[data-start-over]").addEventListener("click", resetReport);

  form.addEventListener("paste", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    const limit = FIELD_LIMITS[field.name];
    if (!limit) return;

    event.preventDefault();
    const paste = event.clipboardData?.getData("text") ?? "";
    const start = field.selectionStart ?? field.value.length;
    const end = field.selectionEnd ?? field.value.length;
    field.value = clampFieldValue(field.name, `${field.value.slice(0, start)}${paste}${field.value.slice(end)}`);
    const cursor = Math.min(start + paste.length, field.value.length);
    field.setSelectionRange(cursor, cursor);
    field.dispatchEvent(new Event("input", { bubbles: true }));
  });

  form.addEventListener("beforeinput", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    const limit = FIELD_LIMITS[field.name];
    if (!limit || event.inputType.startsWith("delete")) return;

    const value = field.value;
    const start = field.selectionStart ?? value.length;
    const end = field.selectionEnd ?? value.length;
    const insertion = event.data ?? "";
    const nextLength = value.slice(0, start).length + insertion.length + value.slice(end).length;
    if (nextLength > limit) event.preventDefault();
  });

  form.addEventListener("input", (event) => {
    const field = event.target;
    if (!(field instanceof HTMLInputElement || field instanceof HTMLTextAreaElement)) return;
    if (!FIELD_LIMITS[field.name]) return;
    enforceFieldLimit(field);
    updateFieldCounter(field);
    updateLivePreview();
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
      return "Link copied. The redacted text lives after the #.";
    });
  });

  const shared = decodeReportFragment(location.hash);
  if (shared && CHARGES.some(({ id }) => id === shared.c)) {
    displayReport(buildReport({ chargeId: shared.c, incident: shared.i, quote: shared.q, translation: shared.t }));
  }
}
