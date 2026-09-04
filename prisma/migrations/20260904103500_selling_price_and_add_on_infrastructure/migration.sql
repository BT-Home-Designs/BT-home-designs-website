-- CreateEnum
CREATE TYPE "SellingPriceRuleType" AS ENUM ('MULTIPLIER', 'MARKUP_PERCENT', 'TARGET_MARGIN', 'FIXED_AMOUNT', 'MANUAL');

-- AlterTable
ALTER TABLE "quote_line_items" ADD COLUMN     "sellingPriceMethod" "SellingPriceRuleType",
ADD COLUMN     "sellingPriceReason" TEXT,
ADD COLUMN     "sellingPriceRuleId" TEXT,
ADD COLUMN     "sellingPriceSetAt" TIMESTAMP(3),
ADD COLUMN     "sellingPriceSetById" TEXT;

-- CreateTable
CREATE TABLE "selling_price_rules" (
    "id" TEXT NOT NULL,
    "productId" TEXT,
    "productType" "ProductType",
    "vendorId" TEXT,
    "ruleType" "SellingPriceRuleType" NOT NULL,
    "multiplierBps" INTEGER,
    "markupPercentBps" INTEGER,
    "targetMarginBps" INTEGER,
    "fixedAmountCents" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "selling_price_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fixed_price_options" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "costCents" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fixed_price_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "selling_price_rules_productId_key" ON "selling_price_rules"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "selling_price_rules_productType_key" ON "selling_price_rules"("productType");

-- CreateIndex
CREATE UNIQUE INDEX "selling_price_rules_vendorId_key" ON "selling_price_rules"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "fixed_price_options_name_key" ON "fixed_price_options"("name");

-- AddForeignKey
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_sellingPriceRuleId_fkey" FOREIGN KEY ("sellingPriceRuleId") REFERENCES "selling_price_rules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_line_items" ADD CONSTRAINT "quote_line_items_sellingPriceSetById_fkey" FOREIGN KEY ("sellingPriceSetById") REFERENCES "internal_users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selling_price_rules" ADD CONSTRAINT "selling_price_rules_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "selling_price_rules" ADD CONSTRAINT "selling_price_rules_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

