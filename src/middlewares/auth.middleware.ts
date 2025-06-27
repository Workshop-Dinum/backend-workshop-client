import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Middleware pour vérifier que l'utilisateur est bien authentifié
export function authenticateToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.sendStatus(401) // Pas de token → accès refusé

  // Vérifie la validité du token
  jwt.verify(token, process.env.JWT_SECRET!, (err, user) => {
    if (err) return res.sendStatus(403) // Token invalide → interdit
    ;(req as any).user = user // On stocke l'utilisateur dans la requête
    next()
  })
}
