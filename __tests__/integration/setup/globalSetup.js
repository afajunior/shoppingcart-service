import { PostgreSqlContainer } from '@testcontainers/postgresql'
import { RedisContainer } from '@testcontainers/redis'
import { GenericContainer } from 'testcontainers'

export default async () => {
  const postgres = await new PostgreSqlContainer('postgres:18.1-alpine')
    .withDatabase('shoppingcart-test')
    .withUsername('test')
    .withPassword('test')
    .start()
  const redis = await new RedisContainer('redis:8.4-alpine').start()
  const mailhog = await new GenericContainer('mailhog/mailhog').withExposedPorts(1025, 8025).start()

  process.env.DATABASE_URL = postgres.getConnectionUri()
  process.env.REDIS_URL = `redis://${redis.getHost()}:${redis.getMappedPort(6379)}`

  process.env.MAIL_HOST = mailhog.getHost()
  process.env.MAIL_PORT = String(mailhog.getMappedPort(1025))
  process.env.MAIL_API = `http://${mailhog.getHost()}:${mailhog.getMappedPort(8025)}`
  process.env.MAIL_FROM_NAME = 'mockmail'
  process.env.MAIL_FROM_ADDRESS = 'mockmail@test.com'

  global.__MAILHOG__ = mailhog
  global.__POSTGRES__ = postgres
  global.__REDIS__ = redis
}
