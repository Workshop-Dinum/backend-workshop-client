import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import authRouter from '../routes/auth.routes'
import lyceeRouter from '../routes/lycee.routes'
import lyceenRouter from '../routes/lyceen.routes'
import passwordRouter from '../routes/password.routes'
import { errorHandler } from '../middlewares/error.middleware'
import { swaggerMiddleware, swaggerSetup } from '../middlewares/swagger.middleware'

// Configuration globale de l'application
export function setupApp(app: Express) {
  app.use(cors()) // Autorise les requêtes cross-origin
  app.use(helmet()) // Sécurise les headers HTTP
  app.use(express.json()) // Parse les corps JSON

  // Documentation Swagger
  app.use('/api-docs', swaggerMiddleware, swaggerSetup)

  // Déclaration des routes
  app.use('/api', authRouter)
  app.use('/api/lycees', lyceeRouter)
  app.use('/api/lyceens', lyceenRouter)
  app.use('/api', passwordRouter)

  // Middleware global d'erreurs
  app.use(errorHandler)
}
