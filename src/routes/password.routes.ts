import express from 'express'
import { resetPassword } from '../controllers/password.controller'

const router = express.Router()

// Route pour réinitialiser le mot de passe
router.post('/reset-password', resetPassword)

export default router
