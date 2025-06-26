// src/services/setup.ts
import express, { Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'

// Fonction pour configurer express (middlewares, routes plus tard)
export function setupApp(app: Express) {
  app.use(cors())
  app.use(helmet())
  app.use(express.json())

  // Ici on ajoutera les routes plus tard
  // ex: app.use('/api/users', userRouter)
}
