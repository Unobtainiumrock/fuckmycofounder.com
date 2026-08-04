import { caseUrls } from "../_shared/case-store.js";
import { error, json } from "../_shared/env.js";
import { FEED_PREFIX } from "../_shared/feed-store.js";

const DEFAULT_LIMIT = 12;
const MAX_LIMIT = 30;

function parseLimit(url) {
  const raw = Number(url.searchParams.get("limit"));
  if (!Number.isInteger(raw) || raw < 1) return DEFAULT_LIMIT;
  return Math.min(raw, MAX_LIMIT);
}

export async function onRequestGet(context) {
  const { env, request } = context;
  if (!env.FMC_CASES) return error("Storage bindings missing.", 503);

  const url = new URL(request.url);
  const limit = parseLimit(url);
  const cursor = url.searchParams.get("cursor") ?? undefined;

  let listing;
  try {
    listing = await env.FMC_CASES.list({ prefix: FEED_PREFIX, limit, cursor });
  } catch {
    return error("Invalid feed cursor.");
  }

  const values = await Promise.all(listing.keys.map(({ name }) => env.FMC_CASES.get(name)));
  const items = [];
  for (const value of values) {
    if (!value) continue;
    try {
      const snapshot = JSON.parse(value);
      const urls = caseUrls(env, request, snapshot.id, snapshot);
      items.push({
        id: snapshot.id,
        chargeId: snapshot.chargeId,
        incident: snapshot.incident,
        quote: snapshot.quote,
        translation: snapshot.translation,
        avatarUrl: urls.avatarUrl,
        createdAt: snapshot.createdAt,
        publishedAt: snapshot.publishedAt
      });
    } catch {
      // Skip malformed snapshots; the feed keeps flowing.
    }
  }

  return json({
    items,
    cursor: listing.list_complete ? null : listing.cursor,
    complete: listing.list_complete
  }, 200, {
    "cache-control": "public, max-age=30"
  });
}
