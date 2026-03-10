import { logger } from './logger.js'
import { createClient } from 'redis'

let redisClient = null

export async function initializeRedis() {
  if (redisClient) {
    return redisClient
  }
  if (process.env.REDIS_URL === undefined) {
    throw Error('REDIS_URL not defined')
  }

  redisClient = createClient({ url: process.env.REDIS_URL })
  redisClient.on('error', (err) => logger.error('Redis Error', err))
  await redisClient.connect()

  return redisClient
}

export async function closeRedis() {
  await redisClient?.destroy()
  redisClient = null
}
