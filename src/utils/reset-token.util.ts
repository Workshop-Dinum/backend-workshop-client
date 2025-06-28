import jwt from 'jsonwebtoken'

// Génère un token JWT valable 1h pour le reset
export function generateResetToken(email: string) {
  return jwt.sign({ email }, process.env.JWT_SECRET!, { expiresIn: '1h' })
}

// Vérifie le token reçu dans le lien
export function verifyResetToken(token: string): string | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { email: string }
    return decoded.email
  } catch {
    return null
  }
}
