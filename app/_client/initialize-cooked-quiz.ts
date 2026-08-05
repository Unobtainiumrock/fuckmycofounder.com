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
  const toast = requireElement<HTMLElement>(dialog, "[data-toast]");
  let currentReport: CookedQuizReport | undefined;

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
  };

  const displayReport = (report: CookedQuizReport): void => {
    currentReport = report;
    renderReport(report, dialog);
    showStep(3);
    openDialog();
  };

  const resetReport = (): void => {
    form.reset();
    currentReport = undefined;
    clearErrors();
    for (const counter of form.querySelectorAll<HTMLElement>("[data-count]")) {
      counter.textContent = "0";
    }
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

function renderReport(report: CookedQuizReport, root: ParentNode): void {
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
