# Wheelify — System Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER (Browser)                          │
└─────────────────────┬───────────────────────────────────────┘
                      │ HTTPS
┌─────────────────────▼───────────────────────────────────────┐
│              FRONTEND  (React.js + Tailwind)                │
│  Landing │ Compare │ Fuel Calc │ TCO │ Break-Even │ Discover│
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (JSON)
┌─────────────────────▼───────────────────────────────────────┐
│              BACKEND  (Node.js + Express.js)                │
│   /vehicles  │  /brands  │  /analytics  │  /fuel-prices    │
└──────┬──────────────────────────────┬────────────────────────┘
       │ SQL                          │ HTTP
┌──────▼──────┐               ┌───────▼──────────────────────┐
│ PostgreSQL  │               │  Python Analytics Service    │
│  Database   │               │  Fuel Cost │ TCO │ Break-Even│
└─────────────┘               └──────────────────────────────┘
```

## Data Flow

1. **User opens Wheelify** → React app loads from CDN/hosting
2. **User browses vehicles** → Frontend calls `GET /api/v1/vehicles`
3. **User selects variants** → Variant IDs stored in React Context
4. **User requests fuel cost** → `POST /api/v1/analytics/fuel-cost` → Python model
5. **User views TCO** → `POST /api/v1/analytics/tco` → Python model
6. **User views break-even** → `POST /api/v1/analytics/breakeven` → Python model

## Deployment (Planned)

- Frontend: Vercel / AWS S3 + CloudFront
- Backend: AWS EC2 / Azure App Service
- Database: AWS RDS (PostgreSQL)
- Analytics: AWS Lambda / Azure Functions
