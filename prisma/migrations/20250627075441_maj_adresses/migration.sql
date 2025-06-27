/*
  Warnings:

  - You are about to drop the column `adresse` on the `Entreprise` table. All the data in the column will be lost.
  - You are about to drop the column `adresse` on the `Lycee` table. All the data in the column will be lost.
  - Added the required column `code_postal` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departement` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rue` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ville` to the `Entreprise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code_postal` to the `Lycee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `departement` to the `Lycee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `region` to the `Lycee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rue` to the `Lycee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ville` to the `Lycee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Entreprise" DROP COLUMN "adresse",
ADD COLUMN     "code_postal" TEXT NOT NULL,
ADD COLUMN     "departement" TEXT NOT NULL,
ADD COLUMN     "rue" TEXT NOT NULL,
ADD COLUMN     "ville" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Lycee" DROP COLUMN "adresse",
ADD COLUMN     "code_postal" TEXT NOT NULL,
ADD COLUMN     "departement" TEXT NOT NULL,
ADD COLUMN     "region" TEXT NOT NULL,
ADD COLUMN     "rue" TEXT NOT NULL,
ADD COLUMN     "ville" TEXT NOT NULL;
