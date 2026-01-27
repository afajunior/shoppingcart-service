import { DataTypes } from 'sequelize'
import { sequelizeInstance } from '../config/database.js'
import Order from './Order.js'
import Product from './Product.js'

const ProductOrder = sequelizeInstance.define(
  'ProductOrder',
  {
    orderId: {
      type: DataTypes.INTEGER,
      field: 'order_id',
      references: {
        model: Order,
        key: 'id',
      },
      primaryKey: true,
    },
    productId: {
      type: DataTypes.INTEGER,
      field: 'product_id',
      references: {
        model: Product,
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
    tableName: 'products_orders',
  }
)

export default ProductOrder
