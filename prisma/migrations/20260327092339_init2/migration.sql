/*
  Warnings:

  - You are about to drop the column `zoneId` on the `Producteur` table. All the data in the column will be lost.
  - Added the required column `sousZoneId` to the `Producteur` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Producteur" DROP CONSTRAINT "Producteur_zoneId_fkey";

-- AlterTable
ALTER TABLE "Producteur" DROP COLUMN "zoneId",
ADD COLUMN     "sousZoneId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "SousZone" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "zoneId" INTEGER NOT NULL,

    CONSTRAINT "SousZone_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SousZone" ADD CONSTRAINT "SousZone_zoneId_fkey" FOREIGN KEY ("zoneId") REFERENCES "Zone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producteur" ADD CONSTRAINT "Producteur_sousZoneId_fkey" FOREIGN KEY ("sousZoneId") REFERENCES "SousZone"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
