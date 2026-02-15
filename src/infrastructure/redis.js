import { logger } from './logger.js'
import { createClient } from 'redis'

export async function initializeRedis() {
  if (process.env.REDIS_URL === undefined) {
    throw Error('REDIS_URL not defined')
  }

  const redisClient = createClient(process.env.REDIS_URL)
  redisClient.on('error', (err) => logger.error('Redis Error', err))
  await redisClient.connect()

  return redisClient
}
