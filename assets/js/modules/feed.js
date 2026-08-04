import { fetchCase } from "./api.js";
import { normalizeCaseId } from "./codec.js";
import { buildReport } from "./report.js";

const PAGE_LIMIT = 12;
const STORAGE_KEY = "fmc:shared-case";
export const STORY_SHARED_EVENT = "fmc:story-shared";

export function hasSharedStory() {
  try {
    return Boolean(localStorage.getItem(STORAGE_KEY));
  } catch {
    return false;
  }
}

export function markStoryShared(caseId) {
  try {
    localStorage.setItem(STORAGE_KEY, caseId);
  } catch {
    // Private mode: the gate simply stays session-local.
  }
  document.dispatchEvent(new CustomEvent(STORY_SHARED_EVENT, { detail: { caseId } }));
}

/** Verify a published case and unseal the Town Board for this browser. */
export async function reclaimBoardAccess(rawId) {
  const id = normalizeCaseId(rawId);
  if (!id) {
    throw new Error("Enter a case id like FMC-ABC2345.");
  }

  let data;
  try {
    data = await fetchCase(id);
  } catch {
    throw new Error("That case file expired or never existed.");
  }

  if (!data.publishedAt) {
    throw new Error("Filed, but not posted yet. Hit Share the evidence first.");
  }

  markStoryShared(id);
  return id;
}

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(date).toUpperCase();
}

function renderItem(item) {
  const report = buildReport({
    chargeId: item.chargeId,
    incident: item.incident,
    quote: item.quote,
    translation: item.translation,
    id: item.id,
    avatarUrl: item.avatarUrl,
    persisted: true
  });

  const card = document.createElement("article");
  card.className = "board-card";
  card.innerHTML = `
    <header class="board-card__topline">
      <a class="board-card__id" href="/c/${report.id}"></a>
      <time></time>
    </header>
    <div class="board-card__charge"></div>
    <div class="board-card__row">
      <img class="board-card__avatar" alt="" hidden loading="lazy">
      <div class="board-card__lore">
        <p class="board-card__incident"></p>
        <p class="board-card__quote"></p>
        <p class="board-card__translation"></p>
      </div>
    </div>
    <footer class="board-card__footer"></footer>`;

  card.querySelector(".board-card__id").textContent = `CASE #${report.id}`;
  const time = card.querySelector("time");
  time.dateTime = item.publishedAt ?? "";
  time.textContent = formatDate(item.publishedAt);
  card.querySelector(".board-card__charge").textContent = report.charge;
  card.querySelector(".board-card__incident").textContent = `My cofounder ${report.incident}.`;
  card.querySelector(".board-card__quote").textContent = `“${report.quote}”`;
  card.querySelector(".board-card__translation").textContent = `Adult translation: ${report.translation}`;
  card.querySelector(".board-card__footer").textContent = report.disposition;

  if (report.avatarUrl) {
    const avatar = card.querySelector(".board-card__avatar");
    avatar.hidden = false;
    avatar.src = report.avatarUrl;
    avatar.alt = "Subject mugshot";
  }
  return card;
}

export function initializeBoard() {
  const board = document.querySelector("[data-board]");
  if (!board) return;

  const locked = board.querySelector("[data-board-locked]");
  const feed = board.querySelector("[data-board-feed]");
  const status = board.querySelector("[data-board-status]");
  const moreButton = board.querySelector("[data-board-more]");
  const endNote = board.querySelector("[data-board-end]");
  const sentinel = board.querySelector("[data-board-sentinel]");
  const reclaimForm = board.querySelector("[data-board-reclaim]");
  const reclaimInput = board.querySelector("[data-board-reclaim-input]");
  const reclaimError = board.querySelector("[data-board-reclaim-error]");
  const reclaimButton = board.querySelector("[data-board-reclaim-submit]");

  let cursor = null;
  let complete = false;
  let loading = false;
  let unlocked = false;

  async function loadPage() {
    if (loading || complete) return;
    loading = true;
    moreButton.disabled = true;
    moreButton.textContent = "Pulling the minutes…";

    try {
      const params = new URLSearchParams({ limit: String(PAGE_LIMIT) });
      if (cursor) params.set("cursor", cursor);
      const response = await fetch(`/api/feed?${params}`);
      if (!response.ok) throw new Error("Feed unavailable.");
      const data = await response.json();

      for (const item of data.items) feed.append(renderItem(item));
      cursor = data.cursor;
      complete = data.complete || !data.cursor;

      if (feed.childElementCount === 0) {
        status.textContent = "NO FILINGS YET. BE THE PROBLEM.";
      } else {
        status.textContent = "LIVE FILINGS / NEWEST FIRST";
      }
    } catch {
      status.textContent = "THE ARCHIVE CLERK IS ON A QUICK SYNC. TRY AGAIN.";
      complete = false;
    } finally {
      loading = false;
      moreButton.disabled = false;
      moreButton.textContent = "Load more filings";
      moreButton.hidden = complete || !cursor;
      endNote.hidden = !(complete && feed.childElementCount > 0);
    }
  }

  function unlock() {
    if (unlocked) return;
    unlocked = true;
    locked.hidden = true;
    feed.hidden = false;
    loadPage();
  }

  moreButton.addEventListener("click", loadPage);

  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      if (unlocked && entries.some(({ isIntersecting }) => isIntersecting)) loadPage();
    }, { rootMargin: "600px 0px" }).observe(sentinel);
  }

  reclaimForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!reclaimInput || !reclaimButton) return;
    if (reclaimError) reclaimError.textContent = "";
    reclaimButton.disabled = true;
    const original = reclaimButton.textContent;
    reclaimButton.textContent = "Checking the docket…";
    try {
      await reclaimBoardAccess(reclaimInput.value);
      reclaimInput.value = "";
    } catch (error) {
      if (reclaimError) reclaimError.textContent = error?.message ?? "Could not unseal the board.";
    } finally {
      reclaimButton.disabled = false;
      reclaimButton.textContent = original;
    }
  });

  document.addEventListener(STORY_SHARED_EVENT, unlock);
  if (hasSharedStory()) unlock();
  else status.textContent = "SEALED PENDING YOUR TESTIMONY";
}
