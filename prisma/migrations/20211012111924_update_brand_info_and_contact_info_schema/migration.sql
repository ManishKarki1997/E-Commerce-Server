-- AlterTable
ALTER TABLE "products" ADD COLUMN     "locationId" INTEGER,
ADD COLUMN     "phoneNumberId" INTEGER;

-- CreateTable
CREATE TABLE "brandInfo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "logo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo" (
    "id" SERIAL NOT NULL,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "ogTitle" TEXT,
    "ogDescription" TEXT,
    "ogImage" TEXT,
    "brandInfoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contactInfo" (
    "id" SERIAL NOT NULL,
    "brandInfoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "phoneNumber" (
    "id" SERIAL NOT NULL,
    "number" INTEGER NOT NULL,
    "contactInfoId" INTEGER,
    "userInfoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "socialMedia" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "socialMediaIconUrl" TEXT NOT NULL,
    "contactInfoId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "location" (
    "id" SERIAL NOT NULL,
    "street" TEXT,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "district" TEXT,
    "zone" TEXT,
    "state" TEXT,
    "contactInfoId" INTEGER,
    "userInfoId" INTEGER,

    PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seo_brandInfoId_unique" ON "seo"("brandInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "contactInfo_brandInfoId_unique" ON "contactInfo"("brandInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "phoneNumber.number_unique" ON "phoneNumber"("number");

-- CreateIndex
CREATE UNIQUE INDEX "socialMedia.name_unique" ON "socialMedia"("name");

-- CreateIndex
CREATE UNIQUE INDEX "location.street_unique" ON "location"("street");

-- CreateIndex
CREATE UNIQUE INDEX "location_contactInfoId_unique" ON "location"("contactInfoId");

-- CreateIndex
CREATE UNIQUE INDEX "location_userInfoId_unique" ON "location"("userInfoId");

-- AddForeignKey
ALTER TABLE "seo" ADD FOREIGN KEY ("brandInfoId") REFERENCES "brandInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contactInfo" ADD FOREIGN KEY ("brandInfoId") REFERENCES "brandInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phoneNumber" ADD FOREIGN KEY ("contactInfoId") REFERENCES "contactInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "phoneNumber" ADD FOREIGN KEY ("userInfoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "socialMedia" ADD FOREIGN KEY ("contactInfoId") REFERENCES "contactInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD FOREIGN KEY ("contactInfoId") REFERENCES "contactInfo"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "location" ADD FOREIGN KEY ("userInfoId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
