import { compare } from 'bcrypt'
import { logger } from '../infrastructure/logger.js'
import db from '../infrastructure/database.cjs'
import HTTPException from '../error/HTTPException.js'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { redisClient } from '../infrastructure/redis.js'

const { User } = await db

/**
 * @typedef User
 * @property {number} id
 * @property {string} username
 * @property {string} password
 * @property {string} email
 *
 * @param {Omit<User, 'id>'} user
 * @returns {Promise<User>}
 */
export async function register(user) {
  const existedUsername = await User.findOne({
    where: {
      username: user.username,
    },
  })
  if (existedUsername !== null) {
    throw new HTTPException(400, 'The username already existed')
  }

  const existedEmail = await User.findOne({
    where: {
      email: user.email,
    },
  })

  if (existedEmail !== null) {
    throw new HTTPException(400, 'This email is already registered')
  }
  logger.info(`Registering user ${JSON.stringify({ username: user.username, email: user.email })}`)
  return await User.create(user)
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
    throw new HTTPException(400, 'User not found')
  }

  const isMatch = await compare(password, user.password)
  if (!isMatch) {
    throw new HTTPException(400, 'Invalid credentials')
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
