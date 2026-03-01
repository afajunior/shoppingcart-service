'use strict'
import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      Role.belongsToMany(models.User, {
        through: 'users_roles',
        foreignKey: 'role_id',
        otherKey: 'user_id',
      })
    }
  }

  Role.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      sequelize,
      modelName: 'Role',
      tableName: 'roles',
    }
  )

  return Role
}
