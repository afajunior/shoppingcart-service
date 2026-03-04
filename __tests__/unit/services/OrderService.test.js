import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createOrderService } from '../src/service/OrderService'

const dbInstanceMock = {
  Order: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    addProduct: jest.fn(),
  },
  Product: {
    findAll: jest.fn(),
  },
  sequelize: {
    transaction: jest.fn(),
  },
}
const redisMock = {
  set: jest.fn(),
}

const orderService = await createOrderService({
  dbInstance: dbInstanceMock,
  redis: redisMock,
  loggerInstance: {
    debug: jest.fn(),
  },
})

describe('OrderService.Get', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })
  it('should get a especific order', async () => {
    const existingProduct = {
      id: 1,
      name: 'product-test',
      quantity: 123,
    }
    const existingOrder = {
      id: 1,
      totalAmount: 123,
      status: 'new',
      createdAt: new Date(),
      Products: [
        {
          id: existingProduct.id,
          name: existingProduct.name,
          ProductOrder: {
            quantity: existingProduct.quantity,
          },
        },
      ],
    }
    const expectedResult = {
      id: existingOrder.id,
      totalAmount: existingOrder.totalAmount,
      status: existingOrder.status,
      createdAt: existingOrder.createdAt,
      products: existingOrder.Products.map((p) => ({
        id: p.id,
        name: p.name,
        quantity: p.ProductOrder.quantity,
      })),
    }

    dbInstanceMock.Order.findOne.mockImplementation(async (args) => {
      expect(args.attributes).toMatchObject(['id', 'totalAmount', 'status', 'createdAt'])
      expect(args.include).toMatchObject({
        model: dbInstanceMock.Product,
        attributes: ['id', 'name'],
        through: {
          attributes: ['quantity'],
        },
      })
      return existingOrder
    })

    const order = await orderService.get(1, 1)
    expect(order).toMatchObject(expectedResult)
    expect(dbInstanceMock.Order.findOne).toHaveBeenCalled()
  })

  it('should throw 404 error if order does not exist', async () => {
    dbInstanceMock.Order.findOne.mockResolvedValue(null)
    await expect(orderService.get(-1, 1)).rejects.toMatchObject({
      message: 'Order not found',
      status: 404,
    })
  })
})
describe('OrderService.List', () => {
  it('should return a list of orders', async () => {
    const expectedOrders = [
      {
        id: 123,
        totalAmount: 10,
        status: 'new',
        createdAt: new Date(),
      },
      {
        id: 456,
        totalAmount: 20,
        status: 'processed',
        createdAt: new Date(),
      },
      {
        id: 789,
        totalAmount: 30,
        status: 'cancelled',
        createdAt: new Date(),
      },
    ]
    dbInstanceMock.Order.findAll.mockImplementation(async (args) => {
      const { order, limit, offset } = args
      expect(order).toMatchObject([['id', 'ASC']])
      expect(limit).toBe(10)
      expect(offset).toBe(0)
      return expectedOrders
    })
    const orders = await orderService.list()
    expect(orders).toMatchObject(expectedOrders)
    expect(dbInstanceMock.Order.findAll).toHaveBeenCalled()
  })
  it('should pass the correct params', async () => {
    dbInstanceMock.Order.findAll.mockImplementation(async (args) => {
      const { order, limit, offset } = args
      expect(order).toMatchObject([['totalAmount', 'DESC']])
      expect(limit).toBe(50)
      expect(offset).toBe(10)
      return []
    })
    const orders = await orderService.list(1, 'totalAmount', 'DESC', 50, 10)
    expect(orders).toMatchObject([])
    expect(dbInstanceMock.Order.findAll).toHaveBeenCalled()
  })
})
describe('OrderService.Create', () => {
  it('should create and return a correct order', async () => {
    const createdAt = Date()
    const sessionId = 'redis-sessionId-test'
    const sessionData = {
      cart: [
        {
          productId: 123,
          quantity: 1,
        },
        {
          productId: 456,
          quantity: 2,
        },
        {
          productId: 789,
          quantity: 3,
        },
      ],
    }
    const expectedOrder = {
      id: 1,
      totalAmount: 139.4,
      status: 'new',
      createdAt,
      products: [],
    }
    const mockOrder = {
      ...expectedOrder,
      addProduct: jest.fn(),
    }

    dbInstanceMock.Product.findAll.mockResolvedValue([
      {
        id: 123,
        price: 0.99,
        quantity: 10,
        decrement: jest.fn(),
      },
      {
        id: 456,
        price: 1.99,
        quantity: 20,
        decrement: jest.fn(),
      },
      {
        id: 789,
        price: 2.99,
        quantity: 30,
        decrement: jest.fn(),
      },
    ])
    dbInstanceMock.Order.create.mockResolvedValue(mockOrder)
    dbInstanceMock.sequelize.transaction.mockImplementation(async (args) => {
      const transactionMock = {}
      await args(transactionMock)

      expect(dbInstanceMock.Order.create).toHaveBeenCalledWith(
        { totalAmount: 139.4, user_id: 1 },
        { transaction: transactionMock }
      )
      expect(mockOrder.addProduct).toHaveBeenCalledTimes(3)

      return {
        id: 1,
        totalAmount: 139.4,
        createdAt,
        addProduct: jest.fn(),
      }
    })

    jest.spyOn(orderService, 'get').mockResolvedValue(expectedOrder)

    const newOrder = await orderService.create(sessionId, sessionData, 1)
    expect(newOrder).toMatchObject(expectedOrder)
    expect(dbInstanceMock.Product.findAll).toHaveBeenCalled()
    expect(dbInstanceMock.sequelize.transaction).toHaveBeenCalled()
    expect(redisMock.set).toHaveBeenCalledWith(`session:${sessionId}`, JSON.stringify({ cart: [] }), {
      EX: 60 * 60 * 2,
    })
  })

  it('should not create order if cart does not exist', async () => {
    expect(orderService.create('123', {}, 1)).rejects.toMatchObject({
      status: 404,
      message: 'Cart not found',
    })
  })

  it('should not create order if cart is empty', async () => {
    expect(orderService.create('123', { cart: [] }, 1)).rejects.toMatchObject({
      status: 400,
      message: 'Empty Cart',
    })
  })
})
