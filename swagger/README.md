# Documentation Swagger - API Backend Workshop

## 📖 Vue d'ensemble

Cette documentation Swagger décrit l'API REST pour la gestion des lycées et lycéens. Elle est générée automatiquement à partir des commentaires JSDoc dans le code.

## 🚀 Accès à la documentation

### Développement
Une fois l'application démarrée, la documentation est accessible à l'adresse :
```
http://localhost:3000/api-docs
```

### Production
La documentation est également disponible en production :
```
https://backend-workshop-client.onrender.com/api-docs
```

## 📋 Endpoints disponibles

### 🔐 Authentification
- `POST /api/login` - Connexion d'un lycée

### 🔑 Mot de passe
- `POST /api/password/forgot` - Demande de réinitialisation de mot de passe
- `POST /api/password/reset-password` - Réinitialisation du mot de passe

### 🏫 Lycées
- `POST /api/lycees` - Créer un nouveau lycée
- `GET /api/lycees` - Récupérer tous les lycées
- `GET /api/lycees/profil` - Récupérer le profil du lycée connecté

### 👨‍🎓 Parcours Lycéen
- `POST /api/lyceen/login` - Connexion d'un lycéen
- `GET /api/lyceen/profil` - Récupérer le profil du lycéen connecté
- `PUT /api/lyceen/profil` - Mettre à jour le profil du lycéen (téléphone, CV)
- `GET /api/lyceen/offres` - Lister les offres de stage filtrées
- `POST /api/lyceen/offres/{id}/postuler` - Postuler à une offre

## 🔧 Configuration

### Variables d'environnement
- `JWT_SECRET` - Clé secrète pour les tokens JWT
- `FRONTEND_URL` - URL du frontend pour les liens de réinitialisation

### Authentification
Les endpoints protégés nécessitent un token JWT dans le header :
```
Authorization: Bearer <token>
```

## 📝 Utilisation

1. **Démarrer l'application** :
   ```bash
   npm run dev
   ```

2. **Accéder à la documentation** :
   - Développement : `http://localhost:3000/api-docs`
   - Production : `https://backend-workshop-client.onrender.com/api-docs`

3. **Tester les endpoints** :
   - Cliquer sur un endpoint pour l'étendre
   - Cliquer sur "Try it out" pour tester
   - Remplir les paramètres requis
   - Cliquer sur "Execute"

## 🏗️ Structure des fichiers

```
swagger/
├── README.md              # Ce fichier
├── swagger.config.ts      # Configuration Swagger
└── schemas/               # Schémas de données
    ├── auth.yaml         # Schémas d'authentification
    ├── lycee.yaml        # Schémas des lycées
    └── lyceen.yaml       # Schémas des lycéens
```

## 🔄 Mise à jour de la documentation

Pour mettre à jour la documentation :

1. **Modifier les commentaires JSDoc** dans les fichiers de routes
2. **Ajouter/modifier les schémas** dans les fichiers YAML
3. **Redémarrer l'application** pour voir les changements
4. **Déployer** pour mettre à jour la documentation en production

## 📊 Codes de réponse

- `200` - Succès
- `201` - Créé avec succès
- `400` - Données invalides
- `401` - Non authentifié
- `404` - Ressource non trouvée
- `500` - Erreur serveur

## 🛡️ Sécurité

- Les tokens JWT expirent après 1 heure
- Les mots de passe sont hashés avec bcrypt
- Validation des données avec Zod
- Protection CSRF avec Helmet

## 🌐 Déploiement

L'API est déployée sur Render :
- **URL de production** : `https://backend-workshop-client.onrender.com`
- **Documentation** : `https://backend-workshop-client.onrender.com/api-docs`

### 👨‍🎓 Parcours Lycéen
- `POST /api/lyceen/login` - Connexion d'un lycéen
- `GET /api/lyceen/profil` - Récupérer le profil du lycéen connecté
- `PUT /api/lyceen/profil` - Mettre à jour le profil du lycéen (téléphone, CV)
- `GET /api/lyceen/offres` - Lister les offres de stage filtrées
- `POST /api/lyceen/offres/{id}/postuler` - Postuler à une offre

#### Schémas utilisés
- `LoginRequest`, `LoginResponse` (auth.yaml)
- `Lyceen`, `LyceenUpdate` (lyceen.yaml)
- `OffreLyceen`, `OffreLyceenList`, `PropositionLyceen` (lyceen.yaml)
- `Error` (lyceen.yaml)

#### Exemples d'utilisation

- **Connexion lycéen**
  ```json
  POST /api/lyceen/login
  {
    "email": "marie.dupont@lycee.fr",
    "password": "motdepasse123"
  }
  // Réponse : { "token": "..." }
  ```

- **Récupérer le profil**
  ```json
  GET /api/lyceen/profil
  // Header: Authorization: Bearer <token>
  // Réponse : { ...profil lycéen... }
  ```

- **Mettre à jour le profil**
  ```json
  PUT /api/lyceen/profil
  {
    "telephone": "0612345678",
    "cv_url": "http://cv.com/marie-dupont.pdf"
  }
  // Réponse : { ...profil mis à jour... }
  ```

- **Lister les offres**
  ```json
  GET /api/lyceen/offres?region=Île-de-France&secteur=Informatique
  // Réponse : [ ...offres... ]
  ```

- **Postuler à une offre**
  ```json
  POST /api/lyceen/offres/3/postuler
  {
    "message": "Je suis très motivé par ce stage."
  }
  // Réponse : { ...proposition créée... }
  ``` 