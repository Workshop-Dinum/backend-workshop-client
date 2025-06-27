import { z } from 'zod'

// Schéma de validation pour l’ajout d’un lycéen
export const lyceenSchema = z.object({
  nom: z.string(),
  prenom: z.string(),
  email_institutionnel: z.string().email(),
  email_personnel: z.string().email(),
  date_naissance: z.string(),
  cv_url: z.string(),
  stage_trouve: z.boolean(),
  telephone: z.string(),
  lyceeId: z.number(),
  filiereId: z.number(),
  niveauId: z.number()
})

export function validateLyceen(req: any, res: any, next: any) {
  try {
    lyceenSchema.parse(req.body)
    next()
  } catch (e) {
    return res.status(400).json({ error: 'Validation échouée' })
  }
}
