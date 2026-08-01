import { initializeReportDialog } from "./modules/dialog.js";

document.querySelector("[data-year]").textContent = String(new Date().getFullYear());
document.querySelector("[data-case-ticker]").textContent = String(Math.floor(Date.now() / 86400000) % 1000000).padStart(6, "0");
initializeReportDialog();
