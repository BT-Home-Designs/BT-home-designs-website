-- CreateEnum
CREATE TYPE "CashCreditPricingStatus" AS ENUM ('SUCCESS', 'NOT_CONFIGURED');

-- AlterEnum
ALTER TYPE "SellingPriceRuleType" ADD VALUE 'CASH_CREDIT_FORMULA';

-- AlterTable
ALTER TABLE "quote_line_items" ADD COLUMN     "currentCashCreditSnapshotId" TEXT;

-- CreateTable
CREATE TABLE "cash_credit_pricing_configs" (
    "id" TEXT NOT NULL,
    "markupBps" INTEGER NOT NULL,
    "cardFeeBps" INTEGER NOT NULL,
    "status" "BusinessPricingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cash_credit_pricing_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cash_credit_price_snapshots" (
    "id" TEXT NOT NULL,
    "quoteLineItemId" TEXT NOT NULL,
    "status" "CashCreditPricingStatus" NOT NULL,
    "costOfGoodsCents" INTEGER,
    "laborCents" INTEGER,
    "totalInternalCostCents" INTEGER,
    "appliedMarkupBps" INTEGER,
    "markupAmountCents" INTEGER,
    "cashPriceCents" INTEGER,
    "appliedCardFeeBps" INTEGER,
    "creditCardFeeCents" INTEGER,
    "creditCardPriceCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cash_credit_price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "quote_line_items_currentCashCreditSnapshotId_key" ON "quote_line_items"("currentCashCreditSnapshotId");

-- AddForeignKey
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_currentCashCreditSnapshotId_fkey" FOREIGN KEY ("currentCashCreditSnapshotId") REFERENCES "cash_credit_price_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cash_credit_price_snapshots" ADD CONSTRAINT "cash_credit_price_snapshots_quoteLineItemId_fkey" FOREIGN KEY ("quoteLineItemId") REFERENCES "quote_line_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

