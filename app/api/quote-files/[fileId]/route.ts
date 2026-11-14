import { isAdmin } from "@/lib/quotes/auth";
import { isIdShaped, isTokenShaped } from "@/lib/quotes/ids";
import { getPublishedByToken } from "@/lib/quotes/service";
import { getStore } from "@/lib/quotes/store";
import type { QuoteContent } from "@/lib/quotes/types";

export const dynamic = "force-dynamic";

function referencedFileIds(content: QuoteContent): Set<string> {
  const ids = new Set<string>();
  if (content.coverPhotoId) ids.add(content.coverPhotoId);
  for (const p of content.pages) for (const ph of p.photos) ids.add(ph.id);
  return ids;
}

/**
 * Private photo access. Customers may only fetch photos that appear in the
 * PUBLISHED version of the quote their own link points to; the owner (signed
 * in) may fetch any photo. Everything else gets the same 404.
 */
export async function GET(req: Request, { params }: { params: Promise<{ fileId: string }> }) {
  const { fileId } = await params;
  const notFound = () => new Response("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
  if (!isIdShaped(fileId)) return notFound();

  let allowed = await isAdmin();
  if (!allowed) {
    const token = new URL(req.url).searchParams.get("t") ?? "";
    if (!isTokenShaped(token)) return notFound();
    const quote = await getPublishedByToken(token);
    allowed = Boolean(quote?.published && referencedFileIds(quote.published.content).has(fileId));
  }
  if (!allowed) return notFound();

  const file = await (await getStore()).getFile(fileId);
  if (!file) return notFound();
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "private, max-age=600",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'",
      "X-Robots-Tag": "noindex",
    },
  });
}
