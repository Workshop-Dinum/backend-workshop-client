import swaggerJsdoc from 'swagger-jsdoc'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Backend Workshop - Gestion des Lycées et Lycéens',
      version: '1.0.0',
      description: 'API REST pour la gestion des lycées et lycéens avec authentification et réinitialisation de mot de passe',
      contact: {
        name: 'Équipe Backend Workshop',
        email: 'amine.laihem@my-digital-school.org'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Serveur de développement'
      },
      {
        url: 'https://backend-workshop-client.onrender.com',
        description: 'Serveur de production (Render)'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Message d\'erreur'
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Message de succès'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    './src/routes/*.ts',
    './src/controllers/*.ts',
    './swagger/schemas/*.yaml'
  ]
}

const specs = swaggerJsdoc(options)

export default specs 