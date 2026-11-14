import { NextResponse } from "next/server";
import { errorResponse, readJson, sameOrigin } from "@/lib/quotes/http";
import { isTokenShaped } from "@/lib/quotes/ids";
import { notifyOwner } from "@/lib/quotes/notify";
import { clientIp, rateLimited } from "@/lib/quotes/rateLimit";
import { QuoteError, recordChangeRequest, setEmailStatus } from "@/lib/quotes/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!isTokenShaped(token) || !sameOrigin(req)) throw new QuoteError("This quote is no longer available.", 404);
    if (rateLimited(`changes:${clientIp(req.headers)}`, 6, 10 * 60_000)) throw new QuoteError("Too many requests. Please wait a few minutes.", 429);
    const body = await readJson(req);
    const { quote, request } = await recordChangeRequest(token, { name: String(body.name ?? ""), message: String(body.message ?? "") });
    const status = await notifyOwner(
      `Change request: ${quote.number} — ${quote.published?.content.projectName ?? ""}`,
      [
        ["Quote", quote.number],
        ["From", request.name],
        ["Version", String(request.version)],
        ["Message", request.message],
      ],
      `/admin/quotes/${quote.id}`
    );
    await setEmailStatus(quote.id, "change", request.id, status);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
