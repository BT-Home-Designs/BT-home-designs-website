import { NextResponse } from "next/server";
import { formatCents } from "@/lib/quotes/money";
import { errorResponse, readJson, sameOrigin } from "@/lib/quotes/http";
import { isTokenShaped } from "@/lib/quotes/ids";
import { notifyOwner } from "@/lib/quotes/notify";
import { clientIp, rateLimited } from "@/lib/quotes/rateLimit";
import { QuoteError, recordApproval, setEmailStatus } from "@/lib/quotes/service";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  try {
    const { token } = await params;
    if (!isTokenShaped(token) || !sameOrigin(req)) throw new QuoteError("This quote is no longer available.", 404);
    const ip = clientIp(req.headers);
    if (rateLimited(`approve:${ip}`, 10, 10 * 60_000)) throw new QuoteError("Too many attempts. Please wait a few minutes.", 429);
    const body = await readJson(req);
    if (body.agree !== true) throw new QuoteError("Please confirm you've reviewed the quote and terms.");

    // 1) Save the approval FIRST — it is recorded even if email fails.
    const { quote, approval, alreadyApproved } = await recordApproval(token, {
      name: String(body.name ?? ""),
      version: Number(body.version),
      scopeHash: String(body.scopeHash ?? ""),
      ipAddress: ip,
      userAgent: req.headers.get("user-agent") ?? "",
    });

    // 2) Then try to notify the owner (best effort).
    if (!alreadyApproved) {
      const status = await notifyOwner(
        `Quote approved: ${quote.number} — ${quote.published?.content.projectName ?? ""}`,
        [
          ["Quote", quote.number],
          ["Project", quote.published?.content.projectName ?? ""],
          ["Approved by", approval.name],
          ["Version", String(approval.version)],
          ["Total", formatCents(approval.totals.totalCents)],
          ["Deposit", formatCents(approval.totals.depositCents)],
          ["When", approval.at],
        ],
        `/admin/quotes/${quote.id}`
      );
      await setEmailStatus(quote.id, "approval", approval.id, status);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return errorResponse(err);
  }
}
