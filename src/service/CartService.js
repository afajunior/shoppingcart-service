import { logger } from '../infrastructure/logger.js'
import { initializeRedis } from '../infrastructure/redis.js'
import db from '../infrastructure/database.cjs'
import { setSession } from '../infrastructure/session.js'
import AppError from '../error/AppException.js'

/**
 * @typedef {productId: number, quantity: number} cartItem
 */

export async function createCartService(deps = {}) {
  const { productModel = (await db()).Product, loggerInstance = logger, redis = await initializeRedis() } = deps
  return {
    /**
     * @param {string} sessionId
     * @param {cart: cartItem[]} sessionData
     * @param {number} productId
     * @param {number} quantity
     * @returns {Promise<{cart: cartItem[]}>}
     */
    async add(sessionId, sessionData, productId, quantity) {
      const cart = [...sessionData.cart]
      let existingItem = cart.find((item) => item.productId === productId)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        existingItem = { productId, quantity }
        cart.push(existingItem)
      }

      if (existingItem.quantity < 1) {
        const itemIdx = cart.indexOf(existingItem)
        cart.splice(itemIdx, 1)
      } else {
        const product = await productModel.findByPk(productId)
        if (existingItem.quantity > product.quantity) {
          throw new AppError(400, 'Quantity exceed local inventory')
        }
      }

      loggerInstance.info(`cart: ${JSON.stringify(cart)}`)

      setSession(redis, sessionId, { cart })

      return { cart }
    },
  }
}
