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

const router = express.Router()

// Créer une entreprise (pas besoin de token)
router.post('/', validateCreationEntreprise, createEntreprise)

// Publier une offre (protégé)
router.post('/offres', authenticateEntreprise, validateCreationOffre, publierOffre)

// Liste des lycées (filtrable)
router.get('/lycees', authenticateEntreprise, getLycees)

// Liste des lycéens d'un lycée
router.get('/lycees/:id/eleves', authenticateEntreprise, getLyceensParLycee)

// Proposer une offre à un lycéen
router.post('/propositions', authenticateEntreprise, validateProposition, proposerOffre)

// Liste de toutes les entreprises
router.get('/entreprises', getAllEntreprises)

// Profil de l'entreprise connectée
router.get('/entreprises/profil', authenticateEntreprise, getEntrepriseProfil)

// Login entreprise
router.post('/entreprises/login', validateLoginEntreprise, loginEntreprise)

export default router
