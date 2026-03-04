import { afterAll, beforeAll, beforeEach } from '@jest/globals'
import db from '../../../src/infrastructure/database.cjs'
import { join, resolve } from 'path'
import { readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

let sequelize

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

  await sequelize.authenticate()
  await sequelize.sync({ force: true })
  await runSeeders('up')
})

beforeEach(async () => {
  await sequelize.truncate({ cascade: true, restartIdentity: true })
  await runSeeders('up')
})

afterAll(async () => {
  await sequelize.close()
})
