import prisma from '../config/db'
import { generatePassword } from '../utils/password.util'
import { transporter } from '../config/mailer'
import bcrypt from 'bcryptjs'
import { generateResetToken } from '../utils/reset-token.util'

// Crée un lycéen et lui envoie ses identifiants + lien de reset
export async function createLyceenService(data: any) {
  const password = generatePassword()
  const hashedPassword = await bcrypt.hash(password, 10)

  const lyceen = await prisma.lyceen.create({
    data: {
      ...data,
      mot_de_passe_hash: hashedPassword
    }
  })

  // En mode test, on n'envoie pas d'email
  if (process.env.NODE_ENV !== 'test') {
    try {
      const resetToken = generateResetToken(data.email_personnel)
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?email=${encodeURIComponent(data.email_personnel)}&token=${resetToken}`

      await transporter.sendMail({
        to: data.email_personnel,
        subject: 'Vos identifiants de connexion',
        text: `
Bonjour ${data.prenom},

Voici vos identifiants pour accéder à la plateforme :

Login : ${data.email_institutionnel}
Mot de passe : ${password}

Pensez à modifier votre mot de passe dès la première connexion :
${resetLink}

(Ce lien expire dans 1h)
        `
      })
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error)
      // On ne fait pas échouer la création du lycéen si l'email échoue
    }
  }

  return lyceen
}
