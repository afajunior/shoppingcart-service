# shoppingcart-service

A REST API for managing users, products, shopping carts, and orders. Built with Node.js, Express 5, PostgreSQL, and Redis.

## Overview

The service covers the full lifecycle of an e-commerce cart: user registration with email verification, role-based access control (USER / ADMIN), product catalog management, a Redis-backed cart that persists across requests, and order checkout with real-time stock decrement. All stateful operations run inside Sequelize transactions to guarantee consistency.

### Tech stack

| Layer         | Technology                      |
| ------------- | ------------------------------- |
| Runtime       | Node.js (ESM)                   |
| Framework     | Express 5                       |
| Database      | PostgreSQL via Sequelize 6      |
| Session store | Redis 5                         |
| Auth          | JWT + bcrypt                    |
| Validation    | Joi + express-joi-validation    |
| Email         | Nodemailer                      |
| Observability | OpenTelemetry (OTLP) + Winston  |
| Testing       | Jest, Supertest, Testcontainers |

---

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Redis 7+
- Docker (required for integration tests via Testcontainers)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env-sample .env
```

Open `.env` and fill in the required values:

```env
# Application
PORT=3000
LOGGER_LEVEL=info

# Security — generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=

# Session and token TTL (in seconds)
CART_EXPIRATION_SECONDS=7200       # 2 hours
TOKEN_EXPIRATION_SECONDS=7200      # 2 hours

# Infrastructure
REDIS_URL=redis://localhost:6379
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/shoppingcart

# Application base URL (used in verification emails)
APP_BASE_URL=http://localhost:3000

# CORS — comma-separated list of allowed origins
CORS_ORIGIN=http://localhost:3000

# Email (example uses Mailtrap sandbox)
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM_NAME=Cart Service
MAIL_FROM_ADDRESS=

# OpenTelemetry (optional — leave blank to disable)
OTEL_SERVICE_NAME=shoppingcart
OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
OTEL_EXPORTER_OTLP_HEADERS=
```

The application calls `process.exit(1)` at startup if any required variable is missing, so it will fail fast with a clear message rather than silently misbehaving at runtime.

### 3. Run database migrations

```bash
npm run db:migrate
```

This creates all tables and runs the seed that inserts the default `ADMIN` and `USER` roles and a root admin user.

### 4. Start the server

```bash
npm start
```

The server starts on the port defined in `PORT` (default `3000`) with file watching enabled, so it restarts automatically on source changes.

---

## API collection

The repository includes `insomnia-collections.yaml`, a ready-to-use request collection with all endpoints pre-configured.

### Insomnia

Import directly via **File → Import** and select the file. The collection uses an environment variable `baseurl`, set it to `http://localhost:3000` (or your deployed URL) in your Insomnia environment before running requests.

---

## npm scripts

