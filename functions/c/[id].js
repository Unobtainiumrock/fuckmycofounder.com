import { CHARGES } from "../../assets/js/modules/content.js";
import { getCaseRecord, isValidCaseId } from "../_shared/case-store.js";
import { mediaBaseUrl } from "../_shared/env.js";

const CHARGE_LABELS = Object.fromEntries(CHARGES.map(({ id, label }) => [id, label]));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;");
}

function snippet(text, max = 120) {
  const clean = text.trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

export async function onRequestGet(context) {
  const { env, request, params } = context;
  const id = params.id;
  if (!isValidCaseId(id)) return new Response("Not found", { status: 404 });

  const record = env.FMC_CASES ? await getCaseRecord(env, id) : null;
  const base = mediaBaseUrl(env, request);
  const origin = new URL(request.url).origin;
  const cardUrl = record?.cardKey ? `${base}/cards/${id}` : `${origin}/assets/images/share-card.png`;
  const chargeLabel = CHARGE_LABELS[record?.chargeId] ?? "Cofounder Incident Report";
  const description = record
    ? `Charge: ${chargeLabel}. ${snippet(record.incident)}`
    : "Some startups need a pivot. Some need an incident report.";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(id)} — Fuck My Cofounder</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(chargeLabel)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:url" content="${origin}/c/${id}">
    <meta property="og:image" content="${escapeHtml(cardUrl)}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(chargeLabel)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(cardUrl)}">
    <link rel="canonical" href="${origin}/c/${id}">
    <meta http-equiv="refresh" content="0;url=${origin}/#c=${id}">
    <script>location.replace("${origin}/#c=${id}");</script>
  </head>
  <body>
    <p>Redirecting to <a href="${origin}/#c=${id}">${escapeHtml(id)}</a>…</p>
  </body>
</html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "public, max-age=300"
    }
  });
}
