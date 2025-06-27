import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRouter from '../routes/auth.routes'
import lyceeRouter from '../routes/lycee.routes'
import lyceenRouter from '../routes/lyceen.routes'
import { errorHandler } from '../middlewares/error.middleware'

// Configuration globale de l'application
export function setupApp(app: Express) {
  app.use(cors()) // Autorise les requêtes cross-origin
  app.use(helmet()) // Sécurise les headers HTTP
  app.use(express.json()) // Parse les corps JSON

  // Déclaration des routes
  app.use('/api/login', authRouter)
  app.use('/api/lycees', lyceeRouter)
  app.use('/api/lyceens', lyceenRouter)

  // Middleware global d’erreurs
  app.use(errorHandler)
}
