export function mediaBaseUrl(env, request) {
  if (env.MEDIA_BASE_URL) return env.MEDIA_BASE_URL.replace(/\/$/u, "");
  return new URL(request.url).origin;
}

export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...headers
    }
  });
}

export function error(message, status = 400) {
  return json({ error: message }, status);
}
