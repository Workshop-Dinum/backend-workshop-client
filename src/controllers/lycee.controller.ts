import { Request, Response } from 'express'
import { createLyceeService, getLyceesService } from '../services/lycee.service'

// Crée un lycée à partir des données envoyées
export async function createLycee(req: Request, res: Response) {
  const lycee = await createLyceeService(req.body)
  res.status(201).json(lycee)
}

// Récupère la liste des lycées (avec filtres éventuels)
export async function getLycees(req: Request, res: Response) {
  const lycees = await getLyceesService(req.query)
  res.json(lycees)
}
