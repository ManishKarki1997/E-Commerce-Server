-- AlterTable
ALTER TABLE "users" ALTER COLUMN "avatar" SET DEFAULT E'https://wallpapercave.com/uwp/uwp580682.jpeg';

-- CreateTable
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "uid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "iconName" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL DEFAULT E'https://wallpaperset.com/w/full/1/a/6/52649.jpg',
    "totalProducts" INTEGER NOT NULL DEFAULT 0,
    "totalSubCategories" INTEGER NOT NULL DEFAULT 0,
    "parentName" TEXT,
    "parentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "images" (
    "id" SERIAL NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isDefaultImage" BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "categories.uid_unique" ON "categories"("uid");

-- CreateIndex
CREATE UNIQUE INDEX "categories.name_unique" ON "categories"("name");

-- AddForeignKey
ALTER TABLE "categories" ADD FOREIGN KEY ("parentId") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
