import { describe, expect, it } from '@jest/globals'
import request from 'supertest'
import db from '../../src/infrastructure/database.cjs'
import jwt from 'jsonwebtoken'

const payload = {
  username: 'johndoe',
  password: 'test123',
  email: 'johndoe@test.com',
}

describe('POST /register', () => {
  it('should register a user, receive HTTP 200 and send an email confirmation', async () => {
    const response = await request(global.__SERVER__).post('/register').send(payload).expect(200)

    expect(response.body).toStrictEqual({ message: `User johndoe successfully registered` })

    const saved = await (
      await db()
    ).User.findOne({
      where: { username: 'johndoe' },
    })
    expect(saved).toBeDefined()

    const mailhogResponse = await fetch(`${process.env.MAIL_API}/api/v2/messages`)
    const { items } = await mailhogResponse.json()

    const email = items.find((m) => m.Content.Headers.To[0] === 'johndoe@test.com')

    expect(email).toBeDefined()
    expect(email.Content.Headers.Subject[0]).toBe('Verify your email')
    expect(email.Content.Headers.From[0]).toBe('mockmail <mockmail@test.com>')
  })
})

describe('POST /login', () => {
  it('should login successfully', async () => {
    const payloadRegister = {
      username: 'johndoe',
      password: 'test123',
      email: 'johndoe@test.com',
    }
    const payloadLogin = {
      username: 'johndoe',
      password: 'test123',
    }
    await request(global.__SERVER__).post('/register').send(payloadRegister).expect(200)
    const responseLogin = await request(global.__SERVER__).post('/login').send(payloadLogin).expect(200)
    const token = responseLogin.body.token
    const payload = jwt.verify(token, process.env.JWT_SECRET)

    expect(typeof payload.userId).toBe('number')
    expect(payload.roles).toBe(['USER'])
    expect(payload.sessionId).toBeDefined()
  })
})

describe('GET /verifyEmail', () => {
  it('should validate email token verification', async () => {
    const token = 'token123'
    await request(global.__SERVER__).get('/verify-email').query({ token }).expect(200)
  })
})
