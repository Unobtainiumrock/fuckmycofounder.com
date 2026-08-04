import { fetchThread, postComment } from "./api.js";
import { FIELD_LIMITS } from "./validation.js";

function formatDate(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

function renderComment(item) {
  const note = document.createElement("li");
  note.className = "thread__note";
  note.innerHTML = `
    <p class="thread__body"></p>
    <time class="thread__time"></time>`;
  note.querySelector(".thread__body").textContent = item.body;
  const time = note.querySelector("time");
  time.dateTime = item.createdAt;
  time.textContent = formatDate(item.createdAt);
  return note;
}

export function attachThread(card, caseId) {
  const shell = document.createElement("section");
  shell.className = "thread";
  shell.innerHTML = `
    <button class="thread__toggle" type="button" data-thread-toggle aria-expanded="false">
      <span data-thread-label>Open the thread</span>
      <span data-thread-count></span>
    </button>
    <div class="thread__panel" data-thread-panel hidden>
      <p class="thread__intro">Anonymous corroboration. No accounts. Same redaction rules.</p>
      <ol class="thread__list" data-thread-list></ol>
      <button class="thread__more button button--outline" type="button" data-thread-more hidden>Load earlier notes</button>
      <p class="thread__empty" data-thread-empty hidden>No notes yet. Be the first to add to the story.</p>
      <form class="thread__form" data-thread-form>
        <label class="thread__label" for="thread-${caseId}">
          <span>Add to the story</span>
          <small><span data-thread-count-input>0</span>/${FIELD_LIMITS.comment}</small>
        </label>
        <textarea id="thread-${caseId}" name="body" rows="3" maxlength="${FIELD_LIMITS.comment}" required placeholder="same energy in my seed round — the “quick sync” lasted 90 minutes" data-thread-input></textarea>
        <div class="thread__actions">
          <button class="button button--red" type="submit" data-thread-submit>Corroborate</button>
          <p class="thread__error" data-thread-error role="status" aria-live="polite"></p>
        </div>
      </form>
    </div>`;

  card.append(shell);

  const toggle = shell.querySelector("[data-thread-toggle]");
  const panel = shell.querySelector("[data-thread-panel]");
  const list = shell.querySelector("[data-thread-list]");
  const more = shell.querySelector("[data-thread-more]");
  const empty = shell.querySelector("[data-thread-empty]");
  const label = shell.querySelector("[data-thread-label]");
  const countBadge = shell.querySelector("[data-thread-count]");
  const form = shell.querySelector("[data-thread-form]");
  const input = shell.querySelector("[data-thread-input]");
  const counter = shell.querySelector("[data-thread-count-input]");
  const error = shell.querySelector("[data-thread-error]");
  const submit = shell.querySelector("[data-thread-submit]");

  let cursor = null;
  let complete = false;
  let loading = false;
  let loaded = false;
  let commentCount = 0;

  function setCount(next) {
    commentCount = next;
    countBadge.textContent = commentCount > 0 ? String(commentCount) : "";
    label.textContent = commentCount > 0
      ? `Thread · ${commentCount} note${commentCount === 1 ? "" : "s"}`
      : "Open the thread";
    empty.hidden = list.childElementCount > 0;
  }

  async function loadPage({ reset = false } = {}) {
    if (loading) return;
    loading = true;
    more.disabled = true;
    more.textContent = "Pulling the minutes…";
    try {
      if (reset) {
        cursor = null;
        complete = false;
        list.replaceChildren();
      }
      const data = await fetchThread(caseId, { cursor });
      const nodes = data.items.map(renderComment);
      if (reset || !list.childElementCount) {
        list.replaceChildren(...nodes);
      } else {
        const fragment = document.createDocumentFragment();
        for (const node of nodes) fragment.append(node);
        list.prepend(fragment);
      }
      cursor = data.cursor;
      complete = data.complete || !data.cursor;
      setCount(data.thread?.commentCount ?? list.childElementCount);
      loaded = true;
    } catch {
      error.textContent = "Thread clerk is on a quick sync. Try again.";
    } finally {
      loading = false;
      more.disabled = false;
      more.textContent = "Load earlier notes";
      more.hidden = complete || !cursor;
      empty.hidden = list.childElementCount > 0;
    }
  }

  toggle.addEventListener("click", async () => {
    const open = panel.hidden;
    panel.hidden = !open;
    toggle.setAttribute("aria-expanded", String(open));
    if (open && !loaded) await loadPage({ reset: true });
  });

  more.addEventListener("click", () => loadPage());

  input.addEventListener("input", () => {
    counter.textContent = String(input.value.length);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    error.textContent = "";
    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Filing note…";
    try {
      const data = await postComment(caseId, input.value);
      list.append(renderComment(data.comment));
      setCount(data.thread?.commentCount ?? commentCount + 1);
      input.value = "";
      counter.textContent = "0";
      empty.hidden = true;
      if (panel.hidden) {
        panel.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
      }
    } catch (err) {
      error.textContent = err?.message ?? "Could not file that note.";
    } finally {
      submit.disabled = false;
      submit.textContent = original;
    }
  });

  // Lightweight count probe so cards show thread size before open.
  fetchThread(caseId, { limit: 1 }).then((data) => {
    setCount(data.thread?.commentCount ?? 0);
  }).catch(() => {
    setCount(0);
  });
}
