-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT E'https://initiate.alphacoders.com/images/879/cropped-1920-1200-879280.jpg?711',
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "totalSubCategories" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories.uid_unique" ON "categories"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "categories.name_unique" ON "categories"("name");
