import swaggerUi from 'swagger-ui-express'
import specs from '../../swagger/swagger.config'

// Middleware pour servir la documentation Swagger
export const swaggerMiddleware = swaggerUi.serve
export const swaggerSetup = swaggerUi.setup(specs, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'API Backend Workshop - Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    docExpansion: 'list',
    filter: true,
    showRequestHeaders: true,
    tryItOutEnabled: true
  }
}) 