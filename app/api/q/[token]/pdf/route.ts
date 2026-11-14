import { isTokenShaped } from "@/lib/quotes/ids";
import { pdfFilename, renderQuotePdf } from "@/lib/quotes/pdf";
import { getPublishedByToken } from "@/lib/quotes/service";
import { buildCustomerView } from "@/lib/quotes/view";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const quote = isTokenShaped(token) ? await getPublishedByToken(token) : null;
  if (!quote) return new Response("Not found", { status: 404 });
  const view = buildCustomerView(quote, { kind: "customer", token });
  const pdf = await renderQuotePdf(view);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${pdfFilename(view)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
