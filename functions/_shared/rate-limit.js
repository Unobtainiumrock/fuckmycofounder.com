export async function checkRateLimit(env, request, {
  prefix = "rl",
  limitEnv = "CASE_RATE_LIMIT",
  defaultLimit = 5
} = {}) {
  const limit = Number(env[limitEnv] ?? defaultLimit);
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const hour = new Date().toISOString().slice(0, 13);
  const key = `${prefix}:${ip}:${hour}`;
  const current = Number(await env.FMC_CASES.get(key)) || 0;
  if (current >= limit) return false;
  await env.FMC_CASES.put(key, String(current + 1), { expirationTtl: 7200 });
  return true;
}
