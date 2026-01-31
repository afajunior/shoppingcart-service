import Joi from 'joi'

export const registerSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(32).required(),
})

export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).max(32).required(),
})

export const searchParamsSchema = Joi.object({
  order: Joi.string(),
  sort: Joi.string().valid('ASC', 'DESC'),
  max: Joi.number().positive(),
  offset: Joi.number(),
})

export const paramSchema = Joi.object({
  id: Joi.number().integer().positive().required(),
})

export const productBodySchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().positive().required(),
  quantity: Joi.number().required(),
})

export const cartBodySchema = Joi.object({
  productId: Joi.number().required(),
  quantity: Joi.number().required(),
})
