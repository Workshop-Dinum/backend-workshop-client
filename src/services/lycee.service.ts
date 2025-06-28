import prisma from '../config/db'
import bcrypt from 'bcryptjs'

// Création d’un lycée avec mot de passe hashé
export async function createLyceeService(data: any) {
  const hashedPassword = await bcrypt.hash(data.mot_de_passe, 10)

  return prisma.lycee.create({
    data: {
      ...data,
      mot_de_passe_hash: hashedPassword
    }
  })
}

// Récupération des lycées avec filtres (région, département, etc.)
export async function getLyceesService(filters: any) {
  const where: any = {}
  if (filters.region) where.region = filters.region
  if (filters.departement) where.departement = filters.departement

  return prisma.lycee.findMany({ where })
}
