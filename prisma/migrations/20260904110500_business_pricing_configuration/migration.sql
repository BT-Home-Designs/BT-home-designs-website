-- CreateEnum
CREATE TYPE "BusinessPricingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'PENDING_VERIFICATION');

-- AlterEnum
ALTER TYPE "SellingPriceRuleType" ADD VALUE 'SQUARE_FOOT_FORMULA';

-- AlterTable
ALTER TABLE "fixed_price_options" DROP COLUMN "active",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "status" "BusinessPricingStatus" NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE "quote_line_items" ADD COLUMN     "archPanelCount" INTEGER,
ADD COLUMN     "currentSquareFootSnapshotId" TEXT,
ADD COLUMN     "doorCutoutCount" INTEGER;

-- CreateTable
CREATE TABLE "square_foot_pricing_rules" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "ratePerSquareFootCents" INTEGER NOT NULL,
    "archChargeCents" INTEGER NOT NULL DEFAULT 0,
    "doorCutoutChargeCents" INTEGER NOT NULL DEFAULT 0,
    "status" "BusinessPricingStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "square_foot_pricing_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "installation_trip_minimum_rules" (
    "id" TEXT NOT NULL,
    "minimumChargeCents" INTEGER NOT NULL,
    "qualifiesUnderShadeCount" INTEGER NOT NULL,
    "status" "BusinessPricingStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "installation_trip_minimum_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "square_foot_price_snapshots" (
    "id" TEXT NOT NULL,
    "quoteLineItemId" TEXT NOT NULL,
    "status" "PricingStatus" NOT NULL,
    "actualWidth" DECIMAL(7,3),
    "actualHeight" DECIMAL(7,3),
    "archPanelCount" INTEGER,
    "doorCutoutCount" INTEGER,
    "quantity" INTEGER NOT NULL,
    "appliedRatePerSquareFootCents" INTEGER,
    "appliedArchChargeCents" INTEGER,
    "appliedDoorCutoutChargeCents" INTEGER,
    "squareFeet" DECIMAL(12,6),
    "perUnitBaseCents" INTEGER,
    "archChargeTotalCents" INTEGER,
    "doorCutoutChargeTotalCents" INTEGER,
    "totalCents" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "square_foot_price_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "square_foot_pricing_rules_productId_key" ON "square_foot_pricing_rules"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "quote_line_items_currentSquareFootSnapshotId_key" ON "quote_line_items"("currentSquareFootSnapshotId");

-- AddForeignKey
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_currentSquareFootSnapshotId_fkey" FOREIGN KEY ("currentSquareFootSnapshotId") REFERENCES "square_foot_price_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "square_foot_pricing_rules" ADD CONSTRAINT "square_foot_pricing_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "square_foot_price_snapshots" ADD CONSTRAINT "square_foot_price_snapshots_quoteLineItemId_fkey" FOREIGN KEY ("quoteLineItemId") REFERENCES "quote_line_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

