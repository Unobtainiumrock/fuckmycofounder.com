import { publishCase } from "./api.js";
import { encodeReport } from "./codec.js";
import { BOARD_PATH, markStoryShared } from "./feed.js";

async function renderCard(report) {
  const { renderCardBlob } = await import("./card-renderer.js");
  return renderCardBlob(report);
}

async function cardBlob(report) {
  if (report.cardUrl) {
    try {
      const response = await fetch(report.cardUrl);
      if (response.ok) return response.blob();
    } catch {
      // An unreachable stored card is not fatal: re-render it locally instead.
    }
  }
  return renderCard(report);
}

export function buildShareUrl(report) {
  const url = new URL(window.location.origin);
  if (report.persisted) {
    url.pathname = `/c/${report.id}`;
    url.hash = "";
    return url.toString();
  }
  url.pathname = "/";
  url.hash = `r=${encodeReport(report)}`;
  return url.toString();
}

export async function copyReportLink(report) {
  await navigator.clipboard.writeText(buildShareUrl(report));
}

export async function downloadReportCard(report) {
  const blob = await cardBlob(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${report.id.toLowerCase()}-incident-report.png`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function goToTownBoard() {
  window.location.assign(BOARD_PATH);
}

export async function shareReport(report) {
  let posted = false;
  if (report.persisted) {
    try {
      await publishCase(report.id);
      markStoryShared(report.id);
      posted = true;
    } catch {
      // Board post failing should never block the native share.
    }
  }

  const url = buildShareUrl(report);
  const blob = await cardBlob(report);
  const file = new File([blob], `${report.id.toLowerCase()}-incident-report.png`, { type: "image/png" });
  const shareData = {
    title: "Cofounder Incident Report",
    text: `The board reviewed my cofounder incident. Charge: ${report.charge}.`,
    url
  };

  let sharedNatively = false;
  try {
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ ...shareData, files: [file] });
      sharedNatively = true;
    } else if (navigator.share) {
      await navigator.share(shareData);
      sharedNatively = true;
    } else {
      await navigator.clipboard.writeText(url);
    }
  } catch (error) {
    // Cancelled share sheet after a successful post still earns the board.
    if (posted) goToTownBoard();
    throw error;
  }

  if (posted) {
    goToTownBoard();
    return `Posted to the Town Board. Board key: ${report.id}.`;
  }

  return sharedNatively
    ? "Shared. File again and share to reach the Town Board."
    : "Link copied. Share the evidence to post it to the Town Board.";
}
