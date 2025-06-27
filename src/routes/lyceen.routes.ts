import express from 'express'
import { addLyceen } from '../controllers/lyceen.controller'
import { validateLyceen } from '../validations/lyceen.validation'
import { authenticateToken } from '../middlewares/auth.middleware'

const router = express.Router()

// Ajout d’un lycéen (protégé par token JWT)
router.post('/', authenticateToken, validateLyceen, addLyceen)

export default router
