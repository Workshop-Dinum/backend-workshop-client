import { Request, Response } from 'express'
import {
  createEntrepriseService,
  getLyceesFiltrésService,
  getLyceensParLyceeService,
  proposerOffreALyceenService,
  getAllEntreprisesService,
  getEntrepriseByIdService
} from '../services/entreprise.service'
import { createOffreService } from '../services/offre.service'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import prisma from '../config/db'

// Créer un compte entreprise
export async function createEntreprise(req: Request, res: Response) {
  try {
    const entreprise = await createEntrepriseService(req.body)
    res.status(201).json(entreprise)
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email ou SIRET déjà utilisé' })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation échouée', details: error.errors })
    }
    console.error('[createEntreprise] Erreur serveur')
    res.status(500).json({ error: 'Erreur lors de la création de l’entreprise' })
  }
}

// Publier une offre
export async function publierOffre(req: Request, res: Response) {
  try {
    const entrepriseId = (req as any).user.id
    const offre = await createOffreService(entrepriseId, req.body)
    res.status(201).json(offre)
  } catch (error: any) {
    if (error.message && error.message.includes('filières sont invalides')) {
      return res.status(500).json({ error: error.message })
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Niveau ou entreprise introuvable' })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation échouée', details: error.errors })
    }
    console.error('[publierOffre] Erreur serveur')
    res.status(500).json({ error: 'Erreur lors de la publication de l’offre' })
  }
}

// Récupérer les lycées filtrés
export async function getLycees(req: Request, res: Response) {
  try {
    const lycees = await getLyceesFiltrésService(req.query)
    res.json(lycees)
  } catch {
    console.error('[getLycees] Erreur serveur')
    res.status(500).json({ error: 'Erreur lors du chargement des lycées' })
  }
}

// Voir les lycéens d’un lycée donné
export async function getLyceensParLycee(req: Request, res: Response) {
  try {
    const lyceens = await getLyceensParLyceeService(parseInt(req.params.id, 10))
    res.json(lyceens)
  } catch  {
    console.error('[getLyceensParLycee] Erreur serveur')
    res.status(500).json({ error: 'Erreur lors du chargement des lycéens' })
  }
}

// Proposer une offre à un lycéen
export async function proposerOffre(req: Request, res: Response) {
  try {
    const entrepriseId = (req as any).user.id
    const proposition = await proposerOffreALyceenService(entrepriseId, req.body)
    res.status(201).json(proposition)
  } catch (error: any) {
    if (error.message === 'Offre introuvable' || error.message === 'Lycéen introuvable') {
      return res.status(404).json({ error: error.message })
    }
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Une proposition existe déjà pour cette offre et ce lycéen' })
    }
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation échouée', details: error.errors })
    }
    console.error('[proposerOffre] Erreur serveur')
    res.status(500).json({ error: 'Erreur lors de l’envoi de la proposition' })
  }
}

// Récupérer toutes les entreprises
export async function getAllEntreprises(req: Request, res: Response) {
  try {
    const entreprises = await getAllEntreprisesService()
    res.json(entreprises)
  } catch {
    console.error('[getAllEntreprises] Erreur serveur')
    res.status(500).json({ error: 'Erreur lors du chargement des entreprises' })
  }
}

// Récupérer le profil de l’entreprise connectée
export async function getEntrepriseProfil(req: Request, res: Response) {
  try {
    const entrepriseId = (req as any).user.id
    const entreprise = await getEntrepriseByIdService(entrepriseId)
    if (!entreprise) return res.status(404).json({ error: 'Entreprise non trouvée' })
    res.json(entreprise)
  } catch {
    console.error('[getEntrepriseProfil] Erreur serveur')
    res.status(500).json({ error: 'Erreur lors du chargement du profil' })
  }
}

// Connexion entreprise
export async function loginEntreprise(req: Request, res: Response) {
  const { email, mot_de_passe } = req.body
  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: 'Email et mot de passe requis' })
  }
  try {
    const entreprise = await prisma.entreprise.findUnique({
      where: { contact_email: email }
    })
    if (!entreprise) {
      return res.status(401).json({ error: 'Identifiants invalides' })
    }
    const valid = await bcrypt.compare(mot_de_passe, entreprise.mot_de_passe_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Identifiants invalides' })
    }
    const token = jwt.sign({ id: entreprise.id }, process.env.JWT_SECRET!, { expiresIn: '7d' })
    res.json({ token })
  } catch {
    console.error('[loginEntreprise] Erreur serveur')
    res.status(500).json({ error: 'Erreur lors de la connexion' })
  }
}
