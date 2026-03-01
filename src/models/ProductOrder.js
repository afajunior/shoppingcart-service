'use strict'
import { Model } from 'sequelize'

export default (sequelize, DataTypes) => {
  class ProductOrder extends Model {}

  ProductOrder.init(
    {
      orderId: {
        type: DataTypes.INTEGER,
        field: 'order_id',
        references: {
          model: 'Order',
          key: 'id',
        },
        primaryKey: true,
      },
      productId: {
        type: DataTypes.INTEGER,
        field: 'product_id',
        references: {
          model: 'Product',
          key: 'id',
        },
        primaryKey: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: 'ProductOrder',
      tableName: 'products_orders',
    }
  )

  return ProductOrder
}
