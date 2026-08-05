import { BOARD_PATH, hasSharedStory, reclaimBoardAccess } from "./feed.js";

export function initializeBoardEntry() {
  const entry = document.querySelector("[data-board-entry]");
  if (!entry) return;

  const openLink = entry.querySelector("[data-board-entry-open]");
  const reclaim = entry.querySelector("[data-board-entry-reclaim]");
  const input = entry.querySelector("[data-board-entry-input]");
  const error = entry.querySelector("[data-board-entry-error]");
  const submit = entry.querySelector("[data-board-entry-submit]");
  const returning = entry.querySelector("[data-board-entry-returning]");

  if (hasSharedStory()) {
    entry.classList.add("is-unlocked");
    if (returning) returning.hidden = false;
    if (reclaim) reclaim.hidden = true;
    if (openLink) openLink.textContent = "Open the Town Board →";
  }

  reclaim?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!input || !submit) return;
    if (error) error.textContent = "";
    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Checking the docket…";
    try {
      await reclaimBoardAccess(input.value);
      window.location.assign(BOARD_PATH);
    } catch (err) {
      if (error) error.textContent = err?.message ?? "Could not unseal the board.";
      submit.disabled = false;
      submit.textContent = original;
    }
  });
}
