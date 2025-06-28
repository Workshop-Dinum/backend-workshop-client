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

describe('E2E - Authentification', () => {
  let validLycee: any
  let createdLycee: any

  beforeEach(async () => {
    validLycee = generateValidLycee()
    // Créer un lycée pour les tests de connexion
    const res = await request(app).post('/api/lycees').send(validLycee)
    createdLycee = res.body
  })

  // === Connexion (Login) ===
  describe('POST /api/login', () => {
    it('✅ se connecte avec succès avec des identifiants valides', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(typeof res.body.token).toBe('string')
      expect(res.body.token.length).toBeGreaterThan(0)
    })

    it('❌ échoue avec un email inexistant', async () => {
      const loginData = {
        email: 'inexistant@lycee.fr',
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Identifiants invalides')
    })

    it('❌ échoue avec un mot de passe incorrect', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: 'mauvaismotdepasse'
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Identifiants invalides')
    })

    it('❌ échoue avec un email vide', async () => {
      const loginData = {
        email: '',
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec un mot de passe vide', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: ''
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec un email invalide (format incorrect)', async () => {
      const loginData = {
        email: 'email-invalide',
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec un mot de passe trop court', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: 'ab'
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec des données manquantes (email)', async () => {
      const loginData = {
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec des données manquantes (mot de passe)', async () => {
      const loginData = {
        email: validLycee.email_contact
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec un corps de requête vide', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({})

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec des types de données incorrects', async () => {
      const loginData = {
        email: 123, // devrait être une string
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si le lycée a été supprimé après création', async () => {
      // Supprimer le lycée
      await prisma.lycee.delete({
        where: { id: createdLycee.id }
      })

      const loginData = {
        email: validLycee.email_contact,
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Identifiants invalides')
    })

    it('✅ génère un token JWT valide qui peut être utilisé pour l\'authentification', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: validLycee.mot_de_passe
      }

      const loginRes = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(loginRes.statusCode).toBe(200)
      expect(loginRes.body).toHaveProperty('token')

      // Utiliser le token pour accéder au profil
      const profileRes = await request(app)
        .get('/api/lycees/profil')
        .set('Authorization', `Bearer ${loginRes.body.token}`)

      expect(profileRes.statusCode).toBe(200)
      expect(profileRes.body.email_contact).toBe(validLycee.email_contact)
    })

    it('❌ échoue avec un Content-Type incorrect', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .set('Content-Type', 'text/plain')
        .send(JSON.stringify(loginData))

      expect(res.statusCode).toBe(400)
    })

    it('❌ échoue avec une méthode HTTP incorrecte (GET)', async () => {
      const res = await request(app)
        .get('/api/login')
        .query({
          email: validLycee.email_contact,
          password: validLycee.mot_de_passe
        })

      expect(res.statusCode).toBe(404)
    })

    it('❌ échoue avec une méthode HTTP incorrecte (PUT)', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .put('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(404)
    })

    it('❌ échoue avec une méthode HTTP incorrecte (DELETE)', async () => {
      const res = await request(app)
        .delete('/api/login')

      expect(res.statusCode).toBe(404)
    })
  })

  // === Tests de sécurité ===
  describe('Sécurité - Authentification', () => {
    it('❌ échoue avec une injection SQL dans l\'email', async () => {
      const loginData = {
        email: "'; DROP TABLE lycee; --",
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec un email contenant des caractères spéciaux malveillants', async () => {
      const loginData = {
        email: "test@lycee.fr<script>alert('xss')</script>",
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(400)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec un mot de passe contenant des caractères spéciaux malveillants', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: "'; DROP TABLE lycee; --"
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Identifiants invalides')
    })

    it('❌ échoue avec un email très long', async () => {
      const longEmail = 'a'.repeat(1000) + '@lycee.fr'
      const loginData = {
        email: longEmail,
        password: validLycee.mot_de_passe
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Identifiants invalides')
    })

    it('❌ échoue avec un mot de passe très long', async () => {
      const longPassword = 'a'.repeat(1000)
      const loginData = {
        email: validLycee.email_contact,
        password: longPassword
      }

      const res = await request(app)
        .post('/api/login')
        .send(loginData)

      expect(res.statusCode).toBe(401)
      expect(res.body).toHaveProperty('error')
      expect(res.body.error).toBe('Identifiants invalides')
    })
  })

  // === Tests de performance ===
  describe('Performance - Authentification', () => {
    it('✅ répond rapidement avec des identifiants valides', async () => {
      const loginData = {
        email: validLycee.email_contact,
        password: validLycee.mot_de_passe
      }

      const startTime = Date.now()
      const res = await request(app)
        .post('/api/login')
        .send(loginData)
      const endTime = Date.now()

      expect(res.statusCode).toBe(200)
      expect(endTime - startTime).toBeLessThan(1000) // Moins d'1 seconde
    })

    it('✅ répond rapidement avec des identifiants invalides', async () => {
      const loginData = {
        email: 'inexistant@lycee.fr',
        password: 'mauvaismotdepasse'
      }

      const startTime = Date.now()
      const res = await request(app)
        .post('/api/login')
        .send(loginData)
      const endTime = Date.now()

      expect(res.statusCode).toBe(401)
      expect(endTime - startTime).toBeLessThan(1000) // Moins d'1 seconde
    })
  })
}) 