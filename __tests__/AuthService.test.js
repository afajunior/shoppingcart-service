import { beforeEach, describe, expect, it, jest } from '@jest/globals'
import { createAuthService } from '../src/service/AuthService'
import HTTPException from '../src/error/HTTPException'

const userModelMock = {
  findOne: jest.fn(),
  create: jest.fn(),
}
const jwtLibMock = {
  sign: jest.fn(),
}
const redisMock = {
  set: jest.fn(),
}
const compareMock = jest.fn()
const uuidLibMock = jest.fn()

const authService = await createAuthService({
  userModel: userModelMock,
  jwtLib: jwtLibMock,
  redis: redisMock,
  compareLib: compareMock,
  uuidLib: uuidLibMock,
  loggerInstance: {
    info: jest.fn(),
    error: jest.fn(),
  },
})

describe('AuthService.Register', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    userModelMock.findOne.mockImplementation(async (arg) => {
      const { where } = arg
      const { username, email } = where
      if (username === 'duplicate_username') {
        return {
          username: 'duplicate_username',
        }
      } else if (email === 'duplicateemail@test.com') {
        return {
          email: 'duplicateemail@test.com',
        }
      } else {
        return null
      }
    })
  })

  it('should register a user successfully', async () => {
    const newUser = {
      username: 'test',
      password: 'password123',
      email: 'test@mock.com',
    }
    const savedUser = {
      id: 1,
      ...newUser,
    }

    userModelMock.create.mockResolvedValue(savedUser)

    const user = await authService.register(newUser)
    expect(user).toBe(savedUser)
  })

  it('should throw error if the username exists', async () => {
    const duplicateUsername = {
      username: 'duplicate_username',
    }

    await expect(authService.register(duplicateUsername)).rejects.toMatchObject(
      new HTTPException(400, 'The username already exists')
    )
    expect(userModelMock.create).not.toHaveBeenCalled()
  })

  it('should throw error if the email exists', async () => {
    const duplicateEmail = {
      email: 'duplicateemail@test.com',
    }

    await expect(authService.register(duplicateEmail)).rejects.toMatchObject(
      new HTTPException(400, 'This email is already registered')
    )
    expect(userModelMock.create).not.toHaveBeenCalled()
  })
})
describe('AuthService.Login', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env
  })
  it('should login successfully', async () => {
    const sessionId = 'sessionId'
    const secretJwt = 'test-secret'
    const userId = 123
    const expectedToken = 'expected_token'
    const newUser = {
      id: userId,
      username: 'test',
      password: 'password123',
      email: 'test@mock.com',
    }

    process.env.JWT_SECRET = secretJwt
    process.env.CART_EXPIRATION_TIME = 123456

    uuidLibMock.mockReturnValueOnce(sessionId)
    userModelMock.findOne.mockResolvedValue(newUser)
    compareMock.mockResolvedValue(true)
    jwtLibMock.sign.mockImplementation(async (obj, secret, opts) => {
      expect(obj).toMatchObject({ userId, sessionId })
      expect(secret).toBe(secretJwt)
      expect(opts).toMatchObject({ expiresIn: '2h' })
      return expectedToken
    })

    const token = await authService.login('test', 'password123')
    expect(token).toBe(expectedToken)
    expect(redisMock.set).toHaveBeenCalledWith(`session:${sessionId}`, JSON.stringify({ cart: [] }), {
      EX: Number(process.env.CART_EXPIRATION_TIME),
    })
  })

  it('should throw an error if user not found', async () => {
    userModelMock.findOne.mockResolvedValue(null)

    await expect(authService.login('test', 'password123')).rejects.toMatchObject(
      new HTTPException(404, 'User not found')
    )
  })

  it('should throw an error if password mismatch', async () => {
    userModelMock.findOne.mockResolvedValue({ username: 'test' })
    compareMock.mockResolvedValue(false)

    await expect(authService.login('test', 'password123')).rejects.toMatchObject(
      new HTTPException(403, 'Invalid credentials')
    )
  })

  it('should throw an error if JWT_SECRET does not defined', async () => {
    userModelMock.findOne.mockResolvedValue({ username: 'test' })
    compareMock.mockResolvedValue(true)
    delete process.env.JWT_SECRET

    await expect(authService.login('test', 'password123')).rejects.toThrow('Internal Error Service')
  })
})
