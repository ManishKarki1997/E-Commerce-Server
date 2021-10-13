/*
  Warnings:

  - You are about to drop the column `contactInfoId` on the `location` table. All the data in the column will be lost.
  - You are about to drop the column `contactInfoId` on the `phoneNumber` table. All the data in the column will be lost.
  - You are about to drop the column `contactInfoId` on the `socialMedia` table. All the data in the column will be lost.
  - You are about to drop the `contactInfo` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[brandInfoId]` on the table `location` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "contactInfo" DROP CONSTRAINT "contactInfo_brandInfoId_fkey";

-- DropForeignKey
ALTER TABLE "location" DROP CONSTRAINT "location_contactInfoId_fkey";

-- DropForeignKey
ALTER TABLE "phoneNumber" DROP CONSTRAINT "phoneNumber_contactInfoId_fkey";

-- DropForeignKey
ALTER TABLE "socialMedia" DROP CONSTRAINT "socialMedia_contactInfoId_fkey";

-- DropIndex
DROP INDEX "location_contactInfoId_unique";

-- AlterTable
ALTER TABLE "location" DROP COLUMN "contactInfoId",
ADD COLUMN     "brandInfoId" INTEGER;

-- AlterTable
ALTER TABLE "phoneNumber" DROP COLUMN "contactInfoId",
ADD COLUMN     "brandInfoId" INTEGER;

-- AlterTable
ALTER TABLE "socialMedia" DROP COLUMN "contactInfoId",
ADD COLUMN     "brandInfoId" INTEGER;

-- DropTable
DROP TABLE "contactInfo";

-- CreateIndex
CREATE UNIQUE INDEX "location_brandInfoId_unique" ON "location"("brandInfoId");

-- AddForeignKey
ALTER TABLE "phoneNumber" ADD FOREIGN KEY ("brandInfoId") REFERENCES "brandInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socialMedia" ADD FOREIGN KEY ("brandInfoId") REFERENCES "brandInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD FOREIGN KEY ("brandInfoId") REFERENCES "brandInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;
