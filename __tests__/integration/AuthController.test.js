import { describe, expect, it } from '@jest/globals'
import request from 'supertest'
import db from '../../src/infrastructure/database.cjs'

describe('POST /register', () => {
  it('should register a user and receive HTTP 200', async () => {
    const payload = {
      username: 'johndoe',
      password: 'test123',
      email: 'johndoe@test.com',
    }

    const response = await request(global.__SERVER__).post('/register').send(payload).expect(200)

    expect(response.body).toStrictEqual({ message: `User johndoe successfully registered` })

    const saved = await (
      await db()
    ).User.findOne({
      where: { username: 'johndoe' },
    })
    expect(saved).toBeDefined()
  })
})
