import { logger } from './infrastructure/logger.js'
import { app } from './routes.js'

validateEnv()

const port = process.env.PORT || 3000

logger.info(`Listen on port ${port}`)
app.listen(port)

function validateEnv() {
  const REQUIRED = [
    'JWT_SECRET',
    'DATABASE_URL',
    'REDIS_URL',
    'APP_BASE_URL',
    'CART_EXPIRATION_SECONDS',
    'TOKEN_EXPIRATION_SECONDS',
    'CORS_ORIGIN',
  ]
  const missing = REQUIRED.filter((k) => !process.env[k])
  if (missing.length) {
    logger.error(`Missing env vars: ${missing.join(', ')}`)
    process.exit(1)
  }
}
