/*
  Warnings:

  - Added the required column `categoryId` to the `subcategories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "subcategories" ADD COLUMN     "categoryId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "subcategories" ADD FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
