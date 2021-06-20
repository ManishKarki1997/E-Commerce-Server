/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `categories` table. All the data in the column will be lost.
  - Added the required column `description` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `iconName` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "categories" DROP COLUMN "imageUrl",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "iconName" TEXT NOT NULL;
