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

export function goToTownBoard() {
  window.location.assign(BOARD_PATH);
}

/**
 * Post a filing to the Town Board. This is the ONLY thing that publishes, and
 * it does nothing else — no share sheet, no navigation. A failure here is
 * reported to the caller rather than swallowed: telling someone to re-file
 * would mint a second case id and orphan the first.
 */
export async function postToBoard(report) {
  if (!report.persisted) {
    throw new Error("This case only lives in your link. Re-file it while the archive is online to post it.");
  }

  const result = await publishCase(report.id);
  markStoryShared(report.id);
  return {
    publishedAt: result.publishedAt,
    alreadyPublished: Boolean(result.alreadyPublished)
  };
}

/** Hand the case file to the OS share sheet. Never publishes. */
export async function shareReport(report) {
  const url = buildShareUrl(report);
  const blob = await cardBlob(report);
  const file = new File([blob], `${report.id.toLowerCase()}-incident-report.png`, { type: "image/png" });
  const shareData = {
    title: "Cofounder Incident Report",
    text: `The board reviewed my cofounder incident. Charge: ${report.charge}.`,
    url
  };

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ ...shareData, files: [file] });
    return "Shared.";
  }
  if (navigator.share) {
    await navigator.share(shareData);
    return "Shared.";
  }

  await navigator.clipboard.writeText(url);
  return "No share sheet here — link copied instead.";
}
