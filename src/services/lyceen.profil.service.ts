import prisma from '../config/db'

// Mise à jour du profil lycéen (tel / CV uniquement)
export async function updateLyceenProfilService(id: number, data: any) {
  const { telephone, cv_url } = data

  return prisma.lyceen.update({
    where: { id },
    data: {
      telephone,
      cv_url
    }
  })
}

// Récupère les offres de stage filtrées
export async function getOffresPourLyceenService(filters: any) {
  const where: any = {}

  if (filters.region) where.lieu = { contains: filters.region, mode: 'insensitive' }
  if (filters.secteur) {
    where.entreprise = {
      secteur: {
        nom: { contains: filters.secteur, mode: 'insensitive' }
      }
    }
  }
  if (filters.nom_entreprise) {
    where.entreprise = {
      ...(where.entreprise || {}),
      nom: { contains: filters.nom_entreprise, mode: 'insensitive' }
    }
  }

  return prisma.offre.findMany({
    where,
    include: {
      entreprise: {
        select: {
          nom: true,
          ville: true,
          secteur: { select: { nom: true } }
        }
      },
      filieres: {
        select: {
          filiere: { select: { nom: true } }
        }
      },
      niveau: {
        select: { nom: true }
      }
    },
    orderBy: {
      date_limite: 'asc'
    }
  })
}

// Postuler à une offre (crée une proposition)
export async function postulerOffreService(lyceenId: number, offreId: number, message: string) {
  const offre = await prisma.offre.findUnique({
    where: { id: offreId },
    include: { entreprise: true }
  })

  if (!offre) throw new Error('Offre introuvable')

  return prisma.proposition.create({
    data: {
      lyceenId,
      offreId,
      entrepriseId: offre.entrepriseId,
      message,
      date_envoi: new Date()
    }
  })
}
