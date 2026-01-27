import { Sequelize } from 'sequelize'
import { logger } from './logger.js'

if (process.env.DATABASE_URL === undefined) {
  throw Error('DATABASE_URL not defined')
}

const sequelizeInstance = new Sequelize(process.env.DATABASE_URL, {
  logging: (msg) => logger.debug(msg),
  logQueryParameters: true,
  sync: {
    alter: true,
  },
})
sequelizeInstance.sync()

export { sequelizeInstance }
