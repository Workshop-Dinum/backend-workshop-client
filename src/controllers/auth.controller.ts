import { Request, Response } from 'express'
import prisma from '../config/db'
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/jwt.util'

// Connexion du lycée (login)
export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  // Recherche du lycée via l’email de contact
  const lycee = await prisma.lycee.findUnique({ where: { email_contact: email } })

  // Vérifie si le lycée existe et si le mot de passe correspond
  if (!lycee || !(await bcrypt.compare(password, lycee.telephone))) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  // Génère un token JWT avec l’id du lycée
  const token = generateToken({ id: lycee.id })

  res.json({ token })
}
