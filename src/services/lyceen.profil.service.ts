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

// Sauvegarder une offre pour un lycéen
export async function saveOffrePourLyceenService(lyceenId: number, offreId: number) {
  // Vérifie si l'offre existe
  const offre = await prisma.offre.findUnique({ where: { id: offreId } })
  if (!offre) throw new Error('Offre introuvable')

  // Vérifie si déjà sauvegardée
  const deja = await prisma.offreSauvegardee.findUnique({
    where: { lyceenId_offreId: { lyceenId, offreId } }
  })
  if (deja) throw new Error('Offre déjà sauvegardée')

  // Crée la sauvegarde
  return prisma.offreSauvegardee.create({
    data: { lyceenId, offreId }
  })
}

// Supprimer une offre sauvegardée
export async function deleteOffreSauvegardeePourLyceenService(lyceenId: number, offreId: number) {
  const deleted = await prisma.offreSauvegardee.deleteMany({
    where: { lyceenId, offreId }
  })
  if (deleted.count === 0) throw new Error('Aucune sauvegarde trouvée')
  return { success: true }
}

// Lister les offres sauvegardées d'un lycéen
export async function getOffresSauvegardeesPourLyceenService(lyceenId: number) {
  const sauvegardes = await prisma.offreSauvegardee.findMany({
    where: { lyceenId },
    include: {
      offre: {
        include: {
          entreprise: { select: { nom: true, ville: true, secteur: { select: { nom: true } } } },
          filieres: { select: { filiere: { select: { nom: true } } } },
          niveau: { select: { nom: true } }
        }
      }
    },
    orderBy: { date: 'desc' }
  })
  return sauvegardes
}
