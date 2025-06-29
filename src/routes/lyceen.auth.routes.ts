import express from 'express'
import { lyceenLogin } from '../controllers/lyceen.auth.controller'

const router = express.Router()

/**
 * @swagger
 * /lyceen/login:
 *   post:
 *     summary: Connexion d'un lycéen
 *     description: Authentifie un lycéen avec son email (institutionnel ou personnel) et son mot de passe.
 *     tags: [Lycéen]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', lyceenLogin)
export default router 