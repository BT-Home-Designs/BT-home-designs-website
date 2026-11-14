import "server-only";
import { NextResponse } from "next/server";
import { QuoteError } from "./service";

export function errorResponse(err: unknown) {
  if (err instanceof QuoteError) return NextResponse.json({ error: err.message }, { status: err.status });
  console.error("[quotes] unexpected error", err);
  return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 });
}

/** Reject cross-site POSTs (customer actions are only ever sent from our own page). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; the token is still required
  try {
    return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host"));
  } catch {
    return false;
  }
}

export async function readJson(req: Request): Promise<Record<string, unknown>> {
  const text = await req.text();
  if (text.length > 20_000) throw new QuoteError("Request too large.", 413);
  try {
    const data = JSON.parse(text);
    return data && typeof data === "object" ? data : {};
  } catch {
    throw new QuoteError("Invalid request.");
  }
}
