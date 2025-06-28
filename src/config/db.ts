import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Si NODE_ENV n'est pas encore défini, on force 'development' par défaut
const NODE_ENV = process.env.NODE_ENV ?? 'development'

// Force le chargement manuel du bon fichier .env (évite les mauvaises surprises)
const envFile = NODE_ENV === 'test' ? '.env.test' : '.env'
const envPath = path.resolve(process.cwd(), envFile)
dotenv.config({ path: envPath, override: true })

console.log(`🌍 NODE_ENV = ${NODE_ENV}`)
console.log(`🎯 DATABASE_URL chargée : ${process.env.DATABASE_URL}`)

// Initialise Prisma
const prisma = new PrismaClient()

// Fonction de connexion (utile pour démarrer manuellement l'app)
export async function connectToDatabase() {
  try {
    await prisma.$connect()
    console.log('✅ Connexion à la base de données réussie')
  } catch (error) {
    console.error('❌ Erreur de connexion à la base de données :', error)
    process.exit(1)
  }
}

export default prisma
