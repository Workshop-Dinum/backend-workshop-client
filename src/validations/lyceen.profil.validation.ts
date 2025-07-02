import { z } from 'zod'
import { Request, Response, NextFunction } from 'express'

// Validation pour mise à jour du profil (téléphone + CV)
export const updateProfilSchema = z.object({
  telephone: z.string().optional(),
  cv_url: z.string().url().optional()
})

export function validateUpdateProfil(req: Request, res: Response, next: NextFunction) {
  try {
    updateProfilSchema.parse(req.body)
    next()
  } catch (_) {
    return res.status(400).json({ error: 'Validation échouée pour la mise à jour du profil' })
  }
}

// Validation pour postuler à une offre
export const postulerSchema = z.object({
  message: z.string().optional() // si l’entreprise demande un message, sinon facultatif
})

export function validatePostuler(req: Request, res: Response, next: NextFunction) {
  try {
    postulerSchema.parse(req.body)
    next()
  } catch (_) {
    return res.status(400).json({ error: 'Validation échouée pour la postulation' })
  }
}
