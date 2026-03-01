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
  verifyEmailSchema,
} from './infrastructure/validator.js'
import { extractSession } from './middlewares/ExtractSessionMiddleware.js'
import { authorize } from './middlewares/AuthorizationMiddleware.js'

const app = express()
app.use(express.json())

const validator = createValidator({})

// Auth
app.post('/register', validator.body(registerSchema), authController.register)
app.post('/login', validator.body(loginSchema), authController.login)
app.get('/verify-email', validator.body(verifyEmailSchema), authController.verifyEmail)
app.post('/resend-token', extractSession, authorize('USER'), authController.sendVerificationEmail)

// Product
app.get('/product/:id', extractSession, validator.params(paramSchema), productController.get)
app.get('/product', extractSession, validator.query(searchParamsSchema), productController.list)
app.post('/product', extractSession, authorize('ADMIN'), validator.body(productBodySchema), productController.save)
app.put(
  '/product/:id',
  extractSession,
  authorize('ADMIN'),
  validator.params(paramSchema),
  validator.body(productBodySchema),
  productController.update
)

// Order
app.get('/order/:id', extractSession, authorize('USER'), validator.params(paramSchema), orderController.get)
app.get('/order', extractSession, authorize('USER'), validator.query(searchParamsSchema), orderController.list)
app.post('/order', extractSession, authorize('USER'), orderController.create)

// Cart
app.get('/cart', extractSession, authorize('USER'), cartController.get)
app.post('/cart', extractSession, authorize('USER'), validator.body(cartBodySchema), cartController.add)

export { app }
