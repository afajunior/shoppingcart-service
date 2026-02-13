import HTTPException from '../error/HTTPException.js'
import { logger } from '../infrastructure/logger.js'
import { redisClient } from '../infrastructure/redis.js'
import db from '../infrastructure/database.cjs'

const { Product } = await db

function createCartService(deps = {}) {
  const { loggerInstance = logger, redis = redisClient } = deps
  return {
    /**
     * @typedef {{productId: number, quantity: number}} cartItem
     * @param {string} sessionId
     * @param {{cart: cartItem[]}} sessionData
     * @param {number} productId
     * @param {number} quantity
     * @returns {Promise<{cart: cartItem[]}>}
     */
    async add(sessionId, sessionData, productId, quantity) {
      const cart = sessionData.cart
      let existingItem = cart.find((item) => item.productId === productId)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        existingItem = { productId, quantity }
        cart.push(existingItem)
      }

      if (existingItem.quantity < 1) {
        const itemIdx = cart.indexOf(existingItem)
        cart.splice(itemIdx)
      } else {
        const product = await Product.findByPk(productId)
        if (existingItem.quantity > product.quantity) {
          throw new HTTPException(400, 'Quantity exceed local inventory')
        }
      }

      loggerInstance.info(`cart: ${JSON.stringify(cart)}`)

      await redis.set(`session:${sessionId}`, JSON.stringify({ cart }), { EX: 60 * 60 * 2 })

      return { cart }
    },
  }
}

const cartService = createCartService()
export const { add } = cartService
