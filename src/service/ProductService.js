import { logger } from '../infrastructure/logger.js'
import db from '../infrastructure/database.cjs'

const { Product } = await db

function createProductService(deps = {}) {
  const { loggerInstance = logger } = deps
  return {
    /**
     * @typedef Product
     * @property {number} id
     * @property {string} name
     * @property {number} price
     * @property {number} quantity
     *
     * @param {number} productId
     * @returns {Promise<Product | null>}
     */
    async get(productId) {
      return await Product.findByPk(productId, {
        attributes: ['id', 'name', 'price', 'quantity'],
      })
    },

    /**
     *
     * @param {Omit<Product, 'id'>} product
     * @returns {Promise<Product>}
     */
    async save(product) {
      const createdProduct = await Product.build(product).save()

      loggerInstance.info(`Saved product#${createdProduct.id} to the database`)
      return { id: createdProduct.id, ...product }
    },

    /**
     *
     * @param {number} id
     * @param {Omit<Product, 'id'>} product
     * @returns {Promise<Product | null>}
     */
    async update(id, product) {
      const affectedCount = await Product.update(product, {
        where: {
          id,
        },
      })

      loggerInstance.info(`Updated product#${id}. Rows updated: ${affectedCount}`)

      if (affectedCount[0] === 0) {
        return null
      }

      return await Product.findByPk(id, {
        attributes: ['id', 'name', 'price', 'quantity'],
      })
    },

    /**
     *
     * @param {string | undefined} order
     * @param {'ASC' | 'DESC' | undefined} sort
     * @param {number | undefined} max
     * @param {number | undefined} offset
     * @returns {Promise<Product[]>}
     */
    async list(order, sort, max, offset) {
      return await Product.findAll({
        order: [[order || 'id', sort || 'ASC']],
        limit: max || 10,
        offset: offset || 0,
        attributes: ['id', 'name', 'price', 'quantity'],
      })
    },
  }
}

const productService = createProductService()
export const { get, list, save, update } = productService
