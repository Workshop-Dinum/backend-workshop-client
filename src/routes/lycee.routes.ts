import express from 'express'
import { createLycee, getLycees, getLyceeProfil } from '../controllers/lycee.controller'
import { validateLycee } from '../validations/lycee.validation'
import { authenticateToken } from '../middlewares/auth.middleware'
import { cacheMiddleware } from '../middlewares/cacheMiddleware'

const router = express.Router()

/**
 * @swagger
 * /lycees:
 *   post:
 *     summary: Créer un nouveau lycée
 *     description: Crée un nouveau lycée avec les informations fournies
 *     tags: [Lycées]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LyceeCreate'
 *     responses:
 *       201:
 *         description: Lycée créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lycee'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/', validateLycee, createLycee)

/**
 * @swagger
 * /lycees:
 *   get:
 *     summary: Récupérer tous les lycées
 *     description: Retourne la liste de tous les lycées
 *     tags: [Lycées]
 *     responses:
 *       200:
 *         description: Liste des lycées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lycee'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', cacheMiddleware, getLycees)

/**
 * @swagger
 * /lycees/profil:
 *   get:
 *     summary: Récupérer le profil du lycée connecté
 *     description: Retourne les informations du lycée authentifié
 *     tags: [Lycées]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil du lycée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lycee'
 *       401:
 *         description: Token d'authentification invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Lycée non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Erreur serveur
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profil', authenticateToken, getLyceeProfil)

export default router
