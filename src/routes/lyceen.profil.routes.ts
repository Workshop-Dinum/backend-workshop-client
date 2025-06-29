import express from 'express'
import {
  getLyceenProfil,
  updateLyceenProfil,
  getOffres,
  postulerOffre
} from '../controllers/lyceen.profil.controller'

import { authenticateLyceen } from '../middlewares/lyceen.middleware'
import { validateUpdateProfil, validatePostuler } from '../validations/lyceen.profil.validation'

const router = express.Router()

/**
 * @swagger
 * /lyceen/profil:
 *   get:
 *     summary: Récupérer le profil du lycéen connecté
 *     tags: [Lycéen]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil du lycéen
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Lyceen'
 *       401:
 *         description: Token d'authentification invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Error'
 *       404:
 *         description: Lycéen non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Error'
 */
router.get('/profil', authenticateLyceen, getLyceenProfil)

/**
 * @swagger
 * /lyceen/profil:
 *   put:
 *     summary: Mettre à jour le profil du lycéen
 *     tags: [Lycéen]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/LyceenUpdate'
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Lyceen'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Error'
 *       401:
 *         description: Token d'authentification invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Error'
 */
router.put('/profil', authenticateLyceen, validateUpdateProfil, updateLyceenProfil)

/**
 * @swagger
 * /lyceen/offres:
 *   get:
 *     summary: Lister les offres de stage filtrées
 *     tags: [Lycéen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: region
 *         schema:
 *           type: string
 *         description: Région à filtrer
 *       - in: query
 *         name: secteur
 *         schema:
 *           type: string
 *         description: Secteur d'activité à filtrer
 *       - in: query
 *         name: nom_entreprise
 *         schema:
 *           type: string
 *         description: Nom de l'entreprise à filtrer
 *     responses:
 *       200:
 *         description: Liste des offres
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/OffreLyceenList'
 *       401:
 *         description: Token d'authentification invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Error'
 */
router.get('/offres', authenticateLyceen, getOffres)

/**
 * @swagger
 * /lyceen/offres/{id}/postuler:
 *   post:
 *     summary: Postuler à une offre
 *     tags: [Lycéen]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de l'offre
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message de motivation (optionnel)
 *     responses:
 *       201:
 *         description: Proposition créée
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/PropositionLyceen'
 *       400:
 *         description: Données invalides
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Error'
 *       401:
 *         description: Token d'authentification invalide
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Error'
 *       404:
 *         description: Offre introuvable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '../swagger/schemas/lyceen.yaml#/components/schemas/Error'
 */
router.post('/offres/:id/postuler', authenticateLyceen, validatePostuler, postulerOffre)

export default router
