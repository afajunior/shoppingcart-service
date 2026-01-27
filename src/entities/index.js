import Product from './Product.js'
import User from './User.js'
import Order from './Order.js'
import ProductOrder from './ProductOrder.js'

Order.belongsTo(User, {
  foreignKey: 'user_id',
})

User.hasMany(Order, {
  foreignKey: 'user_id',
})

Order.belongsToMany(Product, {
  through: ProductOrder,
  foreignKey: 'orderId',
})

Product.belongsToMany(Order, {
  through: ProductOrder,
  foreignKey: 'productId',
})

export { User, Product }
