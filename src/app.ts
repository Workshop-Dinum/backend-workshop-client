// src/app.ts
import express from 'express'
import { setupApp } from './services/setup'

const app = express()

setupApp(app);

export default app
