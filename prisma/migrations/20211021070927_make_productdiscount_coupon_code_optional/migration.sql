-- DropIndex
DROP INDEX "location.street_unique";

-- AlterTable
ALTER TABLE "productDiscount" ALTER COLUMN "couponCode" DROP NOT NULL;
