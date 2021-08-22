/*
  Warnings:

  - You are about to alter the column `basePrice` on the `productPricing` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.

*/
-- AlterTable
ALTER TABLE "productPricing" ALTER COLUMN "basePrice" SET DATA TYPE DECIMAL(65,30);
