/*
  Warnings:

  - You are about to drop the column `sousZoneId` on the `Producteur` table. All the data in the column will be lost.
  - You are about to drop the `SousZone` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Zone` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `regionId` to the `Producteur` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Producteur" DROP CONSTRAINT "Producteur_sousZoneId_fkey";

-- DropForeignKey
ALTER TABLE "SousZone" DROP CONSTRAINT "SousZone_zoneId_fkey";

-- AlterTable
ALTER TABLE "Producteur" DROP COLUMN "sousZoneId",
ADD COLUMN     "regionId" INTEGER NOT NULL;

-- DropTable
DROP TABLE "SousZone";

-- DropTable
DROP TABLE "Zone";

-- CreateTable
CREATE TABLE "Continent" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Continent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pays" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "continentId" INTEGER NOT NULL,

    CONSTRAINT "Pays_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Region" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "paysId" INTEGER NOT NULL,

    CONSTRAINT "Region_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Pays" ADD CONSTRAINT "Pays_continentId_fkey" FOREIGN KEY ("continentId") REFERENCES "Continent"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Region" ADD CONSTRAINT "Region_paysId_fkey" FOREIGN KEY ("paysId") REFERENCES "Pays"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Producteur" ADD CONSTRAINT "Producteur_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
