import { DataTypes } from 'sequelize'
import { sequelizeInstance } from '../config/database.js'
import { hash } from 'bcrypt'

const User = sequelizeInstance.define(
  'User',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'users',
    hooks: {
      beforeCreate: hashPassword,
      beforeUpdate: hashPassword,
    },
  }
)

async function hashPassword(user) {
  if (user.changed('password')) {
    user.password = await hash(user.password, 10)
  }
}

export default User
