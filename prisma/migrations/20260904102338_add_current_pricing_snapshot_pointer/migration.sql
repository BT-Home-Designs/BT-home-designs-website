-- AlterTable
ALTER TABLE "quote_line_items" ADD COLUMN     "currentPricingSnapshotId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "quote_line_items_currentPricingSnapshotId_key" ON "quote_line_items"("currentPricingSnapshotId");

-- AddForeignKey
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_currentPricingSnapshotId_fkey" FOREIGN KEY ("currentPricingSnapshotId") REFERENCES "pricing_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: point every existing line item at its most recent pricing
-- snapshot (by createdAt), matching the "latest attempt for the current
-- inputs" semantics the application now maintains going forward. This is
-- a one-time data migration, not a change to any historical snapshot row
-- — no PricingSnapshot data is modified, only this new pointer column.
UPDATE "quote_line_items" AS li
SET "currentPricingSnapshotId" = latest.id
FROM (
  SELECT DISTINCT ON ("quoteLineItemId") id, "quoteLineItemId"
  FROM "pricing_snapshots"
  ORDER BY "quoteLineItemId", "createdAt" DESC
) AS latest
WHERE latest."quoteLineItemId" = li.id;
