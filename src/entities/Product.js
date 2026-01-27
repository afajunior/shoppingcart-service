import { DataTypes } from 'sequelize'
import { sequelizeInstance } from '../config/database.js'

const Product = sequelizeInstance.define(
  'Product',
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
    tableName: 'products',
  }
)

export default Product
