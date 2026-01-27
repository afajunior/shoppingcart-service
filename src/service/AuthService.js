import { compare } from 'bcrypt'
import { logger } from '../config/logger.js'
import User from '../entities/User.js'
import ShoppingCartException from '../error/ShoppingCartException.js'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { redisClient } from '../config/redis.js'

/**
 * @typedef UserDTO
 * @property {number} id
 * @property {string} username
 * @property {string} password
 * @property {string} email
 */

/**
 *
 * @param {UserDTO} user
 * @returns {Promise<UserDTO>}
 */
export async function register(user) {
  const existedUsername = await User.findOne({
    where: {
      username: user.username,
    },
  })
  if (existedUsername !== null) {
    throw new ShoppingCartException(400, 'The username already existed')
  }

  const existedEmail = await User.findOne({
    where: {
      email: user.email,
    },
  })
  if (existedEmail !== null) {
    throw new ShoppingCartException(400, 'This email is already registered')
  }
  logger.info(`Registering user ${JSON.stringify({ username: user.username, email: user.email })}`)
  return await User.build(user).save()
}

/**
 *
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string>}
 */
export async function login(username, password) {
  const user = await User.findOne({
    where: {
      username: username,
    },
  })
  if (user === null) {
    throw new ShoppingCartException(400, 'User not found')
  }

  const isMatch = await compare(password, user.password)
  if (!isMatch) {
    throw new ShoppingCartException(400, 'Invalid credentials')
  }

  logger.info(`User ${username} authenticated.`)

  if (process.env.JWT_SECRET === undefined) {
    logger.error('JWT_SECRET not defined')
    throw Error('Internal Error Service')
  }

  const sessionId = uuid()
  await redisClient.set(`session:${sessionId}`, JSON.stringify({ cart: [] }), {
    EX: Number(process.env.CART_EXPIRATION_TIME),
  })

  return jwt.sign({ userId: user.id, sessionId }, process.env.JWT_SECRET, {
    expiresIn: '2h',
  })
}
