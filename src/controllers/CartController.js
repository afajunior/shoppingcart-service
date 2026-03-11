import { createCartService } from '../service/CartService.js'

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function get(request, response, next) {
  try {
    return response.json(request.session.sessionData.cart)
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function add(request, response, next) {
  try {
    const cartService = await createCartService()
    const { productId, quantity } = request.body
    const { sessionId, sessionData } = request.session
    const cart = await cartService.add(sessionId, sessionData, productId, quantity)
    return response.json(cart)
  } catch (error) {
    next(error)
  }
}
