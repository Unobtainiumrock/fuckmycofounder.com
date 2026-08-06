import {
  cookedQuizCharges,
  createCookedQuiz,
  type CookedQuizReport,
  type CookedQuizSubmission,
} from "@/src/modules/cooked-quiz";

import {
  copyReportLink,
  downloadReportCard,
  shareReport,
} from "./share-report";

// source-size: reason=one dialog lifecycle keeps DOM contracts and cleanup local
const quiz = createCookedQuiz({ clock: { now: () => new Date() } });

export function initializeCookedQuiz(): () => void {
  const abortController = new AbortController();
  const signal = abortController.signal;
  const dialog = requireElement<HTMLDialogElement>(
    document,
    "[data-report-dialog]",
  );
  const form = requireElement<HTMLFormElement>(dialog, "[data-report-form]");
  const chargeGrid = requireElement<HTMLFieldSetElement>(
    dialog,
    "[data-charge-grid]",
  );
  const previewWrap = requireElement<HTMLElement>(
    dialog,
    "[data-case-preview-wrap]",
  );
  const preview = requireElement<HTMLElement>(dialog, "[data-case-preview]");
  const avatarInput = requireElement<HTMLInputElement>(
    dialog,
    "[data-avatar-input]",
  );
  const avatarPreview = requireElement<HTMLImageElement>(
    dialog,
    "[data-avatar-preview]",
  );
  const avatarClear = requireElement<HTMLButtonElement>(
    dialog,
    "[data-avatar-clear]",
  );
  const avatarError = requireElement<HTMLElement>(
    dialog,
    "[data-avatar-error]",
  );
  const toast = requireElement<HTMLElement>(dialog, "[data-toast]");
  let currentReport: CookedQuizReport | undefined;
  let avatarUrl: string | undefined;

  buildCharges(chargeGrid);
  requireElement<HTMLElement>(document, "[data-year]").textContent = String(
    new Date().getFullYear(),
  );
  requireElement<HTMLElement>(document, "[data-case-ticker]").textContent =
    quiz.caseTicker();

  const showStep = (step: number): void => {
    for (const section of dialog.querySelectorAll<HTMLElement>("[data-step]")) {
      const active = Number(section.dataset.step) === step;
      section.hidden = !active;
      section.classList.toggle("is-active", active);
    }
    for (const meter of dialog.querySelectorAll<HTMLElement>("[data-meter]")) {
      meter.classList.toggle("is-active", Number(meter.dataset.meter) === step);
    }
    toast.textContent = "";
    dialog.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openDialog = (): void => {
    if (!dialog.open) dialog.showModal();
    document.body.classList.add("has-dialog");
  };

  const closeDialog = (): void => {
    dialog.close();
    document.body.classList.remove("has-dialog");
  };

  const clearErrors = (): void => {
    for (const element of dialog.querySelectorAll<HTMLElement>(
      "[data-error], [data-charge-error]",
    )) {
      element.textContent = "";
    }
    avatarError.textContent = "";
  };

  const displayReport = (report: CookedQuizReport): void => {
    currentReport = report;
    renderReport(report, requireElement(dialog, "[data-case-file]"), avatarUrl);
    showStep(3);
    openDialog();
  };

  const clearAvatar = (): void => {
    if (avatarUrl) URL.revokeObjectURL(avatarUrl);
    avatarUrl = undefined;
    avatarInput.value = "";
    avatarPreview.hidden = true;
    avatarPreview.removeAttribute("src");
    avatarClear.hidden = true;
  };

  const updateLivePreview = (): void => {
    const result = quiz.submit(collectSubmission(form));
    previewWrap.hidden = result.status !== "accepted";
    if (result.status === "accepted")
      renderReport(result.report, preview, avatarUrl);
  };

  const resetReport = (): void => {
    form.reset();
    currentReport = undefined;
    clearAvatar();
    clearErrors();
    for (const counter of form.querySelectorAll<HTMLElement>("[data-count]")) {
      counter.textContent = "0";
    }
    previewWrap.hidden = true;
    history.replaceState(null, "", `${location.pathname}${location.search}`);
    showStep(1);
  };

  for (const button of document.querySelectorAll<HTMLElement>(
    "[data-start-report]",
  )) {
    button.addEventListener(
      "click",
      () => {
        resetReport();
        openDialog();
      },
      { signal },
    );
  }
  requireElement(dialog, "[data-close-report]").addEventListener(
    "click",
    closeDialog,
    { signal },
  );
  dialog.addEventListener(
    "close",
    () => document.body.classList.remove("has-dialog"),
    { signal },
  );
  dialog.addEventListener(
    "click",
    (event) => {
      if (event.target === dialog) closeDialog();
    },
    { signal },
  );

  requireElement(dialog, '[data-next="2"]').addEventListener(
    "click",
    () => {
      const selected = new FormData(form).get("charge");
      requireElement<HTMLElement>(dialog, "[data-charge-error]").textContent =
        selected ? "" : "Pick one count of cofounder nonsense.";
      if (selected) showStep(2);
    },
    { signal },
  );
  requireElement(dialog, '[data-back="1"]').addEventListener(
    "click",
    () => showStep(1),
    { signal },
  );
  requireElement(dialog, "[data-start-over]").addEventListener(
    "click",
    resetReport,
    { signal },
  );

  avatarInput.addEventListener(
    "change",
    () => {
      const [file] = avatarInput.files ?? [];
      if (!file) return;
      if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(file.type)) {
        clearAvatar();
        avatarError.textContent = "Choose a JPEG, PNG, or WebP mugshot.";
        return;
      }
      if (avatarUrl) URL.revokeObjectURL(avatarUrl);
      avatarUrl = URL.createObjectURL(file);
      avatarPreview.src = avatarUrl;
      avatarPreview.hidden = false;
      avatarClear.hidden = false;
      avatarError.textContent = "";
      updateLivePreview();
    },
    { signal },
  );
  avatarClear.addEventListener(
    "click",
    () => {
      clearAvatar();
      updateLivePreview();
    },
    { signal },
  );

  const reclaimForm = document.querySelector<HTMLFormElement>(
    "[data-board-entry-reclaim]",
  );
  reclaimForm?.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const boardKey = document.querySelector<HTMLInputElement>(
        "[data-board-entry-input]",
      )?.value;
      const error = document.querySelector<HTMLElement>(
        "[data-board-entry-error]",
      );
      if (!error) return;
      error.textContent = /^FMC-[A-Z0-9]{7}$/iu.test(boardKey ?? "")
        ? "Town Board retrieval remains on the static production surface."
        : "Enter a case id like FMC-ABC2345.";
    },
    { signal },
  );

  form.addEventListener(
    "input",
    (event) => {
      if (
        !(
          event.target instanceof HTMLInputElement ||
          event.target instanceof HTMLTextAreaElement
        )
      )
        return;
      const counter = dialog.querySelector<HTMLElement>(
        `[data-count="${event.target.name}"]`,
      );
      if (counter) counter.textContent = String(event.target.value.length);
      updateLivePreview();
    },
    { signal },
  );

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      clearErrors();
      const result = quiz.submit(collectSubmission(form));
      if (result.status === "rejected") {
        for (const [field, error] of Object.entries(result.errors)) {
          const target = dialog.querySelector<HTMLElement>(
            `[data-error="${field}"]`,
          );
          if (target) target.textContent = error;
        }
        return;
      }
      displayReport(result.report);
    },
    { signal },
  );

  bindAsyncAction(
    dialog,
    "[data-share-report]",
    toast,
    () =>
      currentReport ? shareReport(currentReport, quiz) : Promise.resolve(""),
    signal,
  );
  bindAsyncAction(
    dialog,
    "[data-download-report]",
    toast,
    async () => {
      if (!currentReport) return "";
      await downloadReportCard(currentReport);
      return "Downloaded. Store beside the unsigned SAFE note.";
    },
    signal,
  );
  bindAsyncAction(
    dialog,
    "[data-copy-link]",
    toast,
    async () => {
      if (!currentReport) return "";
      await copyReportLink(currentReport, quiz);
      return "Link copied. The text lives after the #.";
    },
    signal,
  );

  const restored = quiz.restore(location.hash);
  if (restored.status === "accepted") displayReport(restored.report);

  return () => abortController.abort();
}

