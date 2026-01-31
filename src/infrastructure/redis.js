import { logger } from './logger.js'
import { createClient } from 'redis'

if (process.env.REDIS_URL === undefined) {
  throw Error('REDIS_URL not defined')
}

export const redisClient = createClient(process.env.REDIS_URL)
redisClient.on('error', (err) => logger.error('Redis Error', err))

redisClient.connect()
