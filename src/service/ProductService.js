import { logger } from '../infrastructure/logger.js'
import db from '../infrastructure/database.cjs'

const { Product } = await db

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
export async function get(productId) {
  return await Product.findByPk(productId, {
    attributes: ['id', 'name', 'price', 'quantity'],
  })
}

/**
 *
 * @param {Omit<Product, 'id'>} product
 * @returns {Promise<Product>}
 */
export async function save(product) {
  const createdProduct = await Product.build(product).save()

  logger.info(`Saved product#${createdProduct.id} to the database`)
  return { id: createdProduct.id, ...product }
}

/**
 *
 * @param {number} id
 * @param {Omit<Product, 'id'>} product
 * @returns {Promise<Product | null>}
 */
export async function update(id, product) {
  const affectedCount = await Product.update(product, {
    where: {
      id,
    },
  })

  logger.info(`Updated product#${id}. Rows updated: ${affectedCount}`)

  if (affectedCount[0] === 0) {
    return null
  }

  return await Product.findByPk(id, {
    attributes: ['id', 'name', 'price', 'quantity'],
  })
}

/**
 *
 * @param {string | undefined} order
 * @param {'ASC' | 'DESC' | undefined} sort
 * @param {number | undefined} max
 * @param {number | undefined} offset
 * @returns {Promise<Product[]>}
 */
export async function list(order, sort, max, offset) {
  return await Product.findAll({
    order: [[order || 'id', sort || 'ASC']],
    limit: max || 10,
    offset: offset || 0,
    attributes: ['id', 'name', 'price', 'quantity'],
  })
}
