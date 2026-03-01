'use strict'
import { hash } from 'bcrypt'
import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Order, {
        foreignKey: 'user_id',
      })

      User.belongsToMany(models.Role, {
        through: 'users_roles',
        foreignKey: 'user_id',
        otherKey: 'role_id',
      })
    }
  }

  User.init(
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
      emailTokenVerify: {
        type: DataTypes.STRING,
        allowNull: true,
        field: 'email_token_verify',
      },
      emailTokenExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'email_token_expires_at',
      },
      emailVerifyAt: {
        type: DataTypes.DATE,
        allowNull: true,
        field: 'email_verify_at',
      },
    },
    {
      sequelize,
      modelName: 'User',
      tableName: 'users',
      hooks: {
        beforeCreate: hashPassword,
        beforeUpdate: hashPassword,
      },
    }
  )

  return User
}

async function hashPassword(user) {
  if (user.changed('password')) {
    user.password = await hash(user.password, 10)
  }
}
