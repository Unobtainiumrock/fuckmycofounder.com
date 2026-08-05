import type { CookedQuiz, CookedQuizReport } from "@/src/modules/cooked-quiz";

import { renderCardBlob } from "./render-card";

function buildShareUrl(report: CookedQuizReport, quiz: CookedQuiz): string {
  const url = new URL(window.location.href);
  url.hash = quiz.encode(report);
  return url.toString();
}

export async function copyReportLink(
  report: CookedQuizReport,
  quiz: CookedQuiz,
): Promise<void> {
  await navigator.clipboard.writeText(buildShareUrl(report, quiz));
}

export async function downloadReportCard(
  report: CookedQuizReport,
): Promise<void> {
  const blob = await renderCardBlob(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${report.id.toLowerCase()}-incident-report.png`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareReport(
  report: CookedQuizReport,
  quiz: CookedQuiz,
): Promise<string> {
  const url = buildShareUrl(report, quiz);
  const blob = await renderCardBlob(report);
  const file = new File(
    [blob],
    `${report.id.toLowerCase()}-incident-report.png`,
    {
      type: "image/png",
    },
  );
  const shareData = {
    title: "Cofounder Incident Report",
    text: `The board reviewed my cofounder incident. Charge: ${report.charge}.`,
    url,
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
