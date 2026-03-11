import { createProductService } from '../service/ProductService.js'

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function get(request, response, next) {
  try {
    const productService = await createProductService()
    const { id } = request.params
    const product = await productService.get(id)
    if (product == null) {
      return response.status(404).json({ error: `Product #${id} not found` })
    }
    return response.json(product)
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function save(request, response, next) {
  try {
    const productService = await createProductService()
    const product = await productService.save(request.body)

    return response.json(product)
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function update(request, response, next) {
  try {
    const id = request.params.id
    const product = request.body
    const productService = await createProductService()
    const updatedProduct = await productService.update(id, product)

    if (updatedProduct == null) {
      return response.status(404).send()
    }

    return response.json(updatedProduct)
  } catch (error) {
    next(error)
  }
}

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @param {import('express').NextFunction} next
 * @returns {Promise<import('express').Response>}
 */
export async function list(request, response, next) {
  try {
    const productService = await createProductService()
    const { order, sort, max, offset } = request.query
    const products = await productService.list(order, sort, max, offset)

    return response.json(products)
  } catch (error) {
    next(error)
  }
}
