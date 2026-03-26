# Wheelify — Database

PostgreSQL database schema, migrations, and seed data.

## Structure

```
database/
├── schemas/       # Table definitions (CREATE TABLE statements)
├── migrations/    # Ordered migration files (run in sequence)
└── seeds/         # Sample/initial data for development
```

## Core Tables

| Table                    | Description                                |
|--------------------------|--------------------------------------------|
| `vehicle_categories`     | Cars, Bikes, EVs, Commercial               |
| `brands`                 | Maruti, Tata, Hyundai, etc.               |
| `vehicle_models`         | Swift, Nexon, Activa, etc.                |
| `vehicle_variants`       | LXi, VXi, ZXi, ZXi+, etc.               |
| `maintenance_schedules`  | Service intervals and costs               |
| `insurance_estimates`    | Year-by-year insurance premiums           |
| `fuel_prices`            | City-wise current fuel prices             |
| `comparison_sessions`    | User comparison session state             |

## Setup

```bash
# Create database
createdb wheelify_db

# Run migrations in order
psql -d wheelify_db -f migrations/001_create_categories.sql
psql -d wheelify_db -f migrations/002_create_brands.sql
psql -d wheelify_db -f migrations/003_create_models.sql
psql -d wheelify_db -f migrations/004_create_variants.sql
psql -d wheelify_db -f migrations/005_create_supporting_tables.sql

# Seed with sample data
psql -d wheelify_db -f seeds/001_seed_categories.sql
psql -d wheelify_db -f seeds/002_seed_brands.sql
psql -d wheelify_db -f seeds/003_seed_sample_vehicles.sql
```
