import { logger } from '../infrastructure/logger.js'
import db from '../infrastructure/database.cjs'
import HTTPException from '../error/HTTPException.js'

export async function createProductService(deps = {}) {
  const { productModel = (await db()).Product, loggerInstance = logger } = deps
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
      return await productModel.findByPk(productId, {
        attributes: ['id', 'name', 'price', 'quantity'],
      })
    },

    /**
     *
     * @param {Omit<Product, 'id'>} product
     * @returns {Promise<Product>}
     */
    async save(product) {
      const createdProduct = await productModel.create(product)

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
      const affectedCount = await productModel.update(product, {
        where: {
          id,
        },
      })

      loggerInstance.info(`Updated product#${id}. Rows updated: ${affectedCount}`)

      if (affectedCount[0] === 0) {
        throw new HTTPException(404, 'Product Not Found')
      }

      return await this.get(id)
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
      return await productModel.findAll({
        order: [[order || 'id', sort || 'ASC']],
        limit: max || 10,
        offset: offset || 0,
        attributes: ['id', 'name', 'price', 'quantity'],
      })
    },
  }
}
