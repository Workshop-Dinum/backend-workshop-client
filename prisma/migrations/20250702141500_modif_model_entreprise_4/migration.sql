/*
  Warnings:

  - A unique constraint covering the columns `[nom]` on the table `Filiere` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nom]` on the table `Niveau` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nom]` on the table `SecteurActivite` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Filiere_nom_key" ON "Filiere"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "Niveau_nom_key" ON "Niveau"("nom");

-- CreateIndex
CREATE UNIQUE INDEX "SecteurActivite_nom_key" ON "SecteurActivite"("nom");
