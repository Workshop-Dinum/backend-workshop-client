import request from 'supertest'
import app from '../../src/app'
import { PrismaClient } from '@prisma/client'

// Prisma est déjà connecté via setup.ts
const prisma = new PrismaClient()

function generateValidLycee(overrides = {}) {
  return {
    nom: "Lycée République",
    rue: "1 avenue de la République",
    code_postal: "75011",
    ville: "Paris",
    departement: "75",
    region: "Île-de-France",
    academie: "Paris",
    email_contact: `contact+${Date.now()}@lycee.fr`,
    telephone: "0123456789",
    mot_de_passe: "motdepasse123",
    logo_url: "http://logo.com/logo.png",
    site_web: "http://lycee-republique.fr",
    periode_de_stage: "janvier - mars",
    ...overrides
  }
}

describe('E2E - Lycées', () => {
  // === Création ===
  describe('POST /api/lycees', () => {
    it('✅ crée un lycée avec succès', async () => {
      const validLycée = generateValidLycee()
      const res = await request(app).post('/api/lycees').send(validLycée)
      expect(res.statusCode).toBe(201)
      expect(res.body.email_contact).toBe(validLycée.email_contact)
    })

    it('❌ échoue si données manquantes', async () => {
      const res = await request(app).post('/api/lycees').send({})
      expect(res.statusCode).toBe(400)
    })

    it('❌ échoue si email déjà utilisé', async () => {
      const validLycée = generateValidLycee()
      await request(app).post('/api/lycees').send(validLycée)
      const res = await request(app).post('/api/lycees').send(validLycée)
      expect(res.statusCode).toBe(500)
    })

    it('❌ échoue si email invalide', async () => {
      const invalidLycée = generateValidLycee({ email_contact: 'not-an-email' })
      const res = await request(app).post('/api/lycees').send(invalidLycée)
      expect(res.statusCode).toBe(400)
    })
  })

  // === Listing ===
  describe('GET /api/lycees', () => {
    beforeEach(async () => {
      await request(app).post('/api/lycees').send(generateValidLycee())
      await request(app).post('/api/lycees').send(
        generateValidLycee({
          email_contact: `autre+${Date.now()}@lycee.fr`,
          ville: 'Lyon',
          region: 'Auvergne-Rhône-Alpes',
          departement: '69'
        })
      )
    })

    it('✅ retourne tous les lycées', async () => {
      const res = await request(app).get('/api/lycees')
      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBe(2)
    })

    it('✅ filtre par région', async () => {
      const res = await request(app).get('/api/lycees?region=Île-de-France')
      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBe(1)
      expect(res.body[0].region).toBe('Île-de-France')
    })

    it('✅ filtre par département', async () => {
      const res = await request(app).get('/api/lycees?departement=69')
      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBe(1)
      expect(res.body[0].departement).toBe('69')
    })

    it('❌ aucun lycée trouvé', async () => {
      const res = await request(app).get('/api/lycees?region=Inexistante')
      expect(res.statusCode).toBe(200)
      expect(res.body.length).toBe(0)
    })
  })

  // === Profil ===
  describe('GET /api/lycees/profil', () => {
    let token: string
    let email: string

    beforeEach(async () => {
      const validLycée = generateValidLycee()
      email = validLycée.email_contact
      await request(app).post('/api/lycees').send(validLycée)
      const res = await request(app).post('/api/login').send({
        email: validLycée.email_contact,
        password: validLycée.mot_de_passe
      })
      token = res.body.token
    })

    it('✅ retourne le profil du lycée connecté', async () => {
      const res = await request(app)
        .get('/api/lycees/profil')
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(200)
      expect(res.body.email_contact).toBe(email)
    })

    it('❌ échoue sans token', async () => {
      const res = await request(app).get('/api/lycees/profil')
      expect(res.statusCode).toBe(401)
    })

    it('❌ échoue avec un token invalide', async () => {
      const res = await request(app)
        .get('/api/lycees/profil')
        .set('Authorization', 'Bearer faketoken')

      expect(res.statusCode).toBe(403)
    })

    it('❌ échoue si lycée supprimé', async () => {
      await prisma.lycee.deleteMany()

      const res = await request(app)
        .get('/api/lycees/profil')
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(404)
    })
  })
})
