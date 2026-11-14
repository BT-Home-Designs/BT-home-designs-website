/**
 * Admin session token (HMAC-SHA256 signed, expiring). Uses Web Crypto so
 * the same code runs in middleware (edge) and in Node route handlers.
 *
 * Required env vars — admin is disabled entirely until both are set:
 *   QUOTE_ADMIN_PASSWORD  the owner's dashboard password (12+ characters)
 *   QUOTE_SESSION_SECRET  random string, 32+ characters, used to sign cookies
 */
export const ADMIN_COOKIE = "bt_quote_admin";
export const SESSION_DAYS = 14;

export function adminConfigured(): boolean {
  return (process.env.QUOTE_ADMIN_PASSWORD ?? "").length >= 12 && (process.env.QUOTE_SESSION_SECRET ?? "").length >= 32;
}

function b64url(bytes: ArrayBuffer): string {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmac(message: string): Promise<string> {
  const secret = process.env.QUOTE_SESSION_SECRET ?? "";
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64url(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionValue(now = Date.now()): Promise<string> {
  const expires = now + SESSION_DAYS * 86_400_000;
  return `${expires}.${await hmac(`bt-admin.${expires}`)}`;
}

export async function verifySessionValue(value: string | undefined, now = Date.now()): Promise<boolean> {
  if (!value || !adminConfigured()) return false;
  const [expStr, sig] = value.split(".");
  const expires = Number(expStr);
  if (!Number.isFinite(expires) || expires < now || !sig) return false;
  return safeEqual(sig, await hmac(`bt-admin.${expires}`));
}

/** Constant-time password check (compares HMACs, not raw strings). */
export async function passwordMatches(candidate: string): Promise<boolean> {
  if (!adminConfigured()) return false;
  const [a, b] = await Promise.all([hmac(`pw.${candidate}`), hmac(`pw.${process.env.QUOTE_ADMIN_PASSWORD}`)]);
  return safeEqual(a, b);
}
