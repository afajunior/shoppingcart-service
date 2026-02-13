import { redisClient } from '../infrastructure/redis.js'
import { logger } from '../infrastructure/logger.js'
import { Op } from 'sequelize'
import db from '../infrastructure/database.cjs'
import HTTPException from '../error/HTTPException.js'

const { Order, Product } = await db

function createOrderService(deps = {}) {
  const { loggerInstance = logger, redis = redisClient } = deps
  return {
    /**
     * @typedef Product
     * @property {number} id
     * @property {string} name
     * @property {number} quantity
     *
     * @typedef Order
     * @property {number} id
     * @property {number} totalAmount
     * @property {string} status
     * @property {Date} createdAt
     * @property {Product[]} products
     *
     * @param {number} orderId
     * @param {number} userId
     * @returns {Promise<Order | null>}
     */
    async get(orderId, userId) {
      const order = await Order.findOne({
        where: {
          id: orderId,
          user_id: userId,
        },
        attributes: ['id', 'totalAmount', 'status', 'createdAt'],
        include: {
          model: Product,
          attributes: ['id', 'name'],
          through: {
            attributes: ['quantity'],
          },
        },
      })
      if (order === null) return null
      return {
        id: order.id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        products: order.Products.map((p) => ({
          id: p.id,
          name: p.name,
          quantity: p.ProductOrder.quantity,
        })),
      }
    },

    /**
     *
     * @param {number} userId
     * @param {string} order
     * @param {'ASC' | 'DESC'} sort
     * @param {number} limit
     * @param {number} offset
     * @returns {Promise<Omit<Order, 'products'>[]>}
     */
    async list(userId, order, sort, limit, offset) {
      const orders = await Order.findAll({
        where: {
          user_id: userId,
        },
        order: [[order || 'id', sort || 'ASC']],
        limit: limit || 10,
        offset: offset || 0,
        attributes: ['id', 'totalAmount', 'status', 'createdAt'],
      })
      return orders
    },

    /**
     * @typedef {{productId: number, quantity: number}} cartItem
     * @param {string} sessionId
     * @param {{cart: cartItem[]}} sessionData
     * @param {number} userId
     * @returns {Promise<products>}
     */
    async create(sessionId, sessionData, userId) {
      const cart = sessionData.cart

      if (cart === null) {
        throw new HTTPException(404, 'Cart not found')
      }

      if (cart.length === 0) {
        throw new HTTPException(400, 'Empty Cart')
      }

      const products = await Product.findAll({
        where: {
          id: {
            [Op.in]: cart.map((item) => item.productId),
          },
        },
      })

      const totalAmount = products.reduce((acc, product) => acc + product.price * product.quantity, 0.0)

      loggerInstance.debug({
        message: 'Processing products in the cart to a new order',
        products,
        totalAmount,
      })

      const order = await Order.create({
        totalAmount,
        user_id: userId,
      })

      await Promise.all(
        products.map((p) => {
          const quantity = cart.find((item) => p.id === item.productId).quantity
          order.addProduct(p, {
            through: {
              quantity: quantity,
            },
          })
          p.decrement('quantity', { by: quantity })
        })
      )
      await redis.set(`session:${sessionId}`, JSON.stringify({ cart: [] }), { EX: 60 * 60 * 2 })

      return await get(order.id, userId)
    },
  }
}

const orderService = createOrderService()
export const { create, get, list } = orderService
