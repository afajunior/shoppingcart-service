import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createCartService } from '../../../src/service/CartService'
import AppError from '../../../src/error/AppException'

const findProductMock = jest.fn()
const setRedisMock = jest.fn()

const cartService = await createCartService({
  productModel: {
    findByPk: findProductMock,
  },
  redis: {
    set: setRedisMock,
  },
  loggerInstance: {
    info: jest.fn(),
  },
})

describe('CartService.Add', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should add a new product successfully in the redis', async () => {
    const sessionId = 'redis-sessionId-test'
    const sessionData = { cart: [] }
    const productId = 123
    const quantity = 12

    findProductMock.mockResolvedValue({ quantity: 50 })

    const cart = await cartService.add(sessionId, sessionData, productId, quantity)
    expect(cart).toMatchObject({ cart: [{ productId, quantity }] })
    expect(findProductMock).toHaveBeenCalled()
  })

  it('should add existing product and increase only the quantity', async () => {
    const sessionId = 'redis-sessionId-test'
    const sessionData = { cart: [{ productId: 123, quantity: 12 }] }
    const productId = 123
    const quantity = 34

    findProductMock.mockResolvedValue({ quantity: 50 })

    const cart = await cartService.add(sessionId, sessionData, productId, quantity)
    expect(cart).toMatchObject({ cart: [{ productId: 123, quantity: 46 }] })
    expect(findProductMock).toHaveBeenCalled()
  })

  it('should not allow add new product when quantity exceeds stock', async () => {
    const sessionId = 'redis-sessionId-test'
    const sessionData = { cart: [{ productId: 123, quantity: 12 }] }
    const productId = 123
    const quantity = 34

    findProductMock.mockResolvedValue({ quantity: 5 })

    await expect(cartService.add(sessionId, sessionData, productId, quantity)).rejects.toMatchObject(
      new AppError(400, 'Quantity exceed local inventory')
    )
    expect(findProductMock).toHaveBeenCalled()
  })

  it('should remove item in the stock if quantity is zero', async () => {
    const sessionId = 'redis-sessionId-test'
    const sessionData = { cart: [{ productId: 123, quantity: 12 }] }
    const productId = 123
    const quantity = -12

    findProductMock.mockResolvedValue({ quantity: 5 })

    const cart = await cartService.add(sessionId, sessionData, productId, quantity)
    expect(cart).toMatchObject({ cart: [] })
    expect(findProductMock).not.toHaveBeenCalled()
  })
})
