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

app.locals = await initializeInfrastructure()

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
  const email = await createEmailService({ dbInstance })
  return {
    redis: redisInstance,
    services: {
      cart: await createCartService({ redis: redisInstance, dbInstance }),
      order: await createOrderService({ redis: redisInstance, dbInstance }),
      product: await createProductService({ dbInstance }),
      email,
      auth: await createAuthService({ redis: redisInstance, dbInstance, email }),
    },
  }
}
