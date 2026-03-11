import db from '../infrastructure/database.cjs'
import HTTPException from '../error/HTTPException.js'
import { randomBytes } from 'crypto'
import { createTransport } from 'nodemailer'

export async function createEmailService(deps = {}) {
  const { User = (await db()).User, transporter = createTransporter() } = deps

  return {
    async sendVerificationEmail(userId) {
      const expiration = Number(process.env.TOKEN_EXPIRATION_SECONDS)
      const emailVerificationData = {
        emailTokenVerify: randomBytes(32).toString('hex'),
        emailTokenExpiresAt: new Date((Date.now() + expiration) * 1000),
        emailVerifyAt: null,
      }

      const [count] = await User.update(emailVerificationData, {
        where: {
          id: userId,
        },
      })
      if (count === 0) {
        throw new HTTPException(404, 'User not found')
      }

      const user = await User.findByPk(userId)
      const { username, email, emailTokenVerify } = user
      const template = getTemplate(username, emailTokenVerify)
      await transporter.sendMail({
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
        to: email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })
    },
  }
}

function getTemplate(username, token) {
  const url = `${process.env.APP_BASE_URL}/verify-email?token=${token}`
  const expiresInHours = Number(process.env.TOKEN_EXPIRATION_SECONDS)
  const hoursDisplay = expiresInHours / 3_600
  return {
    subject: 'Confirm your email address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Hello, ${username}!</h2>
        <p>Thank you for registering. Click the button below to confirm your email address.</p>

        <a href="${url}"
           style="display: inline-block; padding: 12px 24px; background-color: #4F46E5;
                  color: white; text-decoration: none; border-radius: 4px; margin: 16px 0;">
          Confirm Email
        </a>

        <p style="color: #6B7280; font-size: 14px;">
          This link expires in <strong>${hoursDisplay} hours</strong>.<br/>
          If you did not create an account, you can safely ignore this email.
        </p>

        <p style="color: #9CA3AF; font-size: 12px;">
          If the button doesn't work, copy and paste the link below into your browser:<br/>
          <a href="${url}">${url}</a>
        </p>
      </div>
    `,
    text: `Hello, ${username}!\n\nPlease confirm your email address by visiting:\n${url}\n\nThis link expires in ${hoursDisplay} hours.\n\nIf you did not create an account, you can safely ignore this email.`,
  }
}

function createTransporter() {
  return createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_PORT === '465',
    auth: process.env.MAIL_USER
      ? {
          user: process.env.MAIL_USER,
          pass: process.env.MAIL_PASS,
        }
      : undefined,
  })
}
