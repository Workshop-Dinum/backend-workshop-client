import { PrismaClient } from '@prisma/client'
import supertest from 'supertest'
import app from '../../src/app'

export const prisma = new PrismaClient()
export const request = supertest(app)

beforeAll(async () => {

})

afterEach(async () => {
  // Nettoie les données sensibles après chaque test
  await prisma.lyceen.deleteMany()
  await prisma.lycee.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})
