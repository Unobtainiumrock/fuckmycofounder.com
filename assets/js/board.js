import { initializeBoard } from "./modules/feed.js";

document.querySelector("[data-year]").textContent = String(new Date().getFullYear());
initializeBoard();