function requireElement<T extends Element = HTMLElement>(
  root: ParentNode,
  selector: string,
): T {
  const element = root.querySelector<T>(selector);
  if (!element)
    throw new Error(`Required Cooked Quiz element is missing: ${selector}`);
  return element;
}

function buildCharges(root: HTMLFieldSetElement): void {
  root.replaceChildren(
    root.querySelector("legend") ?? document.createElement("legend"),
  );
  for (const charge of cookedQuizCharges) {
    const label = document.createElement("label");
    label.className = "charge-option";
    const input = document.createElement("input");
    input.type = "radio";
    input.name = "charge";
    input.value = charge.id;
    const emoji = document.createElement("span");
    emoji.className = "charge-option__emoji";
    emoji.ariaHidden = "true";
    emoji.textContent = charge.emoji;
    const text = document.createElement("span");
    text.className = "charge-option__label";
    text.textContent = charge.label;
    label.append(input, emoji, text);
    root.append(label);
  }
}

function collectSubmission(form: HTMLFormElement): CookedQuizSubmission {
  const data = new FormData(form);
  return {
    chargeId: readTextField(data, "charge"),
    incident: readTextField(data, "incident"),
    quote: readTextField(data, "quote"),
    translation: readTextField(data, "translation"),
  };
}

function readTextField(data: FormData, name: string): string {
  const value = data.get(name);
  return typeof value === "string" ? value : "";
}

