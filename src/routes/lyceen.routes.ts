import express from 'express'
import { addLyceen } from '../controllers/lyceen.controller'
import { validateLyceen } from '../validations/lyceen.validation'
import { authenticateToken } from '../middlewares/auth.middleware'

const router = express.Router()

/**
 * @swagger
 * /lyceens:
 *   post:
 *     summary: Ajouter un nouveau lycéen
 *     description: Crée un nouveau lycéen avec les informations fournies (requiert authentification)
 *     tags: [Lycéens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LyceenCreate'
 *     responses:
 *       201:
 *         description: Lycéen créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Lyceen'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token d'authentification invalide
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
router.post('/', authenticateToken, validateLyceen, addLyceen)

export default router
