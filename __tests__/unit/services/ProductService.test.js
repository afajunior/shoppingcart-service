import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createProductService } from '../../../src/service/ProductService'

const productModelMock = {
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  findAll: jest.fn(),
}

const productService = await createProductService({
  productModel: productModelMock,
  loggerInstance: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
})

describe('ProductService.CRUD', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should return a product by id', async () => {
    const productId = 123
    const expectedProduct = {
      id: productId,
      name: 'Sample Product',
      price: 1.23,
      quantity: 456,
    }
    productModelMock.findByPk.mockResolvedValue(expectedProduct)
    const product = await productService.get(productId)
    expect(product).toMatchObject(expectedProduct)
    expect(productModelMock.findByPk).toHaveBeenCalledWith(productId, {
      attributes: ['id', 'name', 'price', 'quantity'],
    })
  })
  it('should save a new product', async () => {
    const newProduct = {
      name: 'Sample Product',
      price: 1.23,
      quantity: 456,
    }
    productModelMock.create.mockResolvedValue({ id: 123, ...newProduct })
    const product = await productService.save(newProduct)
    expect(product).toMatchObject({ id: 123, ...newProduct })
    expect(productModelMock.create).toHaveBeenCalledWith(newProduct)
  })
  it('should update a new product', async () => {
    const updateProduct = {
      name: 'Sample Product New Value',
      price: 7.89,
      quantity: 456,
    }

    productModelMock.update.mockResolvedValue([1])
    jest.spyOn(productService, 'get').mockResolvedValue({ id: 123, ...updateProduct })

    const product = await productService.update(123, updateProduct)
    expect(product).toMatchObject({ id: 123, ...updateProduct })
  })
  it('should return 404 Not Found when try to update a non existed product', async () => {
    const updateProduct = {
      name: 'Invalid Product',
    }

    productModelMock.update.mockResolvedValue([0])

    expect(productService.update(123, updateProduct)).rejects.toMatchObject({
      status: 404,
      message: 'Product Not Found',
    })
  })
  it('should return a list of products', async () => {
    const expectedProducts = [
      {
        id: 123,
        name: 'Sample 1',
        price: 12.34,
        quantity: 56,
      },
      {
        id: 456,
        name: 'Sample 2',
        price: 56.78,
        quantity: 9,
      },
    ]

    productModelMock.findAll.mockResolvedValue(expectedProducts)

    const products = await productService.list()
    expect(products).toMatchObject(expectedProducts)
    expect(productModelMock.findAll).toHaveBeenCalledWith({
      order: [['id', 'ASC']],
      limit: 10,
      offset: 0,
      attributes: ['id', 'name', 'price', 'quantity'],
    })
  })

  it('should pass the correct params', async () => {
    const expectedProducts = []

    productModelMock.findAll.mockResolvedValue(expectedProducts)

    const products = await productService.list('quantity', 'DESC', 50, 10)
    expect(products).toMatchObject(expectedProducts)
    expect(productModelMock.findAll).toHaveBeenCalledWith({
      order: [['quantity', 'DESC']],
      limit: 50,
      offset: 10,
      attributes: ['id', 'name', 'price', 'quantity'],
    })
  })
})
