import { Request, Response } from 'express'
import { createLyceenService } from '../services/lyceen.service'

// Ajoute un lycéen (appelé depuis le lycée)
export async function addLyceen(req: Request, res: Response) {
  const lyceen = await createLyceenService(req.body)
  res.status(201).json(lyceen)
}
