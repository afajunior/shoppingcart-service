import initializeDatabase from './infrastructure/database.cjs'
import { logger } from './infrastructure/logger.js'
import { initializeRedis } from './infrastructure/redis.js'
import { app } from './routes.js'
import { createAuthService } from './service/AuthService.js'
import { createCartService } from './service/CartService.js'
import { createEmailService } from './service/EmailService.js'
import { createOrderService } from './service/OrderService.js'
import { createProductService } from './service/ProductService.js'

validateEnv()

app.locals.services = await initializeInfrastructure()

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

async function initializeInfrastructure() {
  const dbInstance = await initializeDatabase()
  const redisInstance = await initializeRedis()
  return {
    auth: createAuthService({ redis: redisInstance, dbInstance }),
    cart: createCartService({ redis: redisInstance, dbInstance }),
    order: createOrderService({ redis: redisInstance, dbInstance }),
    product: createProductService({ dbInstance }),
    email: createEmailService({ dbInstance }),
  }
}
