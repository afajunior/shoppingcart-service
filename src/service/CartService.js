import { logger } from '../config/logger.js'
import { redisClient } from '../config/redis.js'
import { Product } from '../entities/index.js'
import ShoppingCartException from '../error/ShoppingCartException.js'

/**
 * @typedef {{productId: number, quantity: number}} cartItem
 * @param {string} sessionId
 * @param {{cart: cartItem[]}} sessionData
 * @param {number} productId
 * @param {number} quantity
 * @returns {Promise<{cart: cartItem[]}>}
 */
export async function add(sessionId, sessionData, productId, quantity) {
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
      throw new ShoppingCartException(400, 'Quantity exceed local inventory')
    }
  }

  logger.info(`cart: ${JSON.stringify(cart)}`)

  await redisClient.set(`session:${sessionId}`, JSON.stringify({ cart }), { EX: 60 * 60 * 2 })

  return { cart }
}
