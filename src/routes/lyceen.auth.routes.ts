import express from 'express'
import { lyceenLogin } from '../controllers/lyceen.auth.controller'

const router = express.Router()
router.post('/login', lyceenLogin)
export default router 