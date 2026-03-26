# Wheelify API Overview

Base URL: `https://api.wheelify.in/api/v1`
(Development: `http://localhost:5000/api/v1`)

## Authentication
MVP: No auth required (public read-only API)
Future: JWT-based auth for user features

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "total": 52,
    "page": 1,
    "limit": 12
  }
}
```

Error response:
```json
{
  "success": false,
  "error": {
    "code": "VEHICLE_NOT_FOUND",
    "message": "Vehicle with ID 999 not found"
  }
}
```

## Endpoints (All Planned)

### Vehicles
- `GET /categories` — All vehicle categories
- `GET /brands` — All brands (optional `?category=cars`)
- `GET /vehicles` — Browse vehicles (supports filters + pagination)
- `GET /vehicles/:id` — Single vehicle model details
- `GET /vehicles/:id/variants` — All variants for a model

### Fuel
- `GET /fuel-prices` — Current fuel prices by city/state

### Analytics (POST endpoints — all accept JSON body)
- `POST /analytics/fuel-cost` — Predict monthly/yearly fuel cost
- `POST /analytics/tco` — Calculate 5-Year Total Cost of Ownership
- `POST /analytics/breakeven` — Break-even month calculation
