import nodemailer from 'nodemailer'

// On détecte si on est en production
const isProd = process.env.NODE_ENV === 'production'

// Configuration SMTP selon l'environnement
export const transporter = nodemailer.createTransport(
  isProd
    ? {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS
        }
      }
    : {
        host: 'smtp.mailtrap.io',
        port: 2525,
        auth: {
          user: process.env.MAILTRAP_USER,
          pass: process.env.MAILTRAP_PASS
        }
      }
)
