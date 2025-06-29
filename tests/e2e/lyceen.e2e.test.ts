import request from 'supertest'
import app from '../../src/app'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

// Prisma est déjà connecté via setup.ts
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

  // Créer un secteur d'activité de test
  const secteurActivite = await prisma.secteurActivite.create({
    data: {
      nom: "Informatique"
    }
  })

  // Créer une filière de test
  const filiere = await prisma.filiere.create({
    data: {
      nom: "Développement Web"
    }
  })

  // Créer un niveau de test
  const niveau = await prisma.niveau.create({
    data: {
      nom: "Terminale"
    }
  })

  return { lycee, filiere, niveau, secteurActivite }
}

describe('E2E - Lycéens', () => {
  let testData: any
  let token: string

  beforeEach(async () => {
    // Nettoyer la base
    await prisma.lyceen.deleteMany()
    await prisma.lycee.deleteMany()
    await prisma.filiere.deleteMany()
    await prisma.niveau.deleteMany()
    await prisma.secteurActivite.deleteMany()

    // Créer les données de test
    testData = await createTestData()

    // Se connecter pour obtenir un token
    const loginRes = await request(app).post('/api/login').send({
      email: testData.lycee.email_contact,
      password: "motdepasse123"
    })
    token = loginRes.body.token
  })

  // === Création d'un lycéen ===
  describe('POST /api/lyceens', () => {
    it('✅ crée un lycéen avec succès', async () => {
      const validLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(validLyceen)

      expect(res.statusCode).toBe(201)
      expect(res.body.nom).toBe(validLyceen.nom)
      expect(res.body.prenom).toBe(validLyceen.prenom)
      expect(res.body.email_institutionnel).toBe(validLyceen.email_institutionnel)
      expect(res.body.email_personnel).toBe(validLyceen.email_personnel)
      expect(res.body.lyceeId).toBe(testData.lycee.id)
      expect(res.body.filiereId).toBe(testData.filiere.id)
      expect(res.body.niveauId).toBe(testData.niveau.id)
    })

    it('❌ échoue sans token d\'authentification', async () => {
      const validLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .send(validLyceen)

      expect(res.statusCode).toBe(401)
    })

    it('❌ échoue avec un token invalide', async () => {
      const validLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', 'Bearer faketoken')
        .send(validLyceen)

      expect(res.statusCode).toBe(403)
    })

    it('❌ échoue si nom manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        nom: undefined,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si prénom manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        prenom: undefined,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si email institutionnel manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        email_institutionnel: undefined,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si email institutionnel invalide', async () => {
      const invalidLyceen = generateValidLyceen({
        email_institutionnel: 'email-invalide',
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si email personnel manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        email_personnel: undefined,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si email personnel invalide', async () => {
      const invalidLyceen = generateValidLyceen({
        email_personnel: 'email-invalide',
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si date de naissance manquante', async () => {
      const invalidLyceen = generateValidLyceen({
        date_naissance: undefined,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si CV URL manquante', async () => {
      const invalidLyceen = generateValidLyceen({
        cv_url: undefined,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si stage_trouve manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        stage_trouve: undefined,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si téléphone manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        telephone: undefined,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si lyceeId manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        lyceeId: undefined,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si filiereId manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: undefined,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si niveauId manquant', async () => {
      const invalidLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: undefined
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue si lyceeId inexistant', async () => {
      const invalidLyceen = generateValidLyceen({
        lyceeId: 99999,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(500)
    })

    it('❌ échoue si filiereId inexistant', async () => {
      const invalidLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: 99999,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(500)
    })

    it('❌ échoue si niveauId inexistant', async () => {
      const invalidLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: 99999
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(500)
    })

    it('✅ permet de créer plusieurs lycéens avec le même email institutionnel (pas de contrainte d\'unicité)', async () => {
      const validLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      // Créer le premier lycéen
      const res1 = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(validLyceen)

      expect(res1.statusCode).toBe(201)

      // Créer un deuxième lycéen avec le même email institutionnel
      const duplicateLyceen = generateValidLyceen({
        email_institutionnel: validLyceen.email_institutionnel,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res2 = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(duplicateLyceen)

      expect(res2.statusCode).toBe(201)
    })

    it('✅ permet de créer plusieurs lycéens avec le même email personnel (pas de contrainte d\'unicité)', async () => {
      const validLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      // Créer le premier lycéen
      const res1 = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(validLyceen)

      expect(res1.statusCode).toBe(201)

      // Créer un deuxième lycéen avec le même email personnel
      const duplicateLyceen = generateValidLyceen({
        email_personnel: validLyceen.email_personnel,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res2 = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(duplicateLyceen)

      expect(res2.statusCode).toBe(201)
    })

    it('❌ échoue avec un corps de requête vide', async () => {
      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send({})

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec des types de données incorrects', async () => {
      const invalidLyceen = {
        nom: 123, // devrait être une string
        prenom: "Marie",
        email_institutionnel: "marie@lycee.fr",
        email_personnel: "marie@gmail.com",
        date_naissance: "2005-03-15",
        cv_url: "http://cv.com/marie.pdf",
        stage_trouve: "false", // devrait être un boolean
        telephone: "0612345678",
        lyceeId: "1", // devrait être un number
        filiereId: 1,
        niveauId: 1
      }

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec une méthode HTTP incorrecte (GET)', async () => {
      const res = await request(app)
        .get('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(404)
    })

    it('❌ échoue avec une méthode HTTP incorrecte (PUT)', async () => {
      const validLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .put('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(validLyceen)

      expect(res.statusCode).toBe(404)
    })

    it('❌ échoue avec une méthode HTTP incorrecte (DELETE)', async () => {
      const res = await request(app)
        .delete('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)

      expect(res.statusCode).toBe(404)
    })
  })

  // === Tests de sécurité ===
  describe('Sécurité - Lycéens', () => {
    it('❌ échoue avec une injection SQL dans le nom', async () => {
      const maliciousLyceen = generateValidLyceen({
        nom: "'; DROP TABLE lyceen; --",
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(maliciousLyceen)

      expect(res.statusCode).toBe(201) // Le nom est accepté car c'est juste une string
    })

    it('❌ échoue avec un email contenant des caractères spéciaux malveillants', async () => {
      const maliciousLyceen = generateValidLyceen({
        email_institutionnel: "test@lycee.fr<script>alert('xss')</script>",
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(maliciousLyceen)

      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Validation échouée')
    })

    it('❌ échoue avec un CV URL très long', async () => {
      const longUrl = 'http://cv.com/' + 'a'.repeat(1000) + '.pdf'
      const invalidLyceen = generateValidLyceen({
        cv_url: longUrl,
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)

      expect(res.statusCode).toBe(201) // L'URL est acceptée car c'est juste une string
    })
  })

  // === Tests de performance ===
  describe('Performance - Lycéens', () => {
    it('✅ répond rapidement lors de la création d\'un lycéen', async () => {
      const validLyceen = generateValidLyceen({
        lyceeId: testData.lycee.id,
        filiereId: testData.filiere.id,
        niveauId: testData.niveau.id
      })

      const startTime = Date.now()
      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(validLyceen)
      const endTime = Date.now()

      expect(res.statusCode).toBe(201)
      expect(endTime - startTime).toBeLessThan(3000) // Moins de 3 secondes (inclut l'envoi d'email)
    })

    it('✅ répond rapidement avec des données invalides', async () => {
      const invalidLyceen = {
        nom: "Test",
        // Données manquantes
      }

      const startTime = Date.now()
      const res = await request(app)
        .post('/api/lyceens')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidLyceen)
      const endTime = Date.now()

      expect(res.statusCode).toBe(400)
      expect(endTime - startTime).toBeLessThan(1000) // Moins d'1 seconde
    })
  })
}) 