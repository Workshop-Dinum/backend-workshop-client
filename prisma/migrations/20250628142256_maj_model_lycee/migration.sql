/*
  Warnings:

  - Added the required column `mot_de_passe_hash` to the `Lycee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Lycee" ADD COLUMN     "mot_de_passe_hash" TEXT NOT NULL;
