import express from 'express'
import { resetPassword, forgotPassword } from '../controllers/password.controller'

const router = express.Router()

// Route pour demander la réinitialisation du mot de passe
router.post('/password/forgot', forgotPassword)

// Route pour réinitialiser le mot de passe
router.post('/password/reset-password', resetPassword)

export default router
