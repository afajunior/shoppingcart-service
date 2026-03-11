import { afterAll, beforeAll, beforeEach } from '@jest/globals'
import db from '../../../src/infrastructure/database.cjs'
import { join, resolve } from 'path'
import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'
import { app } from '../../../src/routes'
import http from 'http'
import { closeRedis } from '../../../src/infrastructure/redis'

let sequelize
let server

const runSeeders = async (direction) => {
  const require = createRequire(import.meta.url)
  const __dirname = fileURLToPath(new URL('.', import.meta.url))
  const seedersPath = resolve(__dirname, '../../../src/database/seeders')
  let seedFiles = readdirSync(seedersPath)
    .filter((file) => file.endsWith('.cjs'))
    .sort()

  if (direction === 'down') seedFiles = seedFiles.reverse()

  for (const file of seedFiles) {
    const seeder = require(join(seedersPath, file))
    await seeder[direction](sequelize.getQueryInterface())
  }
}

beforeAll(async () => {
  sequelize = (await db()).sequelize
  server = http.createServer(app)

  await new Promise((resolve) => server.listen(0, resolve)) // inicia o servidor

  process.env.TOKEN_EXPIRATION_SECONDS = 7200
  process.env.CART_EXPIRATION_SECONDS = 7200
  process.env.LOGGER_LEVEL = 'info'
  process.env.JWT_SECRET = 'your-256-bit-secret'

  await sequelize.authenticate()
  await sequelize.sync({ force: true })
  await runSeeders('up')

  global.__SERVER__ = server
})

beforeEach(async () => {
  await sequelize.truncate({ cascade: true, restartIdentity: true })
  await runSeeders('up')

  await fetch(`${process.env.MAIL_API}/api/v1/messages`, { method: 'DELETE' })
})

afterAll(async () => {
  await new Promise((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())))
  await sequelize.close()
  await closeRedis()
})
