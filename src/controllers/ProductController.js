import * as productService from '../service/ProductService.js'

/**
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function get(request, response) {
  try {
    const { id } = request.params
    if (typeof id !== 'number') {
      return response.status(400).json({ message: 'Bad Request' })
    }
    const product = await productService.get(id)
    if (product == null) {
      return response.status(404).json({ error: `Product #${id} not found` })
    }
    return response.json(product)
  } catch (error) {
    return response.status(500).json({ message: error.message })
  }
}

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function save(request, response) {
  try {
    const product = await productService.save(request.body)
    return response.json(product)
  } catch (error) {
    return response.status(500).json({ message: error.message })
  }
}

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function update(request, response) {
  const id = request.params.id

  if (typeof id !== 'number') {
    return response.status(400).json({ message: 'Bad Request' })
  }

  const product = request.body
  try {
    const updatedProduct = await productService.update(id, product)
    if (updatedProduct == null) {
      return response.status(404).send()
    }

    return response.json(updatedProduct)
  } catch (error) {
    return response.status(500).json({ message: error.message })
  }
}

/**
 *
 * @param {import('express').Request} request
 * @param {import('express').Response} response
 * @returns {Promise<import('express').Response>}
 */
export async function list(request, response) {
  try {
    const { order, sort, max, offset } = request.query
    if (
      typeof order !== 'string' ||
      (sort !== 'ASC' && sort !== 'DESC') ||
      typeof max !== 'number' ||
      typeof offset !== 'number'
    ) {
      return response.status(400).json({ message: 'Bad Request' })
    }

    const products = await productService.list(order, sort, max, offset)
    return response.json(products)
  } catch (error) {
    return response.status(500).json({ message: error.message })
  }
}
