'use strict'

const fs = require('fs')
const path = require('path')
const process = require('process')
const basename = path.basename(__filename)
const env = process.env.NODE_ENV || 'development'
const db = {}
const modelPath = __dirname + '/../models'

async function initializeDatabase() {
  const config = require(__dirname + '/../../database.json')[env]
  const Sequelize = require('sequelize')

  const sequelize = config.use_env_variable
    ? new Sequelize(process.env[config.use_env_variable], config)
    : new Sequelize(config.database, config.username, config.password, config)

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

module.exports = initializeDatabase()
