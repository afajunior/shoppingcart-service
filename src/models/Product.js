'use strict'
import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsToMany(models.Order, {
        through: models.ProductOrder,
        foreignKey: 'productId',
      })
    }
  }

  Product.init(
    {
      name: {
        type: DataTypes.STRING,
      },
      price: {
        type: DataTypes.FLOAT,
      },
      quantity: {
        type: DataTypes.INTEGER,
      },
    },
    {
      sequelize,
      modelName: 'Product',
      tableName: 'products',
    }
  )

  return Product
}
