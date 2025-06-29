import { Request, Response } from 'express'
import { verifyResetToken, generateResetToken } from '../utils/reset-token.util'
import prisma from '../config/db'
import bcrypt from 'bcryptjs'
import { transporter } from '../config/mailer'

// Contrôleur pour demander la réinitialisation du mot de passe
export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body

  if (!email) {
    return res.status(400).json({ error: 'Email requis' })
  }

  // Validation basique de l'email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Format d\'email invalide' })
  }

  try {
    // Chercher dans les lycées
    const lycee = await prisma.lycee.findUnique({
      where: { email_contact: email }
    })

    // Chercher dans les lycéens
    const lyceen = await prisma.lyceen.findFirst({
      where: { email_personnel: email }
    })

    if (!lycee && !lyceen) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' })
    }

    // En mode test, on simule juste l'envoi
    if (process.env.NODE_ENV !== 'test') {
      // Générer le token de reset
      const resetToken = generateResetToken(email)
      const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?email=${encodeURIComponent(email)}&token=${resetToken}`

      // Envoyer l'email
      await transporter.sendMail({
        to: email,
        subject: 'Réinitialisation de votre mot de passe',
        text: `
Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur le lien suivant pour définir un nouveau mot de passe :
${resetLink}

Ce lien expire dans 1 heure.

Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

Cordialement,
L'équipe de la plateforme
        `
      })
    }

    res.json({ message: 'Email de réinitialisation envoyé' })
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error)
    res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' })
  }
}

// Contrôleur pour réinitialiser le mot de passe d'un lycéen
export async function resetPassword(req: Request, res: Response) {
  const { token, email, newPassword } = req.body

  if (!token || !email || !newPassword) {
    return res.status(400).json({ error: 'Token, email et nouveau mot de passe requis' })
  }

  // Validation du mot de passe
  if (newPassword.length < 3) {
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 3 caractères' })
  }

  if (newPassword.length > 100) {
    return res.status(400).json({ error: 'Le mot de passe est trop long' })
  }

  // Vérifie le token
  const emailFromToken = verifyResetToken(token)
  if (!emailFromToken || emailFromToken !== email) {
    return res.status(400).json({ error: 'Lien de réinitialisation invalide ou expiré' })
  }

  try {
    const hashed = await bcrypt.hash(newPassword, 10)

    // Essayer de mettre à jour un lycéen
    let updated = await prisma.lyceen.updateMany({
      where: { email_personnel: email },
      data: { mot_de_passe_hash: hashed }
    })

    // Si aucun lycéen n'a été mis à jour, essayer avec un lycée
    if (updated.count === 0) {
      updated = await prisma.lycee.updateMany({
        where: { email_contact: email },
        data: { mot_de_passe_hash: hashed }
      })
    }

    if (updated.count === 0) {
      return res.status(404).json({ error: 'Aucun compte trouvé avec cet email' })
    }

    res.json({ message: 'Mot de passe mis à jour avec succès' })
  } catch (error) {
    console.error('Erreur lors de la mise à jour du mot de passe:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du mot de passe' })
  }
}
