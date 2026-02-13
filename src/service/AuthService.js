// AuthService.js - VOLTA AO ORIGINAL!
import { compare } from 'bcrypt'
import { logger } from '../infrastructure/logger.js'
import db from '../infrastructure/database.cjs'
import HTTPException from '../error/HTTPException.js'
import jwt from 'jsonwebtoken'
import { v4 as uuid } from 'uuid'
import { redisClient } from '../infrastructure/redis.js'

const { User } = await db

function createAuthService(deps = {}) {
  const {
    userModel = User,
    loggerInstance = logger,
    redis = redisClient,
    jwtLib = jwt,
    compareLib = compare,
    uuidLib = uuid,
  } = deps

  return {
    async register(user) {
      const existedUsername = await userModel.findOne({
        where: { username: user.username },
      })
      if (existedUsername !== null) {
        throw new HTTPException(400, 'The username already existed')
      }

      const existedEmail = await userModel.findOne({
        where: { email: user.email },
      })

      if (existedEmail !== null) {
        throw new HTTPException(400, 'This email is already registered')
      }

      loggerInstance.info(`Registering user ${JSON.stringify({ username: user.username, email: user.email })}`)
      return await userModel.create(user)
    },

    async login(username, password) {
      const user = await userModel.findOne({
        where: { username: username },
      })
      if (user === null) {
        throw new HTTPException(400, 'User not found')
      }

      const isMatch = await compareLib(password, user.password)
      if (!isMatch) {
        throw new HTTPException(400, 'Invalid credentials')
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

const authService = createAuthService()
export const { register, login } = authService
