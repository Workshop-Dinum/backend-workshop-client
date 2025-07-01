/*
  Warnings:

  - A unique constraint covering the columns `[contact_email]` on the table `Entreprise` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Entreprise_contact_email_key" ON "Entreprise"("contact_email");
