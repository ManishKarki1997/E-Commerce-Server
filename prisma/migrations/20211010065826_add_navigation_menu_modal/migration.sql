-- CreateTable
CREATE TABLE "navigationMenu" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "order" INTEGER NOT NULL,
    "parentId" INTEGER,
    "isMegaMenu" BOOLEAN NOT NULL DEFAULT false,
    "linkName" TEXT,
    "linkPath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "navigationMenu" ADD FOREIGN KEY ("parentId") REFERENCES "navigationMenu"("id") ON DELETE SET NULL ON UPDATE CASCADE;
