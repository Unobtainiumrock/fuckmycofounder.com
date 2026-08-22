import { BOARD_PATH, hasSharedStory, lookupBoardKey, publishBoardKey } from "./feed.js";

export function initializeBoardEntry() {
  const entry = document.querySelector("[data-board-entry]");
  if (!entry) return;

  const form = entry.querySelector("[data-board-entry-reclaim]");
  const input = entry.querySelector("[data-board-entry-input]");
  const error = entry.querySelector("[data-board-entry-error]");
  const submit = entry.querySelector("[data-board-entry-submit]");
  const returning = entry.querySelector("[data-board-entry-returning]");
  const rescue = entry.querySelector("[data-board-entry-rescue]");
  const rescueButton = entry.querySelector("[data-board-entry-post]");

  let stranded = null;

  if (hasSharedStory() && returning) returning.hidden = false;

  function resetRescue() {
    stranded = null;
    if (rescue) rescue.hidden = true;
  }

  async function withBusy(button, label, action) {
    const original = button.textContent;
    button.disabled = true;
    button.textContent = label;
    try {
      await action();
    } catch (err) {
      if (error) error.textContent = err?.message ?? "Could not reach the archive.";
    } finally {
      button.disabled = false;
      button.textContent = original;
    }
  }

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!input || !submit) return;
    if (error) error.textContent = "";
    resetRescue();

    withBusy(submit, "Checking the docket…", async () => {
      const { id, publishedAt } = await lookupBoardKey(input.value);
      if (publishedAt) {
        window.location.assign(`/c/${id}`);
        return;
      }
      // Filed but never posted — the exact state a half-finished share leaves
      // behind. Offer the one POST that fixes it instead of a dead end.
      stranded = id;
      if (rescue) rescue.hidden = false;
      if (error) error.textContent = `Case ${id} was filed but never posted to the board.`;
    });
  });

  rescueButton?.addEventListener("click", () => {
    if (!stranded || !rescueButton) return;
    if (error) error.textContent = "";
    withBusy(rescueButton, "Posting…", async () => {
      await publishBoardKey(stranded);
      window.location.assign(BOARD_PATH);
    });
  });
}
