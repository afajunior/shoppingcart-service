import winston from 'winston'

export const logger = winston.createLogger({
  transports: [new winston.transports.Console()],
  level: process.env.LOGGER_LEVEL || 'info',
})
