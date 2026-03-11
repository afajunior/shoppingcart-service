/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns
 */
export function authorize(...roles) {
  return (request, response, next) => {
    if (!request.session?.roles) {
      return response.status(401).json({ message: 'Unauthorized' })
    }
    /** @type {{userId: number, sessionId: string, sessionData: {cart: {productId: number, quantity: number}[]}}} */
    const ok = request.session.roles.some((role) => roles.includes(role))

    if (!ok) {
      return response.status(403).json({ message: 'Forbidden' })
    }
    next()
  }
}
