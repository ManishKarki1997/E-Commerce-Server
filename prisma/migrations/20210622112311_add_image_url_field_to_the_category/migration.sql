-- AlterTable
ALTER TABLE "categories" ADD COLUMN     "imageUrl" TEXT NOT NULL DEFAULT E'https://initiate.alphacoders.com/images/879/cropped-1920-1200-879280.jpg?711';

-- AlterTable
ALTER TABLE "products" ALTER COLUMN "subCategoryName" DROP NOT NULL;
