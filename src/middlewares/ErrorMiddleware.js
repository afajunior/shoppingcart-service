import HTTPException from '../error/HTTPException.js'
import { logger } from '../infrastructure/logger.js'

/**
 * @param {Error} error
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns
 */
export function errorHandler(error, request, response, next) {
  if (error instanceof HTTPException) {
    return response.status(error.status).json({ message: error.message })
  }
  logger.error({ path: request.path, message: error.message })
  response.status(500).json({ message: 'Internal Server Error' })
}
