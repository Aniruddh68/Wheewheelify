# Wheelify — Backend API

Node.js + Express.js REST API for the Wheelify platform.

## Tech Stack
- Node.js + Express.js
- PostgreSQL (via `pg` driver)
- express-validator (input validation)
- helmet + cors (security)

## Folder Structure

```
src/
├── config/        # DB connection, env config
├── controllers/   # Route handler logic
├── middleware/     # Auth, error handling, validation
├── models/        # DB query functions (raw SQL / query builder)
├── routes/        # Express router definitions
├── services/      # Business logic layer
├── utils/         # Helpers: formatting, calculations
└── validators/    # Input validation schemas
```

## API Endpoints (Planned)

| Method | Endpoint                     | Description                   |
|--------|------------------------------|-------------------------------|
| GET    | /api/v1/categories           | All vehicle categories        |
| GET    | /api/v1/brands               | All brands (filter by cat)    |
| GET    | /api/v1/vehicles             | Browse vehicles with filters  |
| GET    | /api/v1/vehicles/:id         | Single vehicle details        |
| GET    | /api/v1/vehicles/:id/variants| All variants of a model       |
| GET    | /api/v1/fuel-prices          | Current fuel prices           |
| POST   | /api/v1/analytics/fuel-cost  | Fuel cost prediction          |
| POST   | /api/v1/analytics/tco        | 5-Year TCO calculation        |
| POST   | /api/v1/analytics/breakeven  | Break-even analysis           |
