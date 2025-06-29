import { Request, Response } from 'express'
import prisma from '../config/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

export async function lyceenLogin(req: Request, res: Response) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' })

  const lyceen = await prisma.lyceen.findFirst({
    where: {
      OR: [
        { email_institutionnel: email },
        { email_personnel: email }
      ]
    }
  })
  if (!lyceen) return res.status(401).json({ error: 'Identifiants invalides' })

  const valid = await bcrypt.compare(password, lyceen.mot_de_passe_hash)
  if (!valid) return res.status(401).json({ error: 'Identifiants invalides' })

  const token = jwt.sign({ id: lyceen.id }, process.env.JWT_SECRET!, { expiresIn: '1h' })
  res.json({ token })
} 