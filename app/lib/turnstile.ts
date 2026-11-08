// Server-side check of a Cloudflare Turnstile token (the contact form's bot
// check). Free; the secret stays on the server (TURNSTILE_SECRET_KEY).

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
// Cloudflare's documented maximum token length.
const MAX_TOKEN_LENGTH = 2048;

export type TurnstileResult = { ok: true } | { ok: false; reason: string };

type FetchLike = (url: string, init: { method: string; body: URLSearchParams; signal?: AbortSignal }) => Promise<{
  json: () => Promise<unknown>;
}>;

export async function verifyTurnstile({
  token,
  secret,
  ip,
  fetchImpl = fetch,
  timeoutMs = 5000,
}: {
  token: unknown;
  secret: string;
  /** The visitor's IP, if known; Cloudflare uses it as an extra signal. */
  ip?: string;
  fetchImpl?: FetchLike;
  timeoutMs?: number;
}): Promise<TurnstileResult> {
  if (typeof token !== "string" || token.length === 0 || token.length > MAX_TOKEN_LENGTH) {
    return { ok: false, reason: "missing-or-invalid-token" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const res = await fetchImpl(SITEVERIFY_URL, { method: "POST", body, signal: AbortSignal.timeout(timeoutMs) });
    const data = (await res.json()) as { success?: unknown; "error-codes"?: unknown };
    if (data.success === true) return { ok: true };
    const codes = Array.isArray(data["error-codes"]) ? data["error-codes"].join(",") : "";
    return { ok: false, reason: codes || "rejected" };
  } catch {
    // Cloudflare unreachable or slow: fail closed; the visitor is told to email instead.
    return { ok: false, reason: "siteverify-unreachable" };
  }
}
