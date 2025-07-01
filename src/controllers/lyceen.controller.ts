import { Request, Response } from 'express'
import { createLyceenService } from '../services/lyceen.service'
import { Prisma } from '@prisma/client'

// Ajoute un lycéen (appelé depuis le lycée)
export async function addLyceen(req: Request, res: Response) {
  try {
    const lyceen = await createLyceenService(req.body)
    res.status(201).json(lyceen)
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2003') {
      return res.status(400).json({ error: 'Lycée, filière ou niveau inexistant.' })
    }
    throw e
  }
}
