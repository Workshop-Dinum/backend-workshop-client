import { Request, Response } from 'express'
import prisma from '../config/db'
import { updateLyceenProfilService, getOffresPourLyceenService, postulerOffreService } from '../services/lyceen.profil.service'

// Récupérer les infos du lycéen connecté
export async function getLyceenProfil(req: Request, res: Response) {
  const user = (req as any).user

  const lyceen = await prisma.lyceen.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      nom: true,
      prenom: true,
      email_institutionnel: true,
      email_personnel: true,
      date_naissance: true,
      telephone: true,
      cv_url: true,
      stage_trouve: true,
      filiere: { select: { nom: true } },
      niveau: { select: { nom: true } },
      lycee: { select: { nom: true, ville: true } }
    }
  })

  if (!lyceen) return res.status(404).json({ error: 'Lycéen non trouvé' })

  res.json(lyceen)
}

// Mettre à jour téléphone / CV
export async function updateLyceenProfil(req: Request, res: Response) {
  const user = (req as any).user
  const updated = await updateLyceenProfilService(user.id, req.body)
  res.json(updated)
}

// Récupérer les offres filtrées
export async function getOffres(req: Request, res: Response) {
  const offres = await getOffresPourLyceenService(req.query)
  res.json(offres)
}

// Postuler à une offre
export async function postulerOffre(req: Request, res: Response) {
  const lyceenId = (req as any).user.id
  const offreId = parseInt(req.params.id, 10)
  const { message } = req.body

  const proposition = await postulerOffreService(lyceenId, offreId, message)
  res.status(201).json(proposition)
}
