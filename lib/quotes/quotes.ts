import { prisma } from "@/lib/db/prisma";
import { Prisma, type QuoteStatus, type DiscountType, type DepositType } from "@prisma/client";
import { generateQuoteNumber } from "./quoteNumber";
import { LINE_ITEM_INCLUDE } from "./dto";

function isUniqueConstraintViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

/**
 * generateQuoteNumber() checks for an existing row before returning a
 * candidate, but two concurrent creations can both pass that check before
 * either commits (TOCTOU). Rather than relying on the pre-check alone,
 * retry the actual insert on a unique-constraint conflict with a freshly
 * generated number — the only way to be certain under concurrency.
 */
export async function createQuote(params: { customerId: string; createdById?: string | null; notes?: string | null }) {
  const maxAttempts = 5;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const quoteNumber = await generateQuoteNumber(prisma);
    try {
      return await prisma.quote.create({
        data: {
          quoteNumber,
          customerId: params.customerId,
          createdById: params.createdById ?? null,
          notes: params.notes?.trim() || null,
        },
      });
    } catch (err) {
      if (isUniqueConstraintViolation(err) && attempt < maxAttempts) {
        continue;
      }
      throw err;
    }
  }
  throw new Error("Could not create a quote with a unique quote number after several attempts.");
}

export interface QuoteHeaderInput {
  quoteNumber: string;
  quoteDate: Date;
  status: QuoteStatus;
  notes: string | null;
  /**
   * Quote-level commercial terms only — deliberately NOT used to compute a
   * customer total in Phase 4. Customer selling price is still
   * NOT_CONFIGURED (see QuoteLineItem.sellingPriceStatus); these fields
   * exist so staff can record terms without the UI implying a total has
   * been calculated from them.
   */
  discountType: DiscountType | null;
  discountValue: number | null;
  taxRateBps: number;
  depositType: DepositType | null;
  depositValue: number | null;
  depositPaidCents: number;
}

export async function updateQuoteHeader(id: string, input: QuoteHeaderInput) {
  const quoteNumber = input.quoteNumber.trim();
  if (!quoteNumber) {
    throw new Error("Quote number cannot be empty.");
  }

  return prisma.quote.update({
    where: { id },
    data: {
      quoteNumber,
      quoteDate: input.quoteDate,
      status: input.status,
      notes: input.notes?.trim() || null,
      discountType: input.discountType,
      discountValue: input.discountValue,
      taxRateBps: input.taxRateBps,
      depositType: input.depositType,
      depositValue: input.depositValue,
      depositPaidCents: input.depositPaidCents,
    },
  });
}

export async function getQuoteWithDetails(id: string) {
  return prisma.quote.findUnique({
    where: { id },
    include: {
      customer: true,
      createdBy: true,
      lineItems: {
        orderBy: { sortOrder: "asc" },
        include: LINE_ITEM_INCLUDE,
      },
    },
  });
}

export async function listQuotes() {
  return prisma.quote.findMany({
    include: { customer: true },
    orderBy: { updatedAt: "desc" },
  });
}
