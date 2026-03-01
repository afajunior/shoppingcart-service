import { compare } from 'bcrypt'
import { logger } from '../infrastructure/logger.js'
import db from '../infrastructure/database.cjs'
import HTTPException from '../error/HTTPException.js'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { initializeRedis } from '../infrastructure/redis.js'

/**
 * @typedef dependency
 * @property {User} userModel
 * @property {import('winston').Logger} loggerInstance
 * @property {import('redis').RedisClientType} redis
 * @property {import('jsonwebtoken').jwt} jwtLib
 * @property {import('bcrypt').compare} compareLib
 * @property {import('uuid').v4} uuidLib
 *
 * @param {dependency} deps
 * @returns
 */
export async function createAuthService(deps = {}) {
  const {
    dbInstance = await db(),
    loggerInstance = logger,
    redis = await initializeRedis(),
    jwtLib = jwt,
    compareLib = compare,
    uuidLib = uuid,
  } = deps

  const { User, Role, sequelize } = dbInstance

  return {
    async register(user) {
      const existedUsername = await User.findOne({
        where: { username: user.username },
      })
      if (existedUsername !== null) {
        throw new HTTPException(400, 'The username already exists')
      }

      const existedEmail = await User.findOne({
        where: { email: user.email },
      })

      if (existedEmail !== null) {
        throw new HTTPException(400, 'This email is already registered')
      }

      loggerInstance.info(`Registering user ${JSON.stringify({ username: user.username, email: user.email })}`)

      return await sequelize.transaction(async (transaction) => {
        const [roleUser, newUser] = await Promise.all([
          Role.findOne({ where: { name: 'USER' }, transaction }),
          User.create(user, { transaction }),
        ])

        await newUser.addRole(roleUser, { transaction })

        return newUser
      })
    },

    async login(username, password) {
      const user = await User.findOne({
        where: { username: username },
      })
      if (user === null) {
        throw new HTTPException(404, 'User not found')
      }

      const isMatch = await compareLib(password, user.password)
      if (!isMatch) {
        throw new HTTPException(403, 'Invalid credentials')
      }

      loggerInstance.info(`User ${username} authenticated.`)

      if (process.env.JWT_SECRET === undefined) {
        loggerInstance.error('JWT_SECRET not defined')
        throw Error('Internal Error Service')
      }

      const sessionId = uuidLib()
      await redis.set(`session:${sessionId}`, JSON.stringify({ cart: [] }), {
        EX: Number(process.env.CART_EXPIRATION_TIME),
      })

      return jwtLib.sign({ userId: user.id, sessionId }, process.env.JWT_SECRET, {
        expiresIn: '2h',
      })
    },
  }
}
