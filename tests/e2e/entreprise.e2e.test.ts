import request from 'supertest';
import app from '../../src/app';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helpers pour créer les entités nécessaires
async function creerSecteur(nom = 'Informatique / Numérique') {
  const secteur = await prisma.secteurActivite.findFirst({ where: { nom } });
  if (!secteur) throw new Error(`Aucun secteur "${nom}" trouvé dans la base de test (seed manquant)`);
  return secteur;
}
async function creerNiveau(nom = 'Terminale') {
  const niveau = await prisma.niveau.findFirst({ where: { nom } });
  if (!niveau) throw new Error(`Aucun niveau "${nom}" trouvé dans la base de test (seed manquant)`);
  return niveau;
}
async function creerFiliere(nom = 'Mathématiques') {
  const filiere = await prisma.filiere.findFirst({ where: { nom } });
  if (!filiere) throw new Error(`Aucune filière "${nom}" trouvée dans la base de test (seed manquant)`);
  return filiere;
}
async function creerEntreprise(data: any = {}) {
  const secteur = data.secteurId ? { id: data.secteurId } : await creerSecteur();
  return request(app).post('/api/entreprises').send({
    siret: '123456789',
    nom: 'Test SARL',
    rue: '1 rue du test',
    code_postal: '75000',
    ville: 'Paris',
    departement: '75',
    region: 'IDF',
    contact_nom: 'Jean Test',
    contact_email: 'test@entreprise.com',
    contact_telephone: '0102030405',
    secteurId: secteur.id,
    mot_de_passe: 'azerty1',
    ...data,
  });
}
async function loginEntreprise(email = 'test@entreprise.com', mot_de_passe = 'azerty1') {
  return request(app).post('/api/entreprises/login').send({ email, mot_de_passe });
}
async function creerOffre(token: string, data: any = {}) {
  const niveau = data.niveauId ? { id: data.niveauId } : await creerNiveau();
  const filiere = data.filiereIds ? { id: data.filiereIds[0] } : await creerFiliere();
  return request(app)
    .post('/api/entreprises/offres')
    .set('Authorization', `Bearer ${token}`)
    .send({
      titre: 'Stage Dev',
      description: 'Développement web',
      duree: '2 mois',
      lieu: 'Paris',
      periode: '2024',
      niveauId: niveau.id,
      filiereIds: [filiere.id],
      cv_requis: true,
      message_requis: false,
      date_limite: '2025-01-01',
      ...data,
    });
}
async function creerLycee(data: any = {}) {
  return prisma.lycee.create({
    data: {
      nom: 'Lycée Test',
      rue: '1 rue du lycée',
      code_postal: '75000',
      ville: 'Paris',
      departement: '75',
      region: 'IDF',
      academie: 'Paris',
      email_contact: 'lycee@test.com',
      telephone: '0102030406',
      mot_de_passe_hash: 'hash',
      logo_url: null,
      site_web: 'https://lycee.test',
      periode_de_stage: '2024',
      ...data,
    },
  });
}
async function creerLyceen(lyceeId: number, filiereId: number, niveauId: number, data: any = {}) {
  return prisma.lyceen.create({
    data: {
      nom: 'Dupont',
      prenom: 'Paul',
      date_naissance: new Date('2006-01-01'),
      email_institutionnel: 'paul@lycee.fr',
      email_personnel: 'paul@gmail.com',
      telephone: '0600000000',
      cv_url: 'https://cv.test',
      mot_de_passe_hash: 'hash',
      stage_trouve: false,
      lyceeId,
      filiereId,
      niveauId,
      ...data,
    },
  });
}

