import { encodeReport } from "./codec.js";

async function renderCard(report) {
  const { renderCardBlob } = await import("./card-renderer.js");
  return renderCardBlob(report);
}

export function buildShareUrl(report) {
  const url = new URL(window.location.href);
  url.hash = `r=${encodeReport(report)}`;
  return url.toString();
}

export async function copyReportLink(report) {
  await navigator.clipboard.writeText(buildShareUrl(report));
}

export async function downloadReportCard(report) {
  const blob = await renderCard(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${report.id.toLowerCase()}-incident-report.png`;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareReport(report) {
  const url = buildShareUrl(report);
  const blob = await renderCard(report);
  const file = new File([blob], `${report.id.toLowerCase()}-incident-report.png`, { type: "image/png" });
  const shareData = {
    title: "Cofounder Incident Report",
    text: `The board reviewed my cofounder incident. Charge: ${report.charge}.`,
    url
  };

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ ...shareData, files: [file] });
    return "Shared. The board denies involvement.";
  }
  if (navigator.share) {
    await navigator.share(shareData);
    return "Shared. The board denies involvement.";
  }
  await navigator.clipboard.writeText(url);
  return "Link copied. Paste it somewhere emotionally expensive.";
}
