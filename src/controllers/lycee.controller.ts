import { Request, Response } from 'express'
import { createLyceeService, getLyceesService } from '../services/lycee.service'
import prisma from '../config/db'
import { Prisma } from '@prisma/client'

// Crée un lycée à partir des données envoyées
export async function createLycee(req: Request, res: Response) {
  try {
    const lycee = await createLyceeService(req.body)
    res.status(201).json(lycee)
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
      return res.status(400).json({ error: 'Cet email est déjà utilisé.' })
    }
    throw e
  }
}

// Récupère la liste des lycées (avec filtres éventuels)
export async function getLycees(req: Request, res: Response) {
  const lycees = await getLyceesService(req.query)
  res.json(lycees)
}

// Récupère le profil du lycée connecté (via token JWT)
export async function getLyceeProfil(req: Request, res: Response) {
  const user = (req as any).user

  const lycee = await prisma.lycee.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      nom: true,
      email_contact: true,
      telephone: true,
      rue: true,
      code_postal: true,
      ville: true,
      departement: true,
      region: true,
      academie: true,
      logo_url: true,
      site_web: true,
      periode_de_stage: true
    }
  })

  if (!lycee) return res.status(404).json({ error: 'Lycée non trouvé' })

  res.json(lycee)
}
