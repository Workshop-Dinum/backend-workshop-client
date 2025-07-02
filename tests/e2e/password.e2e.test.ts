import request from 'supertest'
import app from '../../src/app'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { generateResetToken } from '../../src/utils/reset-token.util'

const prisma = new PrismaClient()

let testCounter = 0

function generateValidLycee(overrides = {}) {
  testCounter++
  return {
    nom: "Lycée République",
    rue: "1 avenue de la République",
    code_postal: "75011",
    ville: "Paris",
    departement: "75",
    region: "Île-de-France",
    academie: "Paris",
    email_contact: `contact+${Date.now()}+${testCounter}@lycee.fr`,
    telephone: "0123456789",
    mot_de_passe: "motdepasse123",
    logo_url: "http://logo.com/logo.png",
    site_web: "http://lycee-republique.fr",
    periode_de_stage: "janvier - mars",
    ...overrides
  }
}

function generateValidLyceen(overrides = {}) {
  testCounter++
  return {
    nom: "Dupont",
    prenom: "Marie",
    email_institutionnel: `marie.dupont+${Date.now()}+${testCounter}@lycee.fr`,
    email_personnel: `marie.dupont+${Date.now()}+${testCounter}@gmail.com`,
    date_naissance: "2005-03-15T00:00:00.000Z",
    cv_url: "http://cv.com/marie-dupont.pdf",
    stage_trouve: false,
    telephone: "0612345678",
    lyceeId: 1,
    filiereId: 1,
    niveauId: 1,
    ...overrides
  }
}

async function createTestData() {
  // Créer un lycée de test
  const lyceeData = generateValidLycee()
  const { mot_de_passe, ...lyceeDataWithoutPassword } = lyceeData
  const lycee = await prisma.lycee.create({
    data: {
      ...lyceeDataWithoutPassword,
      mot_de_passe_hash: await bcrypt.hash("motdepasse123", 10)
    }
  })

  // Créer une filière de test
  const filiere = await prisma.filiere.findFirst({ where: { nom: "Mathématiques" } })
  if (!filiere) throw new Error('Aucune filière "Mathématiques" trouvée dans la base de test (seed manquant)')

  // Créer un niveau de test
  const niveau = await prisma.niveau.findFirst({ where: { nom: "Terminale" } })
  if (!niveau) throw new Error('Aucun niveau "Terminale" trouvé dans la base de test (seed manquant)')

  // Créer un lycéen de test
  const lyceen = await prisma.lyceen.create({
    data: {
      ...generateValidLyceen({
        lyceeId: lycee.id,
        filiereId: filiere.id,
        niveauId: niveau.id
      }),
      mot_de_passe_hash: await bcrypt.hash("motdepasse123", 10)
    }
  })

  return { lycee, lyceen }
}

describe('E2E - Password Reset', () => {
  let testData: any

  beforeEach(async () => {
    await prisma.lyceen.deleteMany()
    await prisma.lycee.deleteMany()
    testData = await createTestData()
  })

  // === Demande de reset ===
  describe('POST /api/password/forgot', () => {
    it('✅ envoie un email de reset pour un lycée existant', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: testData.lycee.email_contact })
      expect(res.statusCode).toBe(200)
    })
    it('✅ envoie un email de reset pour un lycéen existant', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: testData.lyceen.email_personnel })
      expect(res.statusCode).toBe(200)
    })
    it('❌ échoue si email inexistant', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: 'inexistant@lycee.fr' })
      expect(res.statusCode).toBe(404)
    })
    it('❌ échoue si email invalide', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: 'not-an-email' })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue si email manquant', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({})
      expect(res.statusCode).toBe(400)
    })
  })

  // === Réinitialisation effective ===
  describe('POST /api/password/reset-password', () => {
    it('✅ reset le mot de passe avec un token valide', async () => {
      const token = generateResetToken(testData.lyceen.email_personnel)
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lyceen.email_personnel, token, newPassword: 'nouveaumdp123' })
      expect(res.statusCode).toBe(200)
      expect(res.body.message).toMatch(/succès/i)
      // Vérifier que le mot de passe a bien changé
      const lyceen = await prisma.lyceen.findFirst({ where: { email_personnel: testData.lyceen.email_personnel } })
      if (!lyceen) throw new Error('Lycéen non trouvé après reset')
      expect(await bcrypt.compare('nouveaumdp123', lyceen.mot_de_passe_hash)).toBe(true)
    })
    it('❌ échoue si token invalide', async () => {
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lyceen.email_personnel, token: 'faketoken', newPassword: 'newpass123' })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue si token expiré', async () => {
      // Générer un token expiré (expiresIn: -1s)
      const expiredToken = require('jsonwebtoken').sign({ email: testData.lyceen.email_personnel }, process.env.JWT_SECRET, { expiresIn: -1 })
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lyceen.email_personnel, token: expiredToken, newPassword: 'newpass123' })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue si email ne correspond pas au token', async () => {
      const token = generateResetToken('autre@email.fr')
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lyceen.email_personnel, token, newPassword: 'newpass123' })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue si mot de passe trop court', async () => {
      const token = generateResetToken(testData.lyceen.email_personnel)
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lyceen.email_personnel, token, newPassword: 'ab' })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue si mot de passe manquant', async () => {
      const token = generateResetToken(testData.lyceen.email_personnel)
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lyceen.email_personnel, token })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue si email manquant', async () => {
      const token = generateResetToken(testData.lyceen.email_personnel)
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ token, newPassword: 'newpass123' })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue si token manquant', async () => {
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lyceen.email_personnel, newPassword: 'newpass123' })
      expect(res.statusCode).toBe(400)
    })
  })

  // === Sécurité ===
  describe('Sécurité - Password', () => {
    it('❌ échoue avec une injection SQL dans l\'email', async () => {
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: "'; DROP TABLE lycee; --" })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue avec une injection SQL dans le token', async () => {
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lycee.email_contact, token: "'; DROP TABLE lycee; --", newPassword: 'newpass123' })
      expect(res.statusCode).toBe(400)
    })
    it('❌ échoue avec un mot de passe très long', async () => {
      const longPassword = 'a'.repeat(1000)
      const res = await request(app)
        .post('/api/password/reset-password')
        .send({ email: testData.lycee.email_contact, token: 'faketoken', newPassword: longPassword })
      expect(res.statusCode).toBe(400)
    })
  })

  // === Performance ===
  describe('Performance - Password', () => {
    it('✅ répond rapidement à une demande de reset valide', async () => {
      const startTime = Date.now()
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: testData.lycee.email_contact })
      const endTime = Date.now()
      expect(res.statusCode).toBe(200)
      expect(endTime - startTime).toBeLessThan(2000)
    })
    it('✅ répond rapidement à une demande de reset invalide', async () => {
      const startTime = Date.now()
      const res = await request(app)
        .post('/api/password/forgot')
        .send({ email: 'inexistant@lycee.fr' })
      const endTime = Date.now()
      expect(res.statusCode).toBe(404)
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })
}) 