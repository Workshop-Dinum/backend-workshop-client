import prisma from '../config/db'

// Création d’un lycée dans la base
export async function createLyceeService(data: any) {
  return prisma.lycee.create({ data })
}

// Récupération des lycées avec filtres (ex: par région/département)
export async function getLyceesService(filters: any) {
  const where: any = {}
  if (filters.region) where.region = filters.region
  if (filters.departement) where.departement = filters.departement

  return prisma.lycee.findMany({ where })
}
