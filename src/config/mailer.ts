import nodemailer from 'nodemailer'

// Création du transporteur mail avec les identifiants Mailtrap (pour dev/test)
export const transporter = nodemailer.createTransport({
  host: 'smtp.mailtrap.io',
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
})
