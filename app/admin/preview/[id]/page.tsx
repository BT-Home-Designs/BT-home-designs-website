import { notFound, redirect } from "next/navigation";
import { QuotePresentation } from "@/components/quote/QuotePresentation";
import { isAdmin } from "@/lib/quotes/auth";
import { isIdShaped } from "@/lib/quotes/ids";
import { getQuote } from "@/lib/quotes/service";
import { buildCustomerView } from "@/lib/quotes/view";

export const dynamic = "force-dynamic";

/** Owner preview of the current DRAFT, exactly as the customer page will render it. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) redirect("/admin/login");
  const { id } = await params;
  const quote = isIdShaped(id) ? await getQuote(id) : null;
  if (!quote) notFound();
  return <QuotePresentation view={buildCustomerView(quote, { kind: "admin", quoteId: id, useDraft: true })} />;
}
