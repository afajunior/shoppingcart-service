import { logger } from './infrastructure/logger.js'
import { app } from './routes.js'

const port = process.env.PORT || 3000

logger.info(`Listen on port ${port}`)
app.listen(port)
