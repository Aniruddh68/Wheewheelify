# Wheelify — Analytics Module (Python)

Python-based predictive analytics engine for fuel cost estimation,
Total Cost of Ownership (TCO), and break-even analysis.

## Tech Stack
- Python 3.11+
- Pandas, NumPy (data processing)
- FastAPI (REST endpoints for analytics)
- Pytest (testing)

## Modules

| Module                        | Description                                |
|-------------------------------|--------------------------------------------|
| `models/fuel_cost_model.py`   | Monthly/yearly fuel cost prediction        |
| `models/tco_model.py`         | 5-Year Total Cost of Ownership calculator  |
| `models/breakeven_model.py`   | Break-even month calculation (EV vs ICE)   |
| `models/maintenance_model.py` | Maintenance cost projection                |
| `models/insurance_model.py`   | Insurance premium estimation               |
| `utils/formulas.py`           | Core calculation formulas                  |
| `utils/validators.py`         | Input validation helpers                   |

## Key Formulas

```
Monthly Fuel Cost = (Daily KM × 30) / Mileage (kmpl) × Fuel Price (₹/L)
Yearly Fuel Cost  = Monthly × 12
5-Year TCO        = Purchase Price + (5yr Fuel) + (5yr Maintenance) + (5yr Insurance)
Break-Even Month  = EV Premium / (Monthly Petrol Cost − Monthly EV Cost)
```
