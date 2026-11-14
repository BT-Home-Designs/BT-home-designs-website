import { notFound } from "next/navigation";
import { QuoteEditor } from "@/components/admin/QuoteEditor";
import { toAdminQuote } from "@/lib/quotes/admin";
import { isIdShaped } from "@/lib/quotes/ids";
import { getQuote } from "@/lib/quotes/service";

export const dynamic = "force-dynamic";

export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quote = isIdShaped(id) ? await getQuote(id) : null;
  if (!quote) notFound();
  return <QuoteEditor initial={toAdminQuote(quote)} />;
}
