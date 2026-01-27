import { DataTypes } from 'sequelize'
import { sequelizeInstance } from '../config/database.js'

const Order = sequelizeInstance.define(
  'Order',
  {
    totalAmount: {
      type: DataTypes.DOUBLE,
    },
    status: {
      type: DataTypes.ENUM,
      values: ['new', 'processed', 'cancelled'],
      defaultValue: 'new',
    },
  },
  {
    tableName: 'orders',
  }
)

export default Order
