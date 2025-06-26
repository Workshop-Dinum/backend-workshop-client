// src/config/db.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fonction pour se connecter à la base de données
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('Connexion à la base de données réussie')
  } catch (error) {
    console.error('Erreur lors de la connexion à la base de données :', error)
    process.exit(1)
  }
}

export default prisma
