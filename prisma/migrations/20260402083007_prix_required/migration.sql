/*
  Warnings:

  - Made the column `prix` on table `Produit` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Produit" ALTER COLUMN "prix" SET NOT NULL;
