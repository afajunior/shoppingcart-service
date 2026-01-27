import jwt from 'jsonwebtoken'
import { redisClient } from '../config/redis.js'
import { logger } from '../config/logger.js'

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns
 */
export async function auth(request, response, next) {
  const token = request.header('Authorization')?.split(' ')[1]
  if (!token) {
    return response.status(401).json({ message: 'Access denied. No token provided' })
  }

  try {
    /** @type {{userId: number, sessionId: string, sessionData: {cart: {productId: number, quantity: number}[]}}} */
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    const sessionKey = `session:${payload.sessionId}`
    const sessionData = await redisClient.get(sessionKey)

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
    response.status(500).json(error)
  }
}
