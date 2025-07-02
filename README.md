# 🎓 Plateforme de Mise en Relation Lycées - Entreprises

Ce projet est une API RESTful construite avec **Node.js**, **Express**, **Prisma**, **PostgreSQL** et **TypeScript**, permettant de connecter des **lycées professionnels**, **lycéens** et **entreprises** pour faciliter le **recrutement de stagiaires**.

---

## 🚀 Fonctionnalités

### 👨‍🏫 Lycée Professionnel
- Créer un compte lycée
- Ajouter des lycéens
- Accéder au profil établissement

### 👨‍🎓 Lycéen
- Connexion via email personnel
- Modifier son profil (CV, téléphone)
- Parcourir les offres disponibles
- Postuler à une offre
- Recevoir des propositions ciblées

### 🏢 Entreprise
- Créer un compte entreprise
- Publier une offre de stage
- Filtrer et consulter les lycées/lycéens
- Proposer une offre à un lycéen
- Voir les candidatures reçues

---

## 📦 Prérequis

- [Node.js](https://nodejs.org/) >= 18
- [npm](https://www.npmjs.com/) >= 9
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/) (pour l'environnement complet)

## ⚙️ Installation

1. **Cloner le dépôt**
   ```bash
   git clone <url-du-repo>
   cd backend-workshop-client
   ```
2. **Installer les dépendances**
   ```bash
   npm install
   ```
3. **Configurer les variables d'environnement**
   - Copier le fichier `.env.example` en `.env` et adapter les valeurs (voir section Variables d'environnement).

## 🗄️ Base de données & Prisma

- **Générer le client Prisma**
  ```bash
  npx prisma generate
  ```
- **Appliquer les migrations**
  ```bash
  npx prisma migrate dev
  ```
- **Accéder à Prisma Studio** (interface d'administration)
  ```bash
  npx prisma studio
  ```

## 🐳 Lancement avec Docker

1. **Démarrer l'environnement complet (API + PostgreSQL)**
   ```bash
   docker-compose up --build
   ```
   L'API sera disponible sur [http://localhost:3000](http://localhost:3000)

2. **Arrêter l'environnement**
   ```bash
   docker-compose down
   ```

## 🏃 Lancement en local (hors Docker)

1. **Démarrer la base de données (si besoin)**
   - Via Docker Compose : `docker-compose up db`
2. **Lancer l'API en mode développement**
   ```bash
   npm run dev
   ```

## 🧪 Tests

Pour garantir l'isolation entre le développement et les tests, une base de données dédiée est utilisée pour les tests.

- **Fichier d'environnement de test** : créez un fichier `.env.test` à la racine du projet, en reprenant la structure de `.env` mais en adaptant la base de données et les variables pour l'environnement de test.
- **Préparer la base de test** :
  1. Créez la base de test dans PostgreSQL si elle n'existe pas.
  2. Appliquez les migrations Prisma sur la base de test :
     ```bash
     npx cross-env NODE_ENV=test npx prisma migrate deploy
     ```
- **Lancer les tests end-to-end**
  ```bash
  npm run test:e2e
  ```

> Les tests utiliseront automatiquement la configuration de `.env.test` grâce à la variable d'environnement `NODE_ENV=test` dans les scripts npm.

## 🗂️ Structure du projet

```
├── src/
│   ├── controllers/      # Logique métier des routes
│   ├── routes/           # Définition des endpoints
│   ├── services/         # Services applicatifs
│   ├── middlewares/      # Middlewares Express
│   ├── validations/      # Schémas de validation Zod
│   ├── utils/            # Fonctions utilitaires
│   ├── config/           # Configuration (env, etc.)
│   ├── app.ts            # App Express
│   └── server.ts         # Point d'entrée serveur
├── prisma/
│   ├── schema.prisma     # Modèle de données
│   └── migrations/       # Migrations SQL
├── swagger/              # Documentation OpenAPI/Swagger
├── docker/               # Dockerfiles & scripts init
├── tests/                # Tests unitaires et e2e
```

## 📑 Documentation API

- **Swagger UI** :
  - Développement : [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
  - Production : `https://backend-workshop-client.onrender.com/api-docs`
- Voir `swagger/README.md` pour plus de détails sur les endpoints et l'utilisation de la documentation interactive.

## 🔒 Sécurité

- Authentification par JWT (expiration 1h)
- Mots de passe hashés avec bcrypt
- Validation des données avec Zod
- Protection des headers avec Helmet

## 🌍 Déploiement

- **Production** : déployé sur Render
- **Docker** :
  - `docker-compose.yml` orchestre l'API et la base PostgreSQL
  - Dockerfile.dev et Dockerfile.prod pour les différents environnements

## ⚠️ Variables d'environnement principales

À définir dans `.env` (et `.env.test` pour les tests) :
- `DATABASE_URL` : URL de connexion PostgreSQL
- `JWT_SECRET` : Clé secrète JWT
- `FRONTEND_URL` : URL du frontend pour les liens de réinitialisation
- `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` : pour la base de données (utilisés par Docker)

## 📚 Liens utiles

- [Prisma Docs](https://www.prisma.io/docs/)
- [Express Docs](https://expressjs.com/)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Swagger/OpenAPI](https://swagger.io/docs/)

---

**Pour toute question, consulte la documentation Swagger ou le code source.**