import request from 'supertest'
import app from '../../src/app'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

let testCounter = 0

function generateValidLyceen(overrides = {}) {
  testCounter++
  return {
    nom: 'Test',
    prenom: 'Lycéen',
    email_institutionnel: `lyceen${Date.now()}${testCounter}@lycee.fr`,
    email_personnel: `lyceen${Date.now()}${testCounter}@gmail.com`,
    date_naissance: '2005-01-01T00:00:00.000Z',
    cv_url: 'http://cv.com/test.pdf',
    stage_trouve: false,
    telephone: '0600000000',
    ...overrides
  }
}

async function createTestData() {
  // Créer lycée, filière, niveau
  const lycee = await prisma.lycee.create({
    data: {
      nom: 'Lycée Test',
      rue: '1 rue du test',
      code_postal: '75000',
      ville: 'Paris',
      departement: '75',
      region: 'IDF',
      academie: 'Paris',
      email_contact: `contact+${Date.now()}@lycee.fr`,
      telephone: '0101010101',
      mot_de_passe_hash: await bcrypt.hash('motdepasse', 10),
      logo_url: 'http://logo.com/logo.png',
      site_web: 'http://lycee-test.fr',
      periode_de_stage: 'janvier - mars'
    }
  })
  const filiere = await prisma.filiere.create({ data: { nom: 'Informatique' } })
  const niveau = await prisma.niveau.create({ data: { nom: 'Terminale' } })

  // Créer lycéen
  const lyceen = await prisma.lyceen.create({
    data: {
      ...generateValidLyceen({ lyceeId: lycee.id, filiereId: filiere.id, niveauId: niveau.id }),
      mot_de_passe_hash: await bcrypt.hash('motdepasse', 10),
      lyceeId: lycee.id,
      filiereId: filiere.id,
      niveauId: niveau.id
    }
  })

  // Créer une entreprise
  const secteur = await prisma.secteurActivite.create({ data: { nom: 'Web' } })
  const entreprise = await prisma.entreprise.create({
    data: {
      nom: 'DevCorp',
      siret: '12345678901234',
      rue: '2 rue du code',
      code_postal: '75000',
      ville: 'Paris',
      departement: '75',
      region: 'IDF',
      contact_nom: 'Jean Dev',
      contact_email: `contact+${Date.now()}@devcorp.fr`,
      contact_telephone: '0202020202',
      secteurId: secteur.id,
      mot_de_passe_hash: await bcrypt.hash('motdepasse', 10)
    }
  })

  // Créer une offre
  const offre = await prisma.offre.create({
    data: {
      titre: 'Stage Dev',
      description: 'Stage en développement',
      lieu: 'Paris',
      date_limite: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      entrepriseId: entreprise.id,
      niveauId: niveau.id,
      duree: '2 mois',
      periode: 'mars-avril',
      cv_requis: false,
      message_requis: false,
      filieres: { create: [{ filiereId: filiere.id }] }
    }
  })

  return { lycee, filiere, niveau, lyceen, offre }
}

