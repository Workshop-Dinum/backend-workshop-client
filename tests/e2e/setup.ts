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

// Nettoyage des données après chaque test
afterEach(async () => {
  await prisma.lyceen.deleteMany();
  await prisma.lycee.deleteMany();
  // Ajouter d'autres entités ici si besoin (offres, candidatures, etc.)
});

// Déconnexion propre après tous les tests
afterAll(async () => {
  await prisma.$disconnect();
  console.log('🧹 Déconnexion base de données (test)');
});
