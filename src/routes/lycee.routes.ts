import express from 'express'
import { createLycee, getLycees, getLyceeProfil } from '../controllers/lycee.controller'
import { validateLycee } from '../validations/lycee.validation'
import { authenticateToken } from '../middlewares/auth.middleware'

const router = express.Router()

// Création d’un lycée
router.post('/', validateLycee, createLycee)

// Récupération de la liste des lycées
router.get('/', getLycees)

// Récupère les infos du lycée connecté avec le token
router.get('/profil', authenticateToken, getLyceeProfil)

export default router