function renderReport(
  report: CookedQuizReport,
  root: ParentNode,
  avatarUrl: string | undefined,
): void {
  const fields: Record<string, string> = {
    "[data-report-id]": `CASE #${report.id}`,
    "[data-report-severity]": `SEVERITY: ${report.severity}`,
    "[data-report-charge]": report.charge,
    "[data-report-incident]": `My cofounder ${report.incident}.`,
    "[data-report-quote]": `“${report.quote}”`,
    "[data-report-translation]": report.translation,
    "[data-report-disposition]": report.disposition,
  };
  for (const [selector, text] of Object.entries(fields)) {
    requireElement<HTMLElement>(root, selector).textContent = text;
  }
  const subject = requireElement<HTMLElement>(root, "[data-report-subject]");
  const avatar = requireElement<HTMLImageElement>(root, "[data-report-avatar]");
  subject.hidden = !avatarUrl;
  if (avatarUrl) {
    avatar.src = avatarUrl;
    avatar.alt = "Subject mugshot";
  } else {
    avatar.removeAttribute("src");
    avatar.alt = "";
  }
}

function bindAsyncAction(
  root: ParentNode,
  selector: string,
  toast: HTMLElement,
  action: () => Promise<string>,
  signal: AbortSignal,
): void {
  const button = requireElement<HTMLButtonElement>(root, selector);
  button.addEventListener(
    "click",
    () => {
      const original = button.textContent;
      button.disabled = true;
      button.textContent = "Processing emotional paperwork…";
      void action()
        .then((message) => {
          toast.textContent = message;
        })
        .catch((error: unknown) => {
          if (!(error instanceof DOMException && error.name === "AbortError")) {
            toast.textContent =
              "The paperwork jammed. Try the download button.";
          }
        })
        .finally(() => {
          button.disabled = false;
          button.textContent = original;
        });
    },
    { signal },
  );
}
