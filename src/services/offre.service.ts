import prisma from '../config/db'

// Création d’une offre par une entreprise
export async function createOffreService(entrepriseId: number, data: any) {
  const {
    titre,
    description,
    duree,
    lieu,
    periode,
    cv_requis,
    message_requis,
    date_limite,
    niveauId,
    filiereIds
  } = data

  // Vérifie que les filières existent
  const filieres = await prisma.filiere.findMany({
    where: { id: { in: filiereIds } }
  })

  if (filieres.length !== filiereIds.length) {
    throw new Error('Une ou plusieurs filières sont invalides')
  }

  // Crée l’offre + relations avec les filières
  return prisma.offre.create({
    data: {
      titre,
      description,
      duree,
      lieu,
      periode,
      cv_requis,
      message_requis,
      date_limite: new Date(date_limite),
      entreprise: { connect: { id: entrepriseId } },
      niveau: { connect: { id: niveauId } },
      filieres: {
        create: filiereIds.map((filiereId: number) => ({
          filiere: { connect: { id: filiereId } }
        }))
      }
    },
    include: {
      filieres: { include: { filiere: true } },
      niveau: true
    }
  })
}
