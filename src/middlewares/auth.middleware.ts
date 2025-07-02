import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import prisma from '../config/db'

// Middleware qui vérifie que le token est présent et valide
// Ensuite on vérifie que le lycée existe bien en base
export async function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  // Pas de token → accès refusé
  if (!token) return res.sendStatus(401)

  try {
    // On vérifie le token JWT
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!)

    // On vérifie que le lycée existe en base
    const lycee = await prisma.lycee.findUnique({
      where: { id: payload.id },
    })

    // Token ok, mais lycée supprimé ou inexistant
    if (!lycee) {
      return res.status(404).json({ error: 'Lycée non trouvé' })
    }

    // On injecte l’ID du lycée dans la requête (standard JWT payload)
    ;(req as any).user = { id: lycee.id }
    next()
  } catch (_) {
    return res.sendStatus(403)
  }
}
