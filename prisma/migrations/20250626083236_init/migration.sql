-- CreateTable
CREATE TABLE "Lycee" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "academie" TEXT NOT NULL,
    "email_contact" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "logo_url" TEXT NOT NULL,
    "site_web" TEXT,
    "periode_de_stage" TEXT NOT NULL,

    CONSTRAINT "Lycee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Filiere" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Filiere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Niveau" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "Niveau_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LyceeFiliere" (
    "id" SERIAL NOT NULL,
    "lyceeId" INTEGER NOT NULL,
    "filiereId" INTEGER NOT NULL,

    CONSTRAINT "LyceeFiliere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lyceen" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,
    "prenom" TEXT NOT NULL,
    "date_naissance" TIMESTAMP(3) NOT NULL,
    "email_institutionnel" TEXT NOT NULL,
    "email_personnel" TEXT NOT NULL,
    "telephone" TEXT,
    "cv_url" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "stage_trouve" BOOLEAN NOT NULL,
    "lyceeId" INTEGER NOT NULL,
    "filiereId" INTEGER NOT NULL,
    "niveauId" INTEGER NOT NULL,

    CONSTRAINT "Lyceen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SecteurActivite" (
    "id" SERIAL NOT NULL,
    "nom" TEXT NOT NULL,

    CONSTRAINT "SecteurActivite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Entreprise" (
    "id" SERIAL NOT NULL,
    "siret" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "contact_nom" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "contact_telephone" TEXT NOT NULL,
    "secteurId" INTEGER NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,

    CONSTRAINT "Entreprise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Offre" (
    "id" SERIAL NOT NULL,
    "titre" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "duree" TEXT NOT NULL,
    "lieu" TEXT NOT NULL,
    "periode" TEXT NOT NULL,
    "cv_requis" BOOLEAN NOT NULL,
    "message_requis" BOOLEAN NOT NULL,
    "date_limite" TIMESTAMP(3) NOT NULL,
    "entrepriseId" INTEGER NOT NULL,
    "niveauId" INTEGER NOT NULL,

    CONSTRAINT "Offre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OffreFiliere" (
    "id" SERIAL NOT NULL,
    "offreId" INTEGER NOT NULL,
    "filiereId" INTEGER NOT NULL,

    CONSTRAINT "OffreFiliere_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proposition" (
    "id" SERIAL NOT NULL,
    "entrepriseId" INTEGER NOT NULL,
    "lyceenId" INTEGER NOT NULL,
    "offreId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "date_envoi" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Proposition_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LyceeFiliere" ADD CONSTRAINT "LyceeFiliere_lyceeId_fkey" FOREIGN KEY ("lyceeId") REFERENCES "Lycee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LyceeFiliere" ADD CONSTRAINT "LyceeFiliere_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lyceen" ADD CONSTRAINT "Lyceen_lyceeId_fkey" FOREIGN KEY ("lyceeId") REFERENCES "Lycee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lyceen" ADD CONSTRAINT "Lyceen_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lyceen" ADD CONSTRAINT "Lyceen_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entreprise" ADD CONSTRAINT "Entreprise_secteurId_fkey" FOREIGN KEY ("secteurId") REFERENCES "SecteurActivite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offre" ADD CONSTRAINT "Offre_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Offre" ADD CONSTRAINT "Offre_niveauId_fkey" FOREIGN KEY ("niveauId") REFERENCES "Niveau"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffreFiliere" ADD CONSTRAINT "OffreFiliere_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffreFiliere" ADD CONSTRAINT "OffreFiliere_filiereId_fkey" FOREIGN KEY ("filiereId") REFERENCES "Filiere"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposition" ADD CONSTRAINT "Proposition_entrepriseId_fkey" FOREIGN KEY ("entrepriseId") REFERENCES "Entreprise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposition" ADD CONSTRAINT "Proposition_lyceenId_fkey" FOREIGN KEY ("lyceenId") REFERENCES "Lyceen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Proposition" ADD CONSTRAINT "Proposition_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
