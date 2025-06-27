import { Request, Response, NextFunction } from 'express'

// Middleware global pour gérer les erreurs serveur
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error(err.stack)
  res.status(500).json({ error: 'Erreur interne du serveur' })
}
