/*
  Warnings:

  - Added the required column `categorySlug` to the `products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "products" ADD COLUMN     "categorySlug" TEXT NOT NULL,
ADD COLUMN     "subCategorySlug" TEXT;
