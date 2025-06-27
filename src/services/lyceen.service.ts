import prisma from '../config/db'
import { generatePassword } from '../utils/password.util'
import { transporter } from '../config/mailer'
import bcrypt from 'bcryptjs'

// Crée un lycéen et lui envoie ses identifiants par mail
export async function createLyceenService(data: any) {
  const password = generatePassword()
  const hashedPassword = await bcrypt.hash(password, 10)

  const lyceen = await prisma.lyceen.create({
    data: {
      ...data,
      mot_de_passe_hash: hashedPassword
    }
  })

  await transporter.sendMail({
    to: data.email_personnel,
    subject: 'Vos identifiants de connexion',
    text: `Bonjour ${data.prenom},\n\nVoici vos identifiants pour vous connecter à la plateforme :\n\nLogin : ${data.email_institutionnel}\nMot de passe : ${password}\n\nPensez à modifier votre mot de passe dès la première connexion.`
  })

  return lyceen
}
