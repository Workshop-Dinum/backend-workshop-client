import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../config/db'

// Middleware qui vérifie que le token est valide et appartient à un lycéen
export async function authenticateLyceen(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!)

    // Vérifie que le lycéen existe
    const lyceen = await prisma.lyceen.findUnique({
      where: { id: payload.id },
    })

    if (!lyceen) return res.status(404).json({ error: 'Lycéen non trouvé' })

    ;(req as any).user = { id: lyceen.id }
    next()
  } catch (_) {
    return res.sendStatus(403)
  }
}
