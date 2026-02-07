import HTTPException from '../error/HTTPException.js'
import * as cartService from '../service/CartService.js'

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function get(request, response) {
  try {
    return response.json(request.session.sessionData.cart)
  } catch (error) {
    return response.status(500).json({ message: error.message })
  }
}

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function add(request, response) {
  try {
    const { productId, quantity } = request.body
    const { sessionId, sessionData } = request.session
    const cart = await cartService.add(sessionId, sessionData, productId, quantity)
    return response.json(cart)
  } catch (error) {
    if (error instanceof HTTPException) {
      return response.status(error.status).json({ message: error.message })
    }
    if (error instanceof Error) {
      return response.status(500).json({ message: error.message })
    }
    return response.status(500).json({ message: 'Unknown Error' })
  }
}
