import express from 'express'
import { createLycee, getLycees } from '../controllers/lycee.controller'
import { validateLycee } from '../validations/lycee.validation'

const router = express.Router()

// Création d’un lycée
router.post('/', validateLycee, createLycee)

// Récupération de la liste des lycées
router.get('/', getLycees)

export default router
