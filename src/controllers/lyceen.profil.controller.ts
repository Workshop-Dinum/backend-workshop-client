import { Request, Response } from 'express'
import prisma from '../config/db'
import { updateLyceenProfilService, getOffresPourLyceenService, postulerOffreService, saveOffrePourLyceenService, deleteOffreSauvegardeePourLyceenService, getOffresSauvegardeesPourLyceenService } from '../services/lyceen.profil.service'
import cache from '../utils/cache'

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

  try {
    const proposition = await postulerOffreService(lyceenId, offreId, message)
    res.status(201).json(proposition)
  } catch (e: any) {
    if (e.message === 'Offre introuvable') {
      return res.status(404).json({ error: e.message })
    }
    throw e
  }
}

// Sauvegarder une offre
export async function saveOffre(req: Request, res: Response) {
  const lyceenId = (req as any).user.id
  const offreId = parseInt(req.params.id, 10)
  try {
    const sauvegarde = await saveOffrePourLyceenService(lyceenId, offreId)
    // Invalider le cache pour cet utilisateur
    await cache.del(`/api/lyceen/offres/sauvegardees/${lyceenId}`)
    res.status(201).json(sauvegarde)
  } catch (e: any) {
    if (e.message === 'Offre introuvable') return res.status(404).json({ error: e.message })
    if (e.message === 'Offre déjà sauvegardée') return res.status(400).json({ error: e.message })
    return res.status(500).json({ error: 'Erreur lors de la sauvegarde' })
  }
}

// Supprimer une offre sauvegardée
export async function deleteSauvegardeOffre(req: Request, res: Response) {
  const lyceenId = (req as any).user.id
  const offreId = parseInt(req.params.id, 10)
  try {
    await deleteOffreSauvegardeePourLyceenService(lyceenId, offreId)
    // Invalider le cache pour cet utilisateur
    await cache.del(`/api/lyceen/offres/sauvegardees/${lyceenId}`)
    res.json({ success: true })
  } catch (e: any) {
    if (e.message === 'Aucune sauvegarde trouvée') return res.status(404).json({ error: e.message })
    return res.status(500).json({ error: 'Erreur lors de la suppression' })
  }
}

// Lister les offres sauvegardées
export async function getOffresSauvegardees(req: Request, res: Response) {
  const lyceenId = (req as any).user.id
  const sauvegardes = await getOffresSauvegardeesPourLyceenService(lyceenId)
  res.json(sauvegardes)
}
