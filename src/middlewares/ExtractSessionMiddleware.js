import jwt from 'jsonwebtoken'
import { initializeRedis } from '../infrastructure/redis.js'
import { logger } from '../infrastructure/logger.js'
import { getSession } from '../infrastructure/session.js'

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns
 */
export async function extractSession(request, response, next) {
  const redisClient = await initializeRedis()
  const token = request.header('Authorization')?.split(' ')[1]
  if (!token) {
    return response.status(401).json({ message: 'Access denied. No token provided' })
  }

  try {
    /** @type {{userId: number, sessionId: string, sessionData: {cart: {productId: number, quantity: number}[]}}} */
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const sessionData = getSession(redisClient, payload.sessionId)

    if (!sessionData) {
      return response.status(401).json({ message: 'Expired session' })
    }

    if (typeof sessionData !== 'string') {
      logger.error('Invalid session data')
      return response.status(500).json({ message: 'Interval Service Error' })
    }

    request.session = { ...payload, sessionData: JSON.parse(sessionData) }
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return response.status(401).json({ message: 'Invalid token' })
    }
    logger.error('Unexpected auth error', error)
    response.status(500).json({ message: 'Internal Server Error' })
  }
}
