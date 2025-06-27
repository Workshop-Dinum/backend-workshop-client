import { z } from 'zod'

// Schéma de validation pour la connexion
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(3)
})

// Middleware qui valide la requête avec Zod
export function validateLogin(req: any, res: any, next: any) {
  try {
    loginSchema.parse(req.body)
    next()
  } catch (e) {
    return res.status(400).json({ error: 'Validation échouée' })
  }
}
