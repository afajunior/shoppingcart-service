import { createAuthService } from '../service/AuthService.js'
import { createEmailService } from '../service/EmailService.js'

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function register(request, response, next) {
  try {
    const authService = await createAuthService()
    const user = await authService.register(request.body)
    return response.status(201).json({ message: `User ${user.username} successfully registered` })
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
export async function login(request, response, next) {
  try {
    const authService = await createAuthService()
    const { username, password } = request.body
    const token = await authService.login(username, password)
    response.status(200).json({ token })
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
export async function verifyEmail(request, response, next) {
  try {
    const authService = await createAuthService()
    await authService.verifyEmail(request.query.token)
    response.status(200).send()
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
export async function sendVerificationEmail(request, response, next) {
  try {
    const { userId } = request.session
    const emailService = await createEmailService()
    await emailService.sendVerificationEmail(userId)
    response.status(200).send()
  } catch (error) {
    next(error)
  }
}
