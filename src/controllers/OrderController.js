/**
 *
 * @param {import("express").Request} request
 * @param {import("express").Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function create(request, response, next) {
  try {
    const { order: orderService } = request.app.locals.services
    const { sessionId, sessionData, userId } = request.session
    const order = await orderService.create(sessionId, sessionData, userId)
    return response.json(order)
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {import("express").Request} request
 * @param {import("express").Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function get(request, response, next) {
  try {
    const { order: orderService } = request.app.locals.services
    const { id } = request.params
    const { userId } = request.session
    const order = await orderService.get(id, userId)
    return response.json(order)
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {import("express").Request} request
 * @param {import("express").Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function list(request, response, next) {
  try {
    const { order: orderService } = request.app.locals.services
    const { userId } = request.session
    const { order, sort, max, offset } = request.query
    const orders = await orderService.list(userId, order, sort, max, offset)
    return response.json(orders)
  } catch (error) {
    next(error)
  }
}
