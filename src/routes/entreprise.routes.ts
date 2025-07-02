import express from 'express'
import {
  createEntreprise,
  publierOffre,
  getLycees,
  getLyceensParLycee,
  proposerOffre,
  getAllEntreprises,
  getEntrepriseProfil,
  loginEntreprise
} from '../controllers/entreprise.controller'

import { authenticateEntreprise } from '../middlewares/entreprise.middleware'
import {
  validateCreationEntreprise,
  validateCreationOffre,
  validateProposition,
  validateLoginEntreprise
} from '../validations/entreprise.validation'
import { cacheMiddleware } from '../middlewares/cacheMiddleware'

const router = express.Router()

/**
 * @swagger
 * /entreprises:
 *   post:
 *     tags: [Entreprise]
 *     summary: Créer une entreprise
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EntrepriseCreation'
 *     responses:
 *       201:
 *         description: Entreprise créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entreprise'
 *       400:
 *         description: Erreur de validation ou doublon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *
 *   get:
 *     tags: [Entreprise]
 *     summary: Liste toutes les entreprises
 *     responses:
 *       200:
 *         description: Liste des entreprises
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Entreprise'
 */
// Créer une entreprise (pas besoin de token)
router.post('/', validateCreationEntreprise, createEntreprise)

// Liste de toutes les entreprises
router.get('/', cacheMiddleware, getAllEntreprises)

/**
 * @swagger
 * /entreprises/login:
 *   post:
 *     tags: [Entreprise]
 *     summary: Authentifier une entreprise
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@entreprise.com
 *               mot_de_passe:
 *                 type: string
 *                 example: azerty1
 *     responses:
 *       200:
 *         description: Token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Erreur de validation
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
router.post('/login', validateLoginEntreprise, loginEntreprise)

/**
 * @swagger
 * /entreprises/profil:
 *   get:
 *     tags: [Entreprise]
 *     summary: Récupérer le profil de l'entreprise connectée
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil de l'entreprise
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Entreprise'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Entreprise non trouvée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profil', authenticateEntreprise, getEntrepriseProfil)

/**
 * @swagger
 * /entreprises/offres:
 *   post:
 *     tags: [Offre]
 *     summary: Publier une offre
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OffreCreation'
 *     responses:
 *       201:
 *         description: Offre créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Offre'
 *       400:
 *         description: Erreur de validation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
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
router.post('/offres', authenticateEntreprise, validateCreationOffre, publierOffre)

/**
 * @swagger
 * /entreprises/propositions:
 *   post:
 *     tags: [Proposition]
 *     summary: Proposer une offre à un lycéen
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropositionCreation'
 *     responses:
 *       201:
 *         description: Proposition créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proposition'
 *       400:
 *         description: Erreur de validation ou doublon
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Offre ou lycéen introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/propositions', authenticateEntreprise, validateProposition, proposerOffre)

/**
 * @swagger
 * /entreprises/lycees:
 *   get:
 *     tags: [Lycée]
 *     summary: Liste des lycées (filtrable)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Filtrer par région
 *       - in: query
 *         name: departement
 *         schema:
 *           type: string
 *         description: Filtrer par département
 *     responses:
 *       200:
 *         description: Liste des lycées
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lycee'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/lycees', authenticateEntreprise, cacheMiddleware, getLycees)

/**
 * @swagger
 * /entreprises/lycees/{id}/eleves:
 *   get:
 *     tags: [Lycéen]
 *     summary: Liste des lycéens d'un lycée
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID du lycée
 *     responses:
 *       200:
 *         description: Liste des lycéens
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Lyceen'
 *       401:
 *         description: Non authentifié
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/lycees/:id/eleves', authenticateEntreprise, cacheMiddleware, getLyceensParLycee)

export default router
