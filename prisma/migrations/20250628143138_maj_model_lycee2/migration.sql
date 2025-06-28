/*
  Warnings:

  - A unique constraint covering the columns `[email_contact]` on the table `Lycee` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Lycee_email_contact_key" ON "Lycee"("email_contact");