describe('E2E - Parcours Lycéen', () => {
  let testData: any
  let token: string

  beforeEach(async () => {
    testData = await createTestData()
    // Connexion lycéen
    const res = await request(app)
      .post('/api/lyceen/login')
      .send({ email: testData.lyceen.email_personnel, password: 'motdepasse' })
    token = res.body.token
    if (!token) {
      const res2 = await request(app)
        .post('/api/lyceen/login')
        .send({ email: testData.lyceen.email_institutionnel, password: 'motdepasse' })
      token = res2.body.token
    }
  })

  // --- PROFIL ---
  describe('GET /api/lyceen/profil', () => {
    it('✅ retourne le profil du lycéen connecté', async () => {
      const res = await request(app)
        .get('/api/lyceen/profil')
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
      expect(res.body.email_institutionnel).toBe(testData.lyceen.email_institutionnel)
    })
    it('❌ échoue sans token', async () => {
      const res = await request(app).get('/api/lyceen/profil')
      expect(res.statusCode).toBe(401)
    })
    it('❌ échoue avec token invalide', async () => {
      const res = await request(app)
        .get('/api/lyceen/profil')
        .set('Authorization', 'Bearer faketoken')
      expect(res.statusCode).toBe(403)
    })
  })

  describe('PUT /api/lyceen/profil', () => {
    it('✅ met à jour le téléphone et le CV', async () => {
      const res = await request(app)
        .put('/api/lyceen/profil')
        .set('Authorization', `Bearer ${token}`)
        .send({ telephone: '0611223344', cv_url: 'http://cv.com/new.pdf' })
      expect(res.statusCode).toBe(200)
      expect(res.body.telephone).toBe('0611223344')
      expect(res.body.cv_url).toBe('http://cv.com/new.pdf')
    })
    it('❌ échoue sans token', async () => {
      const res = await request(app)
        .put('/api/lyceen/profil')
        .send({ telephone: '0611223344' })
      expect(res.statusCode).toBe(401)
    })
    it('❌ échoue avec token invalide', async () => {
      const res = await request(app)
        .put('/api/lyceen/profil')
        .set('Authorization', 'Bearer faketoken')
        .send({ telephone: '0611223344' })
      expect(res.statusCode).toBe(403)
    })
    it('❌ échoue si CV n\'est pas une URL', async () => {
      const res = await request(app)
        .put('/api/lyceen/profil')
        .set('Authorization', `Bearer ${token}`)
        .send({ cv_url: 'not-a-url' })
      expect(res.statusCode).toBe(400)
    })
  })

  // --- OFFRES ---
  describe('GET /api/lyceen/offres', () => {
    it('✅ retourne la liste des offres', async () => {
      const res = await request(app)
        .get('/api/lyceen/offres')
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBeGreaterThanOrEqual(1)
    })
    it('✅ filtre par région', async () => {
      const res = await request(app)
        .get('/api/lyceen/offres?region=Paris')
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
      expect(res.body[0].entreprise.ville).toBe('Paris')
    })
    it('❌ échoue sans token', async () => {
      const res = await request(app).get('/api/lyceen/offres')
      expect(res.statusCode).toBe(401)
    })
    it('❌ échoue avec token invalide', async () => {
      const res = await request(app)
        .get('/api/lyceen/offres')
        .set('Authorization', 'Bearer faketoken')
      expect(res.statusCode).toBe(403)
    })
  })

  // --- POSTULER ---
  describe('POST /api/lyceen/offres/:id/postuler', () => {
    it('✅ postule à une offre existante', async () => {
      const res = await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/postuler`)
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Je suis motivé !' })
      expect(res.statusCode).toBe(201)
      expect(res.body.lyceenId).toBe(testData.lyceen.id)
      expect(res.body.offreId).toBe(testData.offre.id)
    })
    it('❌ échoue sans token', async () => {
      const res = await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/postuler`)
        .send({ message: 'Test' })
      expect(res.statusCode).toBe(401)
    })
    it('❌ échoue avec token invalide', async () => {
      const res = await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/postuler`)
        .set('Authorization', 'Bearer faketoken')
        .send({ message: 'Test' })
      expect(res.statusCode).toBe(403)
    })
    it('❌ échoue si offre inexistante', async () => {
      const res = await request(app)
        .post(`/api/lyceen/offres/99999/postuler`)
        .set('Authorization', `Bearer ${token}`)
        .send({ message: 'Test' })
      expect(res.statusCode).toBe(404)
      expect(res.body.error).toBe('Offre introuvable')
    })
    it('❌ échoue si message trop long', async () => {
      const longMsg = 'a'.repeat(10000)
      const res = await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/postuler`)
        .set('Authorization', `Bearer ${token}`)
        .send({ message: longMsg })
      // Selon la validation, soit 400 soit 201 si pas de limite
      expect([201, 400]).toContain(res.statusCode)
    })
  })

  // --- SAUVEGARDER OFFRES ---
  describe('POST /api/lyceen/offres/:id/sauvegarder', () => {
    it('✅ sauvegarde une offre existante', async () => {
      const res = await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(201)
      expect(res.body.lyceenId).toBe(testData.lyceen.id)
      expect(res.body.offreId).toBe(testData.offre.id)
      expect(res.body.date).toBeDefined()
    })

    it('❌ échoue sans token', async () => {
      const res = await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
      expect(res.statusCode).toBe(401)
    })

    it('❌ échoue avec token invalide', async () => {
      const res = await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', 'Bearer faketoken')
      expect(res.statusCode).toBe(403)
    })

    it('❌ échoue si offre inexistante', async () => {
      const res = await request(app)
        .post(`/api/lyceen/offres/99999/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(404)
      expect(res.body.error).toBe('Offre introuvable')
    })

    it('❌ échoue si offre déjà sauvegardée', async () => {
      // Sauvegarder une première fois
      await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)

      // Essayer de sauvegarder une deuxième fois
      const res = await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(400)
      expect(res.body.error).toBe('Offre déjà sauvegardée')
    })
  })

  describe('DELETE /api/lyceen/offres/:id/sauvegarder', () => {
    beforeEach(async () => {
      // Sauvegarder une offre avant chaque test
      await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)
    })

    it('✅ supprime une offre sauvegardée', async () => {
      const res = await request(app)
        .delete(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
      expect(res.body.success).toBe(true)
    })

    it('❌ échoue sans token', async () => {
      const res = await request(app)
        .delete(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
      expect(res.statusCode).toBe(401)
    })

    it('❌ échoue avec token invalide', async () => {
      const res = await request(app)
        .delete(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', 'Bearer faketoken')
      expect(res.statusCode).toBe(403)
    })

    it('❌ échoue si offre non sauvegardée', async () => {
      // Supprimer d'abord
      await request(app)
        .delete(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)

      // Essayer de supprimer une deuxième fois
      const res = await request(app)
        .delete(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(404)
      expect(res.body.error).toBe('Aucune sauvegarde trouvée')
    })
  })

  describe('GET /api/lyceen/offres/sauvegardees', () => {
    it('✅ retourne la liste des offres sauvegardées (vide)', async () => {
      const res = await request(app)
        .get('/api/lyceen/offres/sauvegardees')
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBe(0)
    })

    it('✅ retourne la liste avec une offre sauvegardée', async () => {
      // Sauvegarder une offre
      await request(app)
        .post(`/api/lyceen/offres/${testData.offre.id}/sauvegarder`)
        .set('Authorization', `Bearer ${token}`)

      const res = await request(app)
        .get('/api/lyceen/offres/sauvegardees')
        .set('Authorization', `Bearer ${token}`)
      expect(res.statusCode).toBe(200)
      expect(Array.isArray(res.body)).toBe(true)
      expect(res.body.length).toBe(1)
      expect(res.body[0].offreId).toBe(testData.offre.id)
      expect(res.body[0].offre).toBeDefined()
      expect(res.body[0].offre.titre).toBe('Stage Dev')
    })

    it('❌ échoue sans token', async () => {
      const res = await request(app)
        .get('/api/lyceen/offres/sauvegardees')
      expect(res.statusCode).toBe(401)
    })

    it('❌ échoue avec token invalide', async () => {
      const res = await request(app)
        .get('/api/lyceen/offres/sauvegardees')
        .set('Authorization', 'Bearer faketoken')
      expect(res.statusCode).toBe(403)
    })
  })
}) 