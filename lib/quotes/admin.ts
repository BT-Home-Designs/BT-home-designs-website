import "server-only";
import { computeTotals, currentApproval, quoteStatus, STATUS_LABELS, sumPayments, type StatusKey, type Totals } from "./calc";
import type { Quote } from "./types";

/** Everything the owner dashboard needs about one quote (owner-only — includes internal fields). */
export type AdminQuote = Quote & {
  status: StatusKey;
  statusLabel: string;
  publishedTotals: Totals | null;
  hasUnpublishedChanges: boolean;
  isApprovedCurrent: boolean;
  openChangeRequests: number;
};

export function toAdminQuote(q: Quote): AdminQuote {
  const status = quoteStatus(q);
  return {
    ...q,
    status,
    statusLabel: STATUS_LABELS[status],
    publishedTotals: q.published ? computeTotals(q.published.content, sumPayments(q)) : null,
    hasUnpublishedChanges: !q.published || JSON.stringify(q.published.content) !== JSON.stringify(q.draft),
    isApprovedCurrent: Boolean(currentApproval(q)),
    openChangeRequests: q.changeRequests.filter((c) => !c.resolvedAt).length,
  };
}
