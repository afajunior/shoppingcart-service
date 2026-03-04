import { describe, expect, it, jest } from '@jest/globals'
import { createEmailService } from '../src/service/EmailService.js'
import HTTPException from '../src/error/HTTPException.js'

const sendMailMock = jest.fn().mockResolvedValue({ messageId: '123' })
const transporterMock = { sendMail: sendMailMock }

const UserMock = {
  update: jest.fn().mockResolvedValue([1]),
  findByPk: jest.fn().mockResolvedValue({
    username: 'John',
    email: 'john@email.com',
    emailTokenVerify: 'token123',
  }),
}

const emailService = await createEmailService({ User: UserMock, transporter: transporterMock })

describe('EmailService', () => {
  it('deve enviar email de verificação', async () => {
    await emailService.sendVerificationEmail(1)

    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({ to: 'john@email.com' }))
  })

  it('deve lançar 404 se usuário não encontrado', async () => {
    UserMock.update.mockResolvedValueOnce([0])

    await expect(emailService.sendVerificationEmail(99)).rejects.toMatchObject(new HTTPException(404, 'User not found'))
  })
})
