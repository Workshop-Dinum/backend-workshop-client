import dotenv from 'dotenv';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// Charge .env.test depuis la racine du projet (important pour éviter les mauvaises URL)
dotenv.config({ path: path.resolve(process.cwd(), '.env.test') });
console.log('🎯 DATABASE_URL utilisée :', process.env.DATABASE_URL);

const prisma = new PrismaClient();

// Connexion à la base de données avant tous les tests
beforeAll(async () => {
  await prisma.$connect();
  console.log('✅ Base de données connectée (test)');
});

beforeEach(async () => {
  // Nettoyer toutes les données de test avant chaque test
  // Ordre important : supprimer d'abord les entités qui dépendent des autres
  await prisma.proposition.deleteMany();
  await prisma.offreFiliere.deleteMany();
  await prisma.lyceeFiliere.deleteMany();
  await prisma.lyceen.deleteMany();
  await prisma.lycee.deleteMany();
  await prisma.offre.deleteMany();
  await prisma.entreprise.deleteMany();
  await prisma.filiere.deleteMany();
  await prisma.niveau.deleteMany();
  await prisma.secteurActivite.deleteMany();
});

afterEach(async () => {
  // Nettoyage supplémentaire après chaque test
  await prisma.proposition.deleteMany();
  await prisma.offreFiliere.deleteMany();
  await prisma.lyceeFiliere.deleteMany();
  await prisma.lyceen.deleteMany();
  await prisma.lycee.deleteMany();
  await prisma.offre.deleteMany();
  await prisma.entreprise.deleteMany();
  await prisma.filiere.deleteMany();
  await prisma.niveau.deleteMany();
  await prisma.secteurActivite.deleteMany();
});

// Déconnexion propre après tous les tests
afterAll(async () => {
  await prisma.$disconnect();
  console.log('🧹 Déconnexion base de données (test)');
});
