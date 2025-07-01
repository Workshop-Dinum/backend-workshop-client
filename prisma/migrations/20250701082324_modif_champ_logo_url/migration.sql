/*
  Warnings:

  - Made the column `site_web` on table `Lycee` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lycee" ALTER COLUMN "logo_url" DROP NOT NULL,
ALTER COLUMN "site_web" SET NOT NULL;
