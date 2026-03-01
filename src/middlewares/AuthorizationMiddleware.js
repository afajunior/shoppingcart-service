import jwt from 'jsonwebtoken'

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns
 */
export function authorize(...roles) {
  return (request, response, next) => {
    const token = request.header('Authorization')?.split(' ')[1]
    if (!token) {
      return response.status(401).json({ message: 'Access denied. No token provided' })
    }

    try {
      /** @type {{userId: number, sessionId: string, sessionData: {cart: {productId: number, quantity: number}[]}}} */
      const payload = jwt.verify(token, process.env.JWT_SECRET)
      const hasRole = payload.roles.some((role) => roles.includes(role))

      if (!hasRole) {
        return response.status(403).json({ message: 'Forbidden' })
      }

      next()
    } catch (error) {
      response.status(500).json(error)
    }
  }
}
