import express from 'express'
import { login } from '../controllers/auth.controller'
import { validateLogin } from '../validations/auth.validation'

const router = express.Router()

// Route de connexion (login du lycée)
router.post('/login', validateLogin, login)

export default router
