import { CHARGES } from "./content.js";
import { createCase, fetchCase, isApiAvailable, uploadCaseCard } from "./api.js";
import { decodeCaseFragment, decodeReportFragment, parseCasePath } from "./codec.js";
import { avatarPreviewUrl, fileToAvatarBlob } from "./avatar.js";
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
  const avatarInput = dialog.querySelector("[data-avatar-input]");
  const avatarPreview = dialog.querySelector("[data-avatar-preview]");
  const avatarClear = dialog.querySelector("[data-avatar-clear]");
  const avatarError = dialog.querySelector("[data-avatar-error]");
  let currentReport = null;
  let avatarBlob = null;
  let avatarObjectUrl = null;

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
    if (avatarError) avatarError.textContent = "";
  }

  function clearAvatar() {
    avatarBlob = null;
    if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
    avatarObjectUrl = null;
    if (avatarInput) avatarInput.value = "";
    if (avatarPreview) {
      avatarPreview.hidden = true;
      avatarPreview.removeAttribute("src");
    }
    if (avatarClear) avatarClear.hidden = true;
  }

  function setAvatarPreview(blob) {
    if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
    avatarBlob = blob;
    avatarObjectUrl = avatarPreviewUrl(blob);
    if (avatarPreview) {
      avatarPreview.hidden = false;
      avatarPreview.src = avatarObjectUrl;
    }
    if (avatarClear) avatarClear.hidden = false;
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

  function previewAvatarUrl() {
    return avatarObjectUrl;
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
    renderReport({
      ...buildReport(payload),
      avatarUrl: previewAvatarUrl()
    }, previewRoot);
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
    // Render into the result card specifically: the dialog also contains the
    // live-preview card, whose duplicate data-report-* nodes come first in DOM order.
    renderReport(report, dialog.querySelector("[data-case-file]"));
    showStep(3);
    openDialog();
    if (report.persisted) {
      history.replaceState(null, "", `/c/${report.id}`);
    }
  }

  function resetReport() {
    form.reset();
    currentReport = null;
    clearAvatar();
    clearErrors();
    form.querySelectorAll("[data-count]").forEach((counter) => { counter.textContent = "0"; });
    if (previewWrap) previewWrap.hidden = true;
    history.replaceState(null, "", location.pathname.startsWith("/c/") ? "/" : `${location.pathname}${location.search}`);
    showStep(1);
  }

  async function persistReport(payload) {
    const created = await createCase(payload, avatarBlob);
    let report = buildReport({
      ...payload,
      id: created.id,
      avatarUrl: created.avatarUrl,
      cardUrl: null,
      persisted: true
    });

    const { renderCardBlob } = await import("./card-renderer.js");
    const cardBlob = await renderCardBlob(report);
    const uploaded = await uploadCaseCard(created.id, cardBlob);
    report = { ...report, cardUrl: uploaded.cardUrl };
    return report;
  }

  async function loadPersistedCase(caseId) {
    const data = await fetchCase(caseId);
    displayReport(buildReport({
      chargeId: data.chargeId,
      incident: data.incident,
      quote: data.quote,
      translation: data.translation,
      id: data.id,
      avatarUrl: data.avatarUrl,
      cardUrl: data.cardUrl,
      persisted: true
    }));
  }

  async function withBusy(button, action) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = "Processing emotional paperwork…";
    try {
      toast.textContent = await action();
    } catch (error) {
      if (error?.name !== "AbortError") toast.textContent = error?.message ?? "The paperwork jammed. Try the download button.";
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

  avatarInput?.addEventListener("change", async () => {
    const file = avatarInput.files?.[0];
    if (!file) return;
    if (avatarError) avatarError.textContent = "";
    try {
      setAvatarPreview(await fileToAvatarBlob(file));
      updateLivePreview();
    } catch (error) {
      clearAvatar();
      if (avatarError) avatarError.textContent = error.message;
    }
  });

  avatarClear?.addEventListener("click", () => {
    clearAvatar();
    updateLivePreview();
  });

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

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = collectPayload();
    if (!validateForm(payload)) return;

    const submitButton = form.querySelector('[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = "Filing with the board…";

    try {
      let report = buildReport({
        ...payload,
        avatarUrl: previewAvatarUrl()
      });

      if (isApiAvailable()) {
        try {
          report = await persistReport(payload);
        } catch {
          report = buildReport({
            ...payload,
            avatarUrl: previewAvatarUrl()
          });
          toast.textContent = "Saved locally only. The board archive is offline.";
        }
      }

      displayReport(report);
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Generate case file ↗";
    }
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
      return currentReport.persisted
        ? "Link copied. Mugshot included."
        : "Link copied. The redacted text lives after the #.";
    });
  });

  const shared = decodeReportFragment(location.hash);
  if (shared && CHARGES.some(({ id }) => id === shared.c)) {
    displayReport(buildReport({ chargeId: shared.c, incident: shared.i, quote: shared.q, translation: shared.t }));
    return;
  }

  const caseId = decodeCaseFragment(location.hash) ?? parseCasePath(location.pathname);
  if (caseId) {
    loadPersistedCase(caseId).catch(() => {
      toast.textContent = "That case file expired or never existed.";
      openDialog();
    });
  }
}