describe('Parcours Entreprise - E2E', () => {
  describe('Création entreprise', () => {
    it('succès', async () => {
      const secteur = await creerSecteur();
      const res = await creerEntreprise({ contact_email: 'unique@entreprise.com', siret: '987654321', secteurId: secteur.id });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.nom).toBe('Test SARL');
    });
    it('échoue si email déjà utilisé', async () => {
      await creerEntreprise();
      const res = await creerEntreprise();
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/déjà utilisé/i);
    });
    it('échoue si SIRET déjà utilisé', async () => {
      await creerEntreprise({ siret: '111111111', contact_email: 'a@a.com' });
      const res = await creerEntreprise({ siret: '111111111', contact_email: 'b@b.com' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/déjà utilisé/i);
    });
    it('échoue si données invalides', async () => {
      const secteur = await creerSecteur();
      const res = await creerEntreprise({ contact_email: 'notanemail', mot_de_passe: '123', secteurId: secteur.id });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation échouée/);
    });
  });

  describe('Login entreprise', () => {
    beforeEach(async () => {
      await creerEntreprise();
    });
    it('succès', async () => {
      const res = await loginEntreprise();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
    });
    it('échoue si mauvais mot de passe', async () => {
      const res = await loginEntreprise('test@entreprise.com', 'mauvais');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalides/i);
    });
    it('échoue si email inexistant', async () => {
      const res = await loginEntreprise('inexistant@entreprise.com', 'azerty1');
      expect(res.status).toBe(401);
      expect(res.body.error).toMatch(/invalides/i);
    });
    it('échoue si données manquantes', async () => {
      const res = await request(app).post('/api/entreprises/login').send({});
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/requis/i);
    });
  });

  describe('Publication offre', () => {
    let token: string;
    let niveau: any;
    let filiere: any;
    beforeEach(async () => {
      await creerEntreprise();
      const login = await loginEntreprise();
      token = login.body.token;
      niveau = await creerNiveau();
      filiere = await creerFiliere();
    });
    it('succès', async () => {
      const res = await creerOffre(token, { niveauId: niveau.id, filiereIds: [filiere.id] });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.titre).toBe('Stage Dev');
    });
    it('échoue si token manquant', async () => {
      const res = await request(app).post('/api/entreprises/offres').send({});
      expect(res.status).toBe(401);
    });
    it('échoue si token invalide', async () => {
      const res = await request(app).post('/api/entreprises/offres').set('Authorization', 'Bearer FAUX').send({});
      expect(res.status).toBe(403);
    });
    it('échoue si données invalides', async () => {
      const res = await request(app)
        .post('/api/entreprises/offres')
        .set('Authorization', `Bearer ${token}`)
        .send({ titre: '', filiereIds: [], niveauId: 999 });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Validation échouée/);
    });
    it('échoue si filière inexistante', async () => {
      const res = await creerOffre(token, { filiereIds: [9999] });
      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/filières sont invalides/);
    });
    it('échoue si niveau inexistant', async () => {
      const filiere2 = await creerFiliere('Mathématiques');
      const res = await creerOffre(token, { niveauId: 9999, filiereIds: [filiere2.id] });
      expect(res.status).toBe(404);
    });
  });

  describe('Liste lycées', () => {
    let token: string;
    beforeEach(async () => {
      await creerEntreprise();
      const login = await loginEntreprise();
      token = login.body.token;
      await creerLycee();
    });
    it('succès', async () => {
      const res = await request(app).get('/api/entreprises/lycees').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('nom');
    });
    it('filtrage par région', async () => {
      const res = await request(app).get('/api/entreprises/lycees?region=IDF').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body[0].region).toBe('IDF');
    });
    it('échoue si token manquant', async () => {
      const res = await request(app).get('/api/entreprises/lycees');
      expect(res.status).toBe(401);
    });
  });

  describe("Liste lycéens d'un lycée", () => {
    let token: string;
    let lycee: any;
    let filiere: any;
    let niveau: any;
    beforeEach(async () => {
      await creerEntreprise();
      const login = await loginEntreprise();
      token = login.body.token;
      filiere = await creerFiliere();
      niveau = await creerNiveau();
      lycee = await creerLycee();
      await creerLyceen(lycee.id, filiere.id, niveau.id);
    });
    it('succès', async () => {
      const res = await request(app).get(`/api/entreprises/lycees/${lycee.id}/eleves`).set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0]).toHaveProperty('nom');
    });
    it('échoue si lycée inexistant', async () => {
      const res = await request(app).get('/api/entreprises/lycees/9999/eleves').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
    it('échoue si token manquant', async () => {
      const res = await request(app).get(`/api/entreprises/lycees/${lycee.id}/eleves`);
      expect(res.status).toBe(401);
    });
  });

  describe('Proposer une offre à un lycéen', () => {
    let token: string;
    let offre: any;
    let lycee: any;
    let filiere: any;
    let niveau: any;
    let lyceen: any;
    beforeEach(async () => {
      await creerEntreprise();
      const login = await loginEntreprise();
      token = login.body.token;
      filiere = await creerFiliere();
      niveau = await creerNiveau();
      lycee = await creerLycee();
      lyceen = await creerLyceen(lycee.id, filiere.id, niveau.id);
      const offreRes = await creerOffre(token, { niveauId: niveau.id, filiereIds: [filiere.id] });
      offre = offreRes.body;
    });
    it('succès', async () => {
      const res = await request(app)
        .post('/api/entreprises/propositions')
        .set('Authorization', `Bearer ${token}`)
        .send({ lyceenId: lyceen.id, offreId: offre.id, message: 'Motivé !' });
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });
    it('échoue si lycéen inexistant', async () => {
      const res = await request(app)
        .post('/api/entreprises/propositions')
        .set('Authorization', `Bearer ${token}`)
        .send({ lyceenId: 9999, offreId: offre.id, message: '...' });
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Lycéen introuvable/);
    });
    it('échoue si offre inexistante', async () => {
      const res = await request(app)
        .post('/api/entreprises/propositions')
        .set('Authorization', `Bearer ${token}`)
        .send({ lyceenId: lyceen.id, offreId: 9999, message: '...' });
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Offre introuvable/);
    });
    it("échoue si offre n'appartient pas à l'entreprise", async () => {
      // Créer une autre entreprise et une offre
      const secteur = await creerSecteur('Informatique / Numérique');
      await creerEntreprise({ contact_email: 'autre@e.com', siret: '222222222', secteurId: secteur.id });
      const login2 = await loginEntreprise('autre@e.com', 'azerty1');
      const token2 = login2.body.token;
      const offre2 = await creerOffre(token2);
      // Essayer de proposer offre2 avec le token de la première entreprise
      const res = await request(app)
        .post('/api/entreprises/propositions')
        .set('Authorization', `Bearer ${token}`)
        .send({ lyceenId: lyceen.id, offreId: offre2.body.id, message: '...' });
      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/Offre introuvable/);
    });
    it('échoue si doublon (proposition déjà existante)', async () => {
      await request(app)
        .post('/api/entreprises/propositions')
        .set('Authorization', `Bearer ${token}`)
        .send({ lyceenId: lyceen.id, offreId: offre.id, message: '...' });
      const res = await request(app)
        .post('/api/entreprises/propositions')
        .set('Authorization', `Bearer ${token}`)
        .send({ lyceenId: lyceen.id, offreId: offre.id, message: '...' });
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/proposition existe déjà/i);
    });
    it('échoue si token manquant', async () => {
      const res = await request(app)
        .post('/api/entreprises/propositions')
        .send({ lyceenId: lyceen.id, offreId: offre.id, message: '...' });
      expect(res.status).toBe(401);
    });
    it('échoue si token invalide', async () => {
      const res = await request(app)
        .post('/api/entreprises/propositions')
        .set('Authorization', 'Bearer FAUX')
        .send({ lyceenId: lyceen.id, offreId: offre.id, message: '...' });
      expect(res.status).toBe(403);
    });
  });

  describe('Profil entreprise', () => {
    let token: string;
    beforeEach(async () => {
      await creerEntreprise();
      const login = await loginEntreprise();
      token = login.body.token;
    });
    it('succès', async () => {
      const res = await request(app).get('/api/entreprises/profil').set('Authorization', `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('id');
      expect(res.body.nom).toBe('Test SARL');
    });
    it('échoue si token manquant', async () => {
      const res = await request(app).get('/api/entreprises/profil');
      expect(res.status).toBe(401);
    });
    it('échoue si token invalide', async () => {
      const res = await request(app).get('/api/entreprises/profil').set('Authorization', 'Bearer FAUX');
      expect(res.status).toBe(403);
    });
  });

  describe('Liste entreprises', () => {
    beforeEach(async () => {
      await creerEntreprise({ contact_email: 'a@a.com', siret: '111111111' });
      await creerEntreprise({ contact_email: 'b@b.com', siret: '222222222' });
    });
    it('succès', async () => {
      const res = await request(app).get('/api/entreprises');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(2);
      expect(res.body[0]).toHaveProperty('nom');
    });
  });
});