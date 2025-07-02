import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../config/db'

// Middleware d'authentification pour les entreprises
export async function authenticateEntreprise(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!)

    // On vérifie que l’entreprise existe
    const entreprise = await prisma.entreprise.findUnique({
      where: { id: payload.id }
    })

    if (!entreprise) return res.status(404).json({ error: 'Entreprise non trouvée' })

    // On injecte l’ID dans la requête
    ;(req as any).user = { id: entreprise.id }
    next()
  } catch {
    return res.sendStatus(403)
  }
}
