import express from 'express'
import * as productController from './controllers/ProductController.js'
import * as authController from './controllers/AuthController.js'
import * as cartController from './controllers/CartController.js'
import * as orderController from './controllers/OrderController.js'
import { createValidator } from 'express-joi-validation'
import {
  cartBodySchema,
  loginSchema,
  paramSchema,
  productBodySchema,
  searchParamsSchema,
  registerSchema,
} from './infrastructure/validator.js'
import { auth } from './middlewares/AuthMiddleware.js'

const app = express()
app.use(express.json())

const validator = createValidator({})

// Login
app.post('/register', validator.body(registerSchema), authController.register)
app.post('/login', validator.body(loginSchema), authController.login)

// Product
app.get('/product/:id', auth, validator.params(paramSchema), productController.get)
app.get('/product', auth, validator.query(searchParamsSchema), productController.list)
app.post('/product', auth, validator.body(productBodySchema), productController.save)
app.put(
  '/product/:id',
  auth,
  validator.params(paramSchema),
  validator.body(productBodySchema),
  productController.update
)

// Order
app.get('/order/:id', auth, validator.params(paramSchema), orderController.get)
app.get('/order', auth, validator.query(searchParamsSchema), orderController.list)
app.post('/order', auth, orderController.create)

// Cart
app.get('/cart', auth, cartController.get)
app.post('/cart', auth, validator.body(cartBodySchema), cartController.add)

export { app }
