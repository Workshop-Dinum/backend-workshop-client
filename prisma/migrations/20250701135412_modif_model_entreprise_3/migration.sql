/*
  Warnings:

  - A unique constraint covering the columns `[lyceenId,offreId]` on the table `Proposition` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Proposition_lyceenId_offreId_key" ON "Proposition"("lyceenId", "offreId");
