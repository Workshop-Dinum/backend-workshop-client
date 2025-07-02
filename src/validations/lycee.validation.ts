import { z } from 'zod'

// Schéma de validation pour la création d’un lycée
export const lyceeSchema = z.object({
  nom: z.string(),
  rue: z.string(),
  code_postal: z.string(),
  ville: z.string(),
  departement: z.string(),
  region: z.string(),
  academie: z.string(),
  email_contact: z.string().email(),
  telephone: z.string(),
  mot_de_passe: z.string().min(6), 
  logo_url: z.string().optional(),
  site_web: z.string(),
  periode_de_stage: z.string()
})

export function validateLycee(req: any, res: any, next: any) {
  try {
    lyceeSchema.parse(req.body)
    next()
  } catch (_) {
    return res.status(400).json({ error: 'Validation échouée' })
  }
}
