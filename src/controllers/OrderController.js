import ShoppingCartException from '../error/ShoppingCartException.js'
import * as orderService from '../service/OrderService.js'

/**
 *
 * @param {import("express").Request} request
 * @param {import("express").Response} response
 */
export async function create(request, response) {
  try {
    const { sessionId, sessionData, userId } = request.session
    const order = await orderService.create(sessionId, sessionData, userId)
    return response.json(order)
  } catch (error) {
    if (error instanceof ShoppingCartException) {
      return response.status(error.status).json({ message: error.message })
    }
    if (error instanceof Error) {
      return response.status(500).json({ message: error.message })
    }
    return response.status(500).json({ message: 'Unknown Error' })
  }
}

/**
 *
 * @param {import("express").Request} request
 * @param {import("express").Response} response
 */
export async function get(request, response) {
  const { id } = request.params
  const { userId } = request.session
  const order = await orderService.get(id, userId)
  response.json(order)
}

/**
 *
 * @param {import("express").Request} request
 * @param {import("express").Response} response
 */
export async function list(request, response) {
  try {
    const { userId } = request.session
    const { order, sort, max, offset } = request.query
    const orders = await orderService.list(userId, order, sort, max, offset)
    return response.json(orders)
  } catch (error) {
    return response.status(500).send({ message: error.message })
  }
}
