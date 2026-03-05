'use strict'

const fs = require('fs')
const path = require('path')
const process = require('process')
const basename = path.basename(__filename)
const db = {}
const modelPath = __dirname + '/../models'

async function initializeDatabase() {
  const { logger } = await import('./logger')
  const Sequelize = require('sequelize')

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    logging: (msg) => logger.debug(msg),
  })

  const modelFiles = fs.readdirSync(modelPath).filter((file) => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js' && file.indexOf('.test.js') === -1
  })

  for (const file of modelFiles) {
    const model = (await import(path.join(modelPath, file))).default(sequelize, Sequelize.DataTypes)
    db[model.name] = model
  }
  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })

  db.sequelize = sequelize
  db.Sequelize = Sequelize

  return db
}

module.exports = initializeDatabase
