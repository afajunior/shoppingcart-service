import ShoppingCartException from '../error/ShoppingCartException.js'
import * as authService from '../service/AuthService.js'

/**
 * 
 * @param {import('express').Request} request 
 * @param {import('express').Response} response 
 * @returns {Promise<import('express').Response>}
 */
export async function register(request, response) {
  try {
    const user = await authService.register(request.body)
    return response.status(200).json({ message: `User ${user.username} successfully registered` })
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
 * @param {import('express').Request} request 
 * @param {import('express').Response} response 
 * @returns {Promise<import('express').Response>}
 */
export async function login(request, response) {
  try {
    const { username, password } = request.body
    const token = await authService.login(username, password)
    response.status(200).json({ token })
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