| Script                              | What it does                                                                                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm start`                         | Starts the server with `--watch` (auto-restart on changes), loads `.env` via dotenv, and bootstraps OpenTelemetry tracing before any application code runs.                                                          |
| `npm run format`                    | Formats all files with Prettier.                                                                                                                                                                                     |
| `npm run lint`                      | Runs ESLint across the project.                                                                                                                                                                                      |
| `npm run lint:fix`                  | Runs ESLint and auto-fixes what it can.                                                                                                                                                                              |
| `npm run test:unit`                 | Runs unit tests in `__tests__/unit`. No external services required — all dependencies are mocked.                                                                                                                    |
| `npm run test:unit:coverage`        | Same as above, with a coverage report.                                                                                                                                                                               |
| `npm run test:integration`          | Runs integration tests in `__tests__/integration`. Spins up real PostgreSQL and Redis instances via Testcontainers (requires Docker). Tests run serially (`--runInBand`) to avoid port conflicts between containers. |
| `npm run test:integration:coverage` | Same as above, with a coverage report.                                                                                                                                                                               |
| `npm run db:migrate`                | Applies pending Sequelize migrations against the database configured in `.env`.                                                                                                                                      |
| `npm run db:migrate:generate`       | Generates a new empty migration file. Usage: `npm run db:migrate:generate -- --name describe-the-change`.                                                                                                            |

---

## Project structure

```
src/
├── controllers/       # HTTP layer — parse request, call service, send response
├── service/           # Business logic — orchestrates models, Redis, email
├── models/            # Sequelize model definitions
├── middlewares/
│   ├── ExtractSessionMiddleware.js   # JWT verification + Redis session hydration
│   ├── AuthorizationMiddleware.js    # Role-based access control
│   └── ErrorMiddleware.js            # Centralized error handler
├── infrastructure/
│   ├── database.cjs   # Sequelize initialization (CJS — required by sequelize-cli)
│   ├── redis.js        # Redis client singleton
│   ├── session.js      # Session read/write helpers (key, TTL, JSON serialization)
│   ├── validator.js    # Joi schemas for all request shapes
│   └── logger.js       # Winston logger
├── error/
│   └── AppException.js # AppError — carries HTTP status alongside the message
├── database/
│   ├── config.cjs      # Sequelize CLI connection config (reads DATABASE_URL)
│   ├── migrations/     # Schema migrations
│   └── seeders/        # Default roles and root user
├── routes.js           # Express app, middleware chain, route registration
└── index.js            # Bootstrap: env validation → infra init → app.listen
```

---

## Design decisions

### Factory functions for services

Each service is created by a `createXxxService(deps = {})` factory that accepts its dependencies as an explicit object. This makes the dependency graph visible and keeps services testable without mocking module imports, unit tests simply pass in mock objects:

```js
const authService = await createAuthService({
  dbInstance: mockDb,
  redis: mockRedis,
  emailService: mockEmail,
})
```

The alternative, importing and calling `initializeRedis()` or `db()` directly inside each service, would scatter infrastructure calls throughout the codebase and make it impossible to test services without a real database or Redis connection.

### Explicit DI via app.locals

All services and the Redis client are instantiated once during bootstrap in `initializeInfrastructure()` and attached to `app.locals`. Controllers retrieve them via `request.app.locals.services.xxx` and `request.app.locals.redis`. This means:

- Infrastructure connects before the first request, not lazily on the first call.
- A connection failure at startup causes `process.exit(1)` with a clear log message rather than a cryptic 500 on the first request.
- The entire dependency graph is visible in one place (`src/index.js`), making it easy to understand what the application needs to function.

### Centralized error handling

All controllers follow the same pattern:

```js
try {
  // ...
} catch (err) {
  next(err)
}
```

`ErrorMiddleware.js` is the single place where errors are translated into HTTP responses. `AppError` instances (thrown by services for expected conditions like "user not found") produce their intended status code; anything else becomes a generic 500 with the error logged. This avoids the ~150 lines of duplicated `instanceof` checks that would otherwise appear in every handler.

### Session stored in Redis, not in the JWT

The JWT payload contains only `userId`, `roles`, and a `sessionId` UUID. The actual session data (the cart) lives in Redis under the key `session:{sessionId}` with a configurable TTL. This means:

- Logout is reliable, deleting the Redis key immediately invalidates the token regardless of its expiry time.
- The cart can grow without affecting the JWT size.
- Server-side session state can be inspected, modified, or cleared by an operator.

`session.js` centralizes the key format, JSON serialization, and TTL so that no other file needs to know the shape of the session object.

### Two-phase middleware for auth

`extractSession` (authentication) runs first: it verifies the JWT signature and hydrates `request.session` with the payload and the cart from Redis. `authorize(...roles)` (authorization) runs second and simply reads `request.session.roles` does not touch the JWT again. Separating these concerns makes it easy to add new protected routes without duplicating cryptographic work.

### Decimal.js for monetary calculations

`product.price` and `order.totalAmount` are stored as `DECIMAL(10, 2)` in PostgreSQL, but JavaScript's native floating-point arithmetic (`0.1 + 0.2 !== 0.3`) cannot safely represent fixed-precision decimals. `OrderService` uses `Decimal.js` for the `totalAmount` calculation to avoid rounding errors before writing the result to the database.

### database.cjs instead of database.js

Sequelize CLI does not support ES modules natively. The database initialization file uses CommonJS (`require`, `module.exports`) so that the CLI can load it directly for migrations and seeders, while the rest of the project uses ESM. The `.cjs` extension makes the module system boundary explicit.
