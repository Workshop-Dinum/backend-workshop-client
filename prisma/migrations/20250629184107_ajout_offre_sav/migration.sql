-- CreateTable
CREATE TABLE "OffreSauvegardee" (
    "id" SERIAL NOT NULL,
    "lyceenId" INTEGER NOT NULL,
    "offreId" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OffreSauvegardee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OffreSauvegardee_lyceenId_offreId_key" ON "OffreSauvegardee"("lyceenId", "offreId");

-- AddForeignKey
ALTER TABLE "OffreSauvegardee" ADD CONSTRAINT "OffreSauvegardee_lyceenId_fkey" FOREIGN KEY ("lyceenId") REFERENCES "Lyceen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OffreSauvegardee" ADD CONSTRAINT "OffreSauvegardee_offreId_fkey" FOREIGN KEY ("offreId") REFERENCES "Offre"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
