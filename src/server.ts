// src/server.ts
import dotenv from 'dotenv'
import app from './app'
import { connectToDatabase } from './config/db'
import { setupApp } from './services/setup'

dotenv.config()

const PORT = process.env.PORT || 3000

// On configure express (middlewares etc.)
setupApp(app)

// On lance le serveur après la connexion à la base
async function startServer() {
  await connectToDatabase()

  app.listen(PORT, () => {
    console.log(`Serveur lancé sur http://localhost:${PORT}`)
  })
}

startServer()
