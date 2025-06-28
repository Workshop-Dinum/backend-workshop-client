import { Request, Response } from 'express'
import { verifyResetToken } from '../utils/reset-token.util'
import prisma from '../config/db'
import bcrypt from 'bcryptjs'

// Contrôleur pour réinitialiser le mot de passe d’un lycéen
export async function resetPassword(req: Request, res: Response) {
  const { token, email, newPassword } = req.body

  // Vérifie le token
  const emailFromToken = verifyResetToken(token)
  if (!emailFromToken || emailFromToken !== email) {
    return res.status(400).json({ error: 'Lien de réinitialisation invalide ou expiré' })
  }

  const hashed = await bcrypt.hash(newPassword, 10)

  const lyceen = await prisma.lyceen.updateMany({
    where: { email_personnel: email },
    data: { mot_de_passe_hash: hashed }
  })

  res.json({ message: 'Mot de passe mis à jour avec succès' })
}
