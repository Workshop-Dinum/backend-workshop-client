import { Request, Response } from 'express'
import prisma from '../config/db'
import bcrypt from 'bcryptjs'
import { generateToken } from '../utils/jwt.util'

// Connexion du lycée
export async function login(req: Request, res: Response) {
  const { email, password } = req.body

  const lycee = await prisma.lycee.findUnique({ where: { email_contact: email } })

  // Comparaison du mot de passe avec le hash
  if (!lycee || !(await bcrypt.compare(password, lycee.mot_de_passe_hash))) {
    return res.status(401).json({ error: 'Identifiants invalides' })
  }

  const token = generateToken({ id: lycee.id })
  res.json({ token })
}
