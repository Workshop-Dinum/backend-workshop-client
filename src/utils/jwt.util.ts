import jwt from 'jsonwebtoken'

// Génère un token JWT pour l’utilisateur connecté
export function generateToken(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' })
}
