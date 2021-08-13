/*
  Warnings:

  - You are about to drop the column `parentCategoryName` on the `filters` table. All the data in the column will be lost.
  - Added the required column `subCategoryName` to the `filters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "filters" DROP COLUMN "parentCategoryName",
ADD COLUMN     "subCategoryName" TEXT NOT NULL;
