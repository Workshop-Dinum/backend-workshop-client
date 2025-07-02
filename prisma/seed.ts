import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Secteurs d'activité
  await prisma.secteurActivite.createMany({
    data: [
      { nom: 'Commerce / Vente' },
      { nom: 'Informatique / Numérique' },
      { nom: 'BTP / Construction' },
      { nom: 'Transport / Logistique' },
      { nom: 'Automobile / Mécanique' },
      { nom: 'Énergie / Environnement' },
      { nom: 'Santé / Social' },
      { nom: 'Restauration / Hôtellerie' },
      { nom: 'Sécurité / Défense' },
      { nom: 'Éducation / Formation' },
      { nom: 'Administration publique' },
      { nom: 'Communication / Marketing' },
      { nom: 'Artisanat / Métiers d\'art' },
      { nom: 'Finance / Comptabilité' },
      { nom: 'Banque / Assurance' },
      { nom: 'Agriculture / Agroalimentaire' },
      { nom: 'Mode / Esthétique / Coiffure' },
      { nom: 'Aéronautique / Spatial' },
      { nom: 'Industrie / Production' },
      { nom: 'Recherche / Sciences' },
      { nom: 'Immobilier' },
      { nom: 'Services à la personne' },
      { nom: 'Culture / Médias' },
      { nom: 'Sport / Loisirs' },
    ],
    skipDuplicates: true,
  })

  // Niveaux
  await prisma.niveau.createMany({
    data: [
      { nom: 'Seconde' },
      { nom: 'Première' },
      { nom: 'Terminale' },
    ],
    skipDuplicates: true,
  })

  // Filières générales (réforme 2019)
  await prisma.filiere.createMany({
    data: [
      { nom: 'Mathématiques' },
      { nom: 'Physique-Chimie' },
      { nom: 'Sciences de la Vie et de la Terre' },
      { nom: 'Numérique et Sciences Informatiques' },
      { nom: 'Sciences Économiques et Sociales' },
      { nom: 'Histoire-Géographie, Géopolitique et Sciences Politiques' },
      { nom: 'Humanités, Littérature et Philosophie' },
      { nom: 'Langues, Littératures et Cultures Étrangères' },
      { nom: 'Littérature, Langues et Cultures de l\'Antiquité' },
      { nom: 'Arts' },
      { nom: 'Sciences de l\'Ingénieur' },
      { nom: 'Éducation Physique, Pratiques et Culture Sportives' },
      // Filières technologiques
      { nom: 'STMG - Sciences et Technologies du Management et de la Gestion' },
      { nom: 'STI2D - Sciences et Technologies de l\'Industrie et du Développement Durable' },
      { nom: 'STL - Sciences et Technologies de Laboratoire' },
      { nom: 'ST2S - Sciences et Technologies de la Santé et du Social' },
      { nom: 'STHR - Sciences et Technologies de l\'Hôtellerie et de la Restauration' },
      { nom: 'STD2A - Sciences et Technologies du Design et des Arts Appliqués' },
      { nom: 'TMD - Techniques de la Musique et de la Danse' },
      // Filières professionnelles
      { nom: 'Métiers de l\'administration, du transport et de la logistique' },
      { nom: 'Métiers de la construction durable, du bâtiment et des travaux publics' },
      { nom: 'Métiers de l\'électricité et de ses environnements connectés' },
      { nom: 'Métiers de la mécanique et de l\'automobile' },
      { nom: 'Métiers de la gestion administrative, du commerce et de la vente' },
      { nom: 'Métiers de l\'accueil' },
      { nom: 'Métiers de l\'aéronautique' },
      { nom: 'Métiers du numérique et des transitions énergétiques' },
      { nom: 'Métiers de la beauté et du bien-être' },
      { nom: 'Métiers de la sécurité' },
      { nom: 'Métiers des industries graphiques et de la communication' },
      { nom: 'Métiers de la santé et du social' },
      { nom: 'Métiers de la restauration et de l\'hôtellerie' },
    ],
    skipDuplicates: true,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect()) 