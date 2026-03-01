import HTTPException from '../error/HTTPException.js'
import { createAuthService } from '../service/AuthService.js'
import { createEmailService } from '../service/EmailService.js'

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function register(request, response) {
  try {
    const authService = await createAuthService()
    const user = await authService.register(request.body)
    return response.status(200).json({ message: `User ${user.username} successfully registered` })
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

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function login(request, response) {
  try {
    const authService = await createAuthService()
    const { username, password } = request.body
    const token = await authService.login(username, password)
    response.status(200).json({ token })
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

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function verifyEmail(request, response) {
  try {
    const authService = await createAuthService()
    authService.verifyEmail(request.query.token)
    response.status(200).send()
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

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function sendVerificationEmail(request, response) {
  try {
    const { userId } = request.session
    const emailService = await createEmailService()
    await emailService.sendVerificationEmail(userId)
    response.status(200).send()
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
