import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'

// Validation : création entreprise
export const entrepriseSchema = z.object({
  siret: z.string().min(9),
  nom: z.string(),
  rue: z.string(),
  code_postal: z.string(),
  ville: z.string(),
  departement: z.string(),
  region: z.string(),
  contact_nom: z.string(),
  contact_email: z.string().email(),
  contact_telephone: z.string(),
  secteurId: z.number(),
  mot_de_passe: z.string().min(6)
})

export function validateCreationEntreprise(req: Request, res: Response, next: NextFunction) {
  try {
    entrepriseSchema.parse(req.body)
    next()
  } catch {
    res.status(400).json({ error: 'Validation échouée (création entreprise)' })
  }
}

// Validation : création offre
export const offreSchema = z.object({
  titre: z.string(),
  description: z.string(),
  duree: z.string(),
  lieu: z.string(),
  periode: z.string(),
  niveauId: z.number(),
  filiereIds: z.array(z.number()).min(1),
  cv_requis: z.boolean(),
  message_requis: z.boolean(),
  date_limite: z.string()
})

export function validateCreationOffre(req: Request, res: Response, next: NextFunction) {
  try {
    offreSchema.parse(req.body)
    next()
  } catch {
    res.status(400).json({ error: 'Validation échouée (création offre)' })
  }
}

// Validation : proposition ciblée
export const propositionSchema = z.object({
  lyceenId: z.number(),
  offreId: z.number(),
  message: z.string().optional()
})

export function validateProposition(req: Request, res: Response, next: NextFunction) {
  try {
    propositionSchema.parse(req.body)
    next()
  } catch {
    res.status(400).json({ error: 'Validation échouée (proposition lycéen)' })
  }
}

export const entrepriseLoginSchema = z.object({
  email: z.string().email(),
  mot_de_passe: z.string().min(6)
})

export function validateLoginEntreprise(req: Request, res: Response, next: NextFunction) {
  try {
    entrepriseLoginSchema.parse(req.body)
    next()
  } catch {
    res.status(400).json({ error: 'Email et mot de passe requis' })
  }
}
