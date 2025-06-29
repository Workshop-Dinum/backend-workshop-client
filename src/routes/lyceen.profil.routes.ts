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
 */
router.post('/offres/:id/postuler', authenticateLyceen, validatePostuler, postulerOffre)

export default router
