'use strict'
import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: 'user_id',
      })

      Order.belongsToMany(models.Product, {
        through: models.ProductOrder,
        foreignKey: 'orderId',
      })
    }
  }

  Order.init(
    {
      totalAmount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM,
        values: ['new', 'processed', 'cancelled'],
        defaultValue: 'new',
      },
    },
    {
      sequelize,
      modelName: 'Order',
      tableName: 'orders',
    }
  )

  return Order
}
