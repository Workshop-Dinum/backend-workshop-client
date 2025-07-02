import prisma from '../config/db'
import bcrypt from 'bcryptjs'

// Crée une entreprise avec mot de passe hashé
export async function createEntrepriseService(data: any) {
  const { mot_de_passe, ...rest } = data
  const hashedPassword = await bcrypt.hash(mot_de_passe, 10)

  return prisma.entreprise.create({
    data: {
      ...rest,
      mot_de_passe_hash: hashedPassword
    }
  })
}

// Récupère les lycées filtrés par région / département
export async function getLyceesFiltrésService(filters: any) {
  const where: any = {}

  if (filters.region) where.region = filters.region
  if (filters.departement) where.departement = filters.departement

  return prisma.lycee.findMany({
    where,
    select: {
      id: true,
      nom: true,
      ville: true,
      departement: true,
      region: true
    }
  })
}

// Récupère les lycéens d'un lycée
export async function getLyceensParLyceeService(lyceeId: number) {
  return prisma.lyceen.findMany({
    where: { lyceeId },
    select: {
      id: true,
      nom: true,
      prenom: true,
      stage_trouve: true,
      cv_url: true,
      filiere: { select: { nom: true } },
      niveau: { select: { nom: true } }
    }
  })
}

// Propose une offre à un lycéen
export async function proposerOffreALyceenService(entrepriseId: number, data: any) {
  const { lyceenId, offreId, message } = data

  // Vérifie que le lycéen existe
  const lyceen = await prisma.lyceen.findUnique({ where: { id: lyceenId } })
  if (!lyceen) throw new Error('Lycéen introuvable')

  // Vérifie que l'offre appartient bien à cette entreprise
  const offre = await prisma.offre.findUnique({
    where: { id: offreId },
    include: { entreprise: true }
  })

  if (!offre || offre.entrepriseId !== entrepriseId) {
    throw new Error('Offre introuvable')
  }

  // Crée la proposition
  return prisma.proposition.create({
    data: {
      entrepriseId,
      lyceenId,
      offreId,
      message,
      date_envoi: new Date()
    }
  })
}

export async function getAllEntreprisesService() {
  return prisma.entreprise.findMany({
    select: {
      id: true,
      nom: true,
      siret: true,
      ville: true,
      region: true,
      departement: true,
      contact_nom: true,
      contact_email: true,
      contact_telephone: true,
      secteurId: true
    }
  })
}

export async function getEntrepriseByIdService(id: number) {
  return prisma.entreprise.findUnique({
    where: { id },
    select: {
      id: true,
      nom: true,
      siret: true,
      ville: true,
      region: true,
      departement: true,
      contact_nom: true,
      contact_email: true,
      contact_telephone: true,
      secteurId: true
    }
  })
}
