import { requireAdmin } from "@/lib/quotes/auth";
import { errorResponse } from "@/lib/quotes/http";
import { pdfFilename, renderQuotePdf } from "@/lib/quotes/pdf";
import { getQuote } from "@/lib/quotes/service";
import { buildCustomerView } from "@/lib/quotes/view";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
    const { id } = await params;
    const quote = await getQuote(id);
    if (!quote) return new Response("Not found", { status: 404 });
    const useDraft = new URL(req.url).searchParams.get("draft") === "1" || !quote.published;
    const view = buildCustomerView(quote, { kind: "admin", quoteId: id, useDraft });
    const pdf = await renderQuotePdf(view);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${pdfFilename(view)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    return errorResponse(err);
  }
}
