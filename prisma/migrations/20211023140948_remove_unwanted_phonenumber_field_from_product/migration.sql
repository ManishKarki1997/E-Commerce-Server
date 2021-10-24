/*
  Warnings:

  - You are about to drop the column `locationId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumberId` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "locationId",
DROP COLUMN "phoneNumberId";
