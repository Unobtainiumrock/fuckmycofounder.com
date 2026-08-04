const API_ROOT = "/api";

async function readJson(response) {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.error ?? "The paperwork jammed.");
  }
  return payload;
}

export function isApiAvailable() {
  return typeof fetch === "function" && navigator.onLine !== false;
}

export async function createCase(payload, avatarBlob = null) {
  const form = new FormData();
  form.set("chargeId", payload.chargeId);
  form.set("incident", payload.incident);
  form.set("quote", payload.quote);
  form.set("translation", payload.translation);
  if (avatarBlob) form.set("avatar", avatarBlob, "avatar.jpg");

  const response = await fetch(`${API_ROOT}/cases`, {
    method: "POST",
    body: form
  });
  return readJson(response);
}

export async function uploadCaseCard(id, cardBlob) {
  const response = await fetch(`${API_ROOT}/cases/${id}`, {
    method: "PUT",
    headers: { "content-type": "image/png" },
    body: cardBlob
  });
  return readJson(response);
}

export async function fetchCase(id) {
  const response = await fetch(`${API_ROOT}/cases/${id}`);
  return readJson(response);
}

export async function publishCase(id) {
  const response = await fetch(`${API_ROOT}/cases/${id}/publish`, { method: "POST" });
  return readJson(response);
}
