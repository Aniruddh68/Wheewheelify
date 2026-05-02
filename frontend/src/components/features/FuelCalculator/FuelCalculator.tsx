import { useState, useMemo, useEffect } from 'react';
import { Fuel, Zap, TrendingUp, Calendar, Route, IndianRupee, Info } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
} from 'recharts';
import regression from 'regression';
import './FuelCalculator.css';

// ─── Types ────────────────────────────────────────────────────────────────────

/** Differentiates between ICE (fuel/litre) and EV (electricity/kWh) modes */
type FuelMode = 'ICE' | 'EV';

/** Fuel sub-type — drives inflation model */
type FuelType = 'Petrol/Diesel' | 'CNG' | 'EV';

/** Driving context — drives traffic-penalty mileage adjustment */
type DrivingEnv = 'City' | 'Highway' | 'Mixed';

// ─── ML Training Data ────────────────────────────────────────────────────────

// Format: [Year (x), Price (y)]
const historicalPetrolData: [number, number][] = [[1, 90], [2, 95], [3, 97], [4, 102], [5, 106]];
const historicalEVData: [number, number][] = [[1, 6.0], [2, 6.2], [3, 6.5], [4, 6.8], [5, 7.2]];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Formats a number into Indian currency style with commas.
 * e.g. 12500 → "₹12,500"
 * e.g. 125000 → "₹1,25,000"
 */
function formatINR(value: number): string {
  // Guard: non-finite, zero, or negative → ₹0
  if (!isFinite(value) || value <= 0) return '₹0';
  const rounded = Math.round(value);
  // Indian numbering: last 3 digits, then groups of 2
  const str = rounded.toString();
  if (str.length <= 3) return `₹${str}`;
  const last3 = str.slice(-3);
  const rest = str.slice(0, -3);
  const formatted = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
  return `₹${formatted},${last3}`;
}

/**
 * Safely divides two numbers, returning 0 when the divisor is 0.
 */
function safeDivide(numerator: number, divisor: number): number {
  if (!divisor || divisor === 0) return 0;
  return numerator / divisor;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * TooltipBubble
 * Custom tooltip that works on BOTH hover (desktop) and click/tap (mobile).
 * Appears with a smooth fade + scale-up animation defined in FuelCalculator.css.
 */
function TooltipBubble({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className={`fc-tt-anchor${open ? ' fc-tt-anchor--open' : ''}`}
      // Hover (desktop)
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      // Click / Tap (mobile & keyboard)
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((v) => !v); }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen((v) => !v); } }}
      role="button"
      tabIndex={0}
      aria-label="More information"
      aria-expanded={open}
    >
      {/* ℹ icon */}
      <Info size={13} aria-hidden="true" />

      {/* Bubble — conditionally rendered so CSS animation plays on enter */}
      {open && (
        <span className="fc-tt-bubble" role="tooltip">
          <span className="fc-tt-arrow" aria-hidden="true" />
          {text}
        </span>
      )}
    </span>
  );
}

/** A single labelled input field */
function InputField({
  id,
  label,
  unit,
  value,
  onChange,
  min = 0,
  step = 1,
  placeholder = '0',
  tooltip,
}: {
  id: string;
  label: string;
  unit: string;
  value: string;
  onChange: (v: string) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  tooltip?: string;
}) {
  /**
   * Sanitises the raw input string before it reaches state:
   *  - Empty string passes through as-is (allows clearing the field).
   *  - Strips leading '-' and 'e' characters to block negatives + scientific notation.
   *  - Values that parse to < 0 are clamped to '0'.
   */
  function handleChange(raw: string) {
    if (raw === '') { onChange(''); return; }
    // Block scientific notation ('e') and explicit negatives ('-')
    const sanitised = raw.replace(/[e\-]/gi, '');
    if (sanitised === '') { onChange(''); return; }
    const num = parseFloat(sanitised);
    if (!isNaN(num) && num < 0) { onChange('0'); return; }
    onChange(sanitised);
  }

  return (
    <div className="fc-field">
      <label htmlFor={id} className="fc-label">
        {label}
        {tooltip && <TooltipBubble text={tooltip} />}
      </label>
      <div className="fc-input-wrap">
        <input
          id={id}
          type="number"
          min={min}
          step={step}
          placeholder={placeholder}
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          // Block '-' and 'e' at the keydown level for an instant UX response
          onKeyDown={(e) => {
            if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+') {
              e.preventDefault();
            }
          }}
          className="fc-input"
        />
        <span className="fc-unit">{unit}</span>
      </div>
    </div>
  );
}

/**
 * SelectField
 * A themed <select> dropdown that matches the dark-OLED input style.
 * Used for fixed-option fields like "Days per Month".
 */
function SelectField({
  id,
  label,
  options,
  value,
  onChange,
  tooltip,
  disabled = false,
}: {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  tooltip?: string;
  disabled?: boolean;
}) {
  return (
    <div className="fc-field">
      <label htmlFor={id} className={`fc-label${disabled ? ' fc-label--locked' : ''}`}>
        {label}
        {tooltip && <TooltipBubble text={tooltip} />}
        {disabled && <span className="fc-label-lock" aria-label="auto-synced">🔒</span>}
      </label>
      {/* Wrapper gives us the custom chevron icon */}
      <div className={`fc-select-wrap${disabled ? ' fc-select-wrap--locked' : ''}`}>
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="fc-select"
          disabled={disabled}
          aria-disabled={disabled}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {/* Custom chevron — purely decorative */}
        <svg
          className="fc-select-chevron"
          aria-hidden="true"
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
        >
          <path d="M2.5 5L7 9.5L11.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/** A single result card */
function ResultCard({
  label,
  value,
  sub,
  highlight = false,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div className={`fc-result-card ${highlight ? 'fc-result-card--highlight' : ''}`}>
      <span className="fc-result-label">{label}</span>
      <span className="fc-result-value">{value}</span>
      {sub && <span className="fc-result-sub">{sub}</span>}
    </div>
  );
}

/** Intermediate stat pill shown in the breakdown row */
function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="fc-stat-pill">
      <span className="fc-stat-label">{label}</span>
      <span className="fc-stat-value">{value}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function FuelCalculator() {
  // ── Mode toggle: ICE (petrol/diesel/CNG) vs EV (electric) ──
  const [mode, setMode] = useState<FuelMode>('ICE');

  // ── Step 2: Input state (all stored as strings to allow graceful empty states) ──
  const [dailyDistance, setDailyDistance] = useState<string>(''); // km/day
  const [mileage, setMileage] = useState<string>('');              // km/l  or km/kWh
  const [fuelPrice, setFuelPrice] = useState<string>('');          // ₹/l   or ₹/kWh
  const [daysPerMonth, setDaysPerMonth] = useState<string>('30');  // default 30 days

  // ── Context inputs for the Predictive Engine ──────────────────────────────
  const [fuelType, setFuelType] = useState<FuelType>('Petrol/Diesel');
  const [drivingEnv, setDrivingEnv] = useState<DrivingEnv>('Mixed');

  // ══════════════════════════════════════════════════════════════════════════
  // DEV-TIME EDGE CASE TEST SUITE  (runs once on mount, prints to console)
  // ══════════════════════════════════════════════════════════════════════════
  useEffect(() => {

    // Helper: run the core formula (mirrors useMemo exactly)
    function runCalc(dist: number, mil: number, price: number, days: number) {
      const monthlyDistance = dist * days;
      const fuelConsumption = safeDivide(monthlyDistance, mil);
      const monthlyFuelCost = fuelConsumption * price;
      const yearlyFuelCost  = monthlyFuelCost * 12;
      const dailyCost       = safeDivide(monthlyFuelCost, days);
      const costPerKm       = safeDivide(monthlyFuelCost, monthlyDistance);
      return { monthlyDistance, fuelConsumption, monthlyFuelCost, yearlyFuelCost, dailyCost, costPerKm };
    }

    // Helper: assert numeric equality with float tolerance
    let passed = 0; let failed = 0;
    function assert(label: string, actual: number, expected: number) {
      const ok = Math.abs(actual - expected) < Number.EPSILON * 1_000_000;
      if (ok) { console.log(`  %c✅ PASS%c  ${label}`, 'color:#4ade80;font-weight:bold', 'color:#888', `→ ${actual}`); passed++; }
      else     { console.error(`  ❌ FAIL  ${label} → got ${actual}, expected ${expected}`); failed++; }
    }
    function assertStr(label: string, actual: string, expected: string) {
      if (actual === expected) { console.log(`  %c✅ PASS%c  ${label}`, 'color:#4ade80;font-weight:bold', 'color:#888', `→ "${actual}"`); passed++; }
      else                     { console.error(`  ❌ FAIL  ${label} → got "${actual}", expected "${expected}"`); failed++; }
    }

    console.groupCollapsed('%c🧪 Fuel Cost Calculator — Edge Case Test Suite', 'color:#facc15;font-weight:bold;font-size:13px');

    // TC-1: Happy path (canonical values)
    // 50 km/day × 30 days = 1500 km | 1500/15 = 100 L | 100×100 = ₹10,000 | ×12 = ₹1,20,000
    console.group('TC-1 │ Happy Path — 50 km/day, 15 km/l, ₹100/l, 30 days');
    const tc1 = runCalc(50, 15, 100, 30);
    assert('monthlyDistance',  tc1.monthlyDistance,  1500);
    assert('fuelConsumption',  tc1.fuelConsumption,  100);
    assert('monthlyFuelCost',  tc1.monthlyFuelCost,  10_000);
    assert('yearlyFuelCost',   tc1.yearlyFuelCost,   1_20_000);
    assert('dailyCost',        tc1.dailyCost,        10000 / 30);
    assert('costPerKm',        tc1.costPerKm,        10000 / 1500);
    console.groupEnd();

    // TC-2: Zero mileage — division-by-zero guard
    // safeDivide(x, 0) must return 0, never Infinity or NaN
    console.group('TC-2 │ Zero Mileage → division-by-zero guard (all = 0)');
    const tc2 = runCalc(50, 0, 100, 30);
    assert('fuelConsumption (÷0)',  tc2.fuelConsumption,  0);
    assert('monthlyFuelCost (÷0)', tc2.monthlyFuelCost,  0);
    assert('yearlyFuelCost  (÷0)', tc2.yearlyFuelCost,   0);
    assert('is finite',            Number(isFinite(tc2.monthlyFuelCost)), 1);
    assert('is not NaN',           Number(isNaN(tc2.monthlyFuelCost)),    0);
    console.groupEnd();

    // TC-3: Zero daily distance — driver parks the car all month
    console.group('TC-3 │ Zero Daily Distance → all costs = 0');
    const tc3 = runCalc(0, 15, 100, 30);
    assert('monthlyDistance',  tc3.monthlyDistance,  0);
    assert('fuelConsumption',  tc3.fuelConsumption,  0);
    assert('monthlyFuelCost',  tc3.monthlyFuelCost,  0);
    assert('yearlyFuelCost',   tc3.yearlyFuelCost,   0);
    console.groupEnd();

    // TC-4: Zero fuel price — free charging / subsidised fuel
    console.group('TC-4 │ Zero Fuel Price → all costs = 0');
    const tc4 = runCalc(50, 15, 0, 30);
    assert('monthlyFuelCost', tc4.monthlyFuelCost, 0);
    assert('yearlyFuelCost',  tc4.yearlyFuelCost,  0);
    console.groupEnd();

    // TC-5: Zero days per month — safeDivide must protect dailyCost
    console.group('TC-5 │ Zero Days Per Month → no NaN / Infinity in dailyCost');
    const tc5 = runCalc(50, 15, 100, 0);
    assert('monthlyDistance (0 days)', tc5.monthlyDistance, 0);
    assert('monthlyFuelCost (0 days)', tc5.monthlyFuelCost, 0);
    assert('dailyCost (÷0 guard)',     tc5.dailyCost,       0);
    assert('is finite',                Number(isFinite(tc5.dailyCost)), 1);
    assert('is not NaN',               Number(isNaN(tc5.dailyCost)),    0);
    console.groupEnd();

    // TC-6: Real-world floating-point mileage
    // 40 km/day × 26 days = 1040 km | 1040/22.5 = 46.222...L | ×105.50 = 4876.44...
    console.group('TC-6 │ Float Mileage — 40 km/day, 22.5 km/l, ₹105.50/l, 26 days');
    const tc6 = runCalc(40, 22.5, 105.50, 26);
    const exp6Monthly = (40 * 26 / 22.5) * 105.50;
    assert('monthlyDistance',  tc6.monthlyDistance,  1040);
    assert('monthlyFuelCost',  tc6.monthlyFuelCost,  exp6Monthly);
    assert('yearlyFuelCost',   tc6.yearlyFuelCost,   exp6Monthly * 12);
    assert('no NaN',           Number(isNaN(tc6.monthlyFuelCost)), 0);
    console.groupEnd();

    // TC-7: EV mode (km/kWh, ₹/kWh)
    // 80 km/day × 30 days = 2400 km | 2400/6.5 = 369.23 kWh | ×8 = ₹2953.84...
    console.group('TC-7 │ EV Mode — 80 km/day, 6.5 km/kWh, ₹8/kWh, 30 days');
    const tc7 = runCalc(80, 6.5, 8, 30);
    const exp7Monthly = (80 * 30 / 6.5) * 8;
    assert('monthlyDistance (EV)',  tc7.monthlyDistance,  2400);
    assert('monthlyFuelCost (EV)',  tc7.monthlyFuelCost,  exp7Monthly);
    assert('yearlyFuelCost  (EV)',  tc7.yearlyFuelCost,   exp7Monthly * 12);
    console.groupEnd();

    // TC-8: Very large values (supercar / long-haul truck)
    // 300 km/day × 30 = 9000 km | 9000/8 = 1125 L | ×200 = ₹2,25,000 | ×12 = ₹27,00,000
    console.group('TC-8 │ Very Large Values — 300 km/day, 8 km/l, ₹200/l, 30 days');
    const tc8 = runCalc(300, 8, 200, 30);
    assert('monthlyDistance',  tc8.monthlyDistance,  9000);
    assert('fuelConsumption',  tc8.fuelConsumption,  1125);
    assert('monthlyFuelCost',  tc8.monthlyFuelCost,  2_25_000);
    assert('yearlyFuelCost',   tc8.yearlyFuelCost,   27_00_000);
    console.groupEnd();

    // TC-9: formatINR — Indian comma grouping (2-2-3 pattern)
    console.group('TC-9 │ formatINR — Indian currency string formatter');
    assertStr('₹0',          formatINR(0),          '₹0');
    assertStr('₹500',        formatINR(500),         '₹500');
    assertStr('₹5,000',      formatINR(5000),        '₹5,000');
    assertStr('₹10,000',     formatINR(10000),       '₹10,000');
    assertStr('₹1,20,000',   formatINR(120000),      '₹1,20,000');
    assertStr('₹27,00,000',  formatINR(2700000),     '₹27,00,000');
    assertStr('Infinity→₹0', formatINR(Infinity),    '₹0');
    assertStr('-Inf→₹0',     formatINR(-Infinity),   '₹0');
    assertStr('NaN→₹0',      formatINR(NaN),         '₹0');
    console.groupEnd();

    // Summary
    const total = passed + failed;
    if (failed === 0) {
      console.log(`%c✅ ALL ${total} ASSERTIONS PASSED — Calculator is bulletproof.`, 'color:#4ade80;font-weight:bold;font-size:14px');
    } else {
      console.error(`❌ ${failed} / ${total} ASSERTIONS FAILED — see errors above.`);
    }
    console.groupEnd(); // close suite group

  }, []); // empty deps — runs once on mount only
  // ══════════════════════════════════════════════════════════════════════════

  // ── Step 3: Memoised calculation ──
  const results = useMemo(() => {
    // Parse strings to numbers (empty → 0)
    const dist  = parseFloat(dailyDistance) || 0;
    const mil   = parseFloat(mileage)       || 0;
    const price = parseFloat(fuelPrice)     || 0;
    const days  = parseFloat(daysPerMonth)  || 0;

    // Core formula
    const monthlyDistance    = dist * days;                               // km
    const fuelConsumption    = safeDivide(monthlyDistance, mil);          // litres or kWh
    const monthlyFuelCost    = fuelConsumption * price;                   // ₹
    const yearlyFuelCost     = monthlyFuelCost * 12;                      // ₹
    const dailyCost          = safeDivide(monthlyFuelCost, days);         // ₹/day
    const costPerKm          = safeDivide(monthlyFuelCost, monthlyDistance); // ₹/km

    return {
      monthlyDistance,
      fuelConsumption,
      monthlyFuelCost,
      yearlyFuelCost,
      dailyCost,
      costPerKm,
    };
  }, [dailyDistance, mileage, fuelPrice, daysPerMonth]);

  // ── Guard: if any core input is 0 or missing, freeze the predictive engine ──
  // This prevents the chart from showing a flat zero line or garbage data.
  const hasValidInputs = (
    (parseFloat(dailyDistance) || 0) > 0 &&
    (parseFloat(mileage)       || 0) > 0 &&
    (parseFloat(fuelPrice)     || 0) > 0
  );

  // ── Predictive Engine: 5-year dual-line projection ───────────────────────
  //
  //   standardCost  — flat arithmetic (no inflation, no degradation).
  //   predictedCost — applies traffic penalty, ML-based price regression, EV degradation.
  //
  //   Heuristic rules:
  //     Traffic penalty  → City: ×0.85 on mileage  |  Highway: ×1.10  |  Mixed: ×1.00
  //     Price Inflation  → ML Exponential Regression based on 5-year historical data
  //     EV degradation   → 2% compound per year  (battery holds less charge → more kWh used)
  //
  const projectionData = useMemo(() => {
    const baseMonthly = results.monthlyFuelCost; // ₹/month at flat rate
    const baseMileage  = parseFloat(mileage) || 0;
    const basePrice    = parseFloat(fuelPrice) || 0;
    const days         = parseFloat(daysPerMonth) || 30;
    const dist         = parseFloat(dailyDistance) || 0;

    // ── Traffic penalty — adjusts effective mileage ──
    const trafficMult = drivingEnv === 'City' ? 0.85
                      : drivingEnv === 'Highway' ? 1.10
                      : 1.00; // Mixed

    // ── ML Price Regression Model ──
    // We train the model on the historical data (Years 1 to 5)
    const historicalData = fuelType === 'EV' ? historicalEVData : historicalPetrolData;
    const model = regression.exponential(historicalData);
    
    // We want the prediction relative to the user's current input price.
    // The model's prediction for year 5 is our baseline (current time).
    const baselinePrediction = model.predict(5)[1];
    
    // QA Safeguard: Verify the ML model computed a valid, non-zero baseline.
    const isModelValid = isFinite(baselinePrediction) && baselinePrediction > 0;
    
    // QA Safeguard: Fallback inflation heuristics if regression fails
    const fallbackInflationRate = fuelType === 'EV' ? 1.03 : 1.05;

    // ── EV degradation per year (only for EV) ──
    const degradationRate = fuelType === 'EV' ? 0.98 : 1.00;

    // ── Point builder ──
    //   year can be fractional (e.g. 1/12 for 1 month, 0.5 for 6 months)
    function buildPoint(label: string, yearFraction: number) {
      // Standard: simple multiplication, no adjustments
      const standard = Math.round(baseMonthly * yearFraction * 12);

      // Predicted: apply penalty, then compound month-by-month for integer years
      //   For sub-year fractions we apply a prorated single-period adjustment.
      let predicted = 0;
      const totalMonths = Math.round(yearFraction * 12);
      const adjustedMileage = baseMileage * trafficMult;

      for (let mo = 1; mo <= totalMonths; mo++) {
        // Years elapsed at this month
        const yearsElapsed = (mo - 1) / 12; // compounding starts at year boundary
        const flooredYears = Math.floor(yearsElapsed);
        
        let infMultiplier = 1.0;
        
        if (isModelValid) {
          // Predict the price for the current future year (Year 5 + yearsElapsed)
          const futureYear = 5 + flooredYears;
          const predictedPriceForYear = model.predict(futureYear)[1];
          
          // The multiplier is the ratio of the future predicted price to the baseline (current) predicted price
          if (isFinite(predictedPriceForYear) && predictedPriceForYear > 0) {
            infMultiplier = predictedPriceForYear / baselinePrediction;
          } else {
            // QA Safeguard: Fallback if future year prediction fails
            infMultiplier = Math.pow(fallbackInflationRate, flooredYears);
          }
        } else {
          // QA Safeguard: Fallback if baseline prediction failed
          infMultiplier = Math.pow(fallbackInflationRate, flooredYears);
        }

        const degMultiplier  = Math.pow(degradationRate, flooredYears);

        // Adjusted price and mileage for this month
        const adjPrice   = basePrice * infMultiplier;
        const adjMileage = adjustedMileage * degMultiplier; // degradation lowers effective km/kWh

        const monthlyDist    = dist * days;
        const monthlyConsump = safeDivide(monthlyDist, adjMileage);
        const monthlyCost    = monthlyConsump * adjPrice;
        predicted += monthlyCost;
      }

      return { time: label, standardCost: standard, predictedCost: Math.round(predicted) };
    }

    return [
      buildPoint('1 Mo', 1 / 12),
      buildPoint('3 Mo', 3 / 12),
      buildPoint('6 Mo', 6 / 12),
      buildPoint('1 Yr', 1),
      buildPoint('2 Yr', 2),
      buildPoint('3 Yr', 3),
      buildPoint('5 Yr', 5),
    ];
  }, [results.monthlyFuelCost, fuelType, drivingEnv, mileage, fuelPrice, daysPerMonth, dailyDistance]);

  // Derived labels and contextual tooltip copy — switch with mode
  const mileageLabel    = mode === 'EV' ? 'Efficiency'       : 'Mileage';
  const mileageUnit     = mode === 'EV' ? 'km / kWh'         : 'km / l';
  // ICE label hints at multi-fuel support (Petrol, Diesel, CNG); EV gets its own label
  const fuelLabel       = mode === 'EV' ? 'Electricity Price' : 'Fuel Price (₹/L or ₹/kg)';
  const fuelUnit        = mode === 'EV' ? '₹ / kWh'          : '₹ / litre';
  const consumptionUnit = mode === 'EV' ? 'kWh'              : 'litres';

  // ── Contextual tooltip definitions (exact copy per spec) ────────────────
  const tipDailyDistance = 'Average distance covered in one day (km).';
  const tipDaysPerMonth  = 'Total number of days the vehicle is used in a typical month.';
  const tipMileage = mode === 'EV'
    ? `Distance covered per kilowatt-hour of electricity (km/kWh). Check your EV's dashboard.`
    : 'Distance covered per liter of fuel (km/l).';
  const tipFuelPrice = mode === 'EV'
    ? 'Average cost of electricity in ₹ per kWh for charging.'
    : 'Current cost of fuel in ₹ per liter.';

  return (
    <div className="fc-page">
      {/* ── Background glow ── */}
      <div className="fc-bg-glow" aria-hidden="true" />

      {/* ── Page header ── */}
      <header className="fc-header">
        <span className="fc-badge">Analysis Tools</span>
        <h1 className="fc-title">
          Fuel Cost <span className="fc-title-accent">Calculator</span>
        </h1>
        <p className="fc-subtitle">
          Estimate your real monthly and annual fuel spend — for ICE vehicles&nbsp;&amp;&nbsp;EVs.
        </p>
      </header>

      {/* ── Mode toggle ── */}
      <div className="fc-mode-toggle" role="group" aria-label="Vehicle fuel type">
        <button
          id="mode-ice"
          className={`fc-mode-btn ${mode === 'ICE' ? 'fc-mode-btn--active' : ''}`}
          onClick={() => {
            setMode('ICE');
            // Sync Fuel Type dropdown: reset to Petrol/Diesel when switching to ICE
            setFuelType('Petrol/Diesel');
          }}
        >
          <Fuel size={16} />
          Petrol / Diesel / CNG
        </button>
        <button
          id="mode-ev"
          className={`fc-mode-btn ${mode === 'EV' ? 'fc-mode-btn--active' : ''}`}
          onClick={() => {
            setMode('EV');
            // Sync Fuel Type dropdown: lock to EV when switching to EV mode
            setFuelType('EV');
          }}
        >
          <Zap size={16} />
          Electric Vehicle
        </button>
      </div>

      {/* ── Main card ── */}
      <div className="fc-card">

        {/* ── Section: Inputs ── */}
        <section className="fc-section" aria-labelledby="inputs-heading">
          <h2 id="inputs-heading" className="fc-section-title">
            <Route size={16} /> Your Usage Details
          </h2>

          <div className="fc-inputs-grid">
            {/* Daily distance — universal */}
            <InputField
              id="daily-distance"
              label="Daily Distance"
              unit="km / day"
              value={dailyDistance}
              onChange={setDailyDistance}
              min={0}
              step={1}
              placeholder="e.g. 40"
              tooltip={tipDailyDistance}
            />

            {/* Mileage (ICE) / Efficiency (EV) — dynamic */}
            <InputField
              id="mileage"
              label={mileageLabel}
              unit={mileageUnit}
              value={mileage}
              onChange={setMileage}
              min={0}
              step={0.1}
              placeholder={mode === 'EV' ? 'e.g. 6.5' : 'e.g. 18'}
              tooltip={tipMileage}
            />

            {/* Fuel Price (ICE) / Electricity Price (EV) — dynamic */}
            <InputField
              id="fuel-price"
              label={fuelLabel}
              unit={fuelUnit}
              value={fuelPrice}
              onChange={setFuelPrice}
              min={0}
              step={0.01}
              placeholder={mode === 'EV' ? 'e.g. 8' : 'e.g. 105'}
              tooltip={tipFuelPrice}
            />

            {/* Days per month — dropdown: 28 / 29 / 30 / 31, default 30 */}
            <SelectField
              id="days-per-month"
              label="Days per Month"
              options={[
                { value: '28', label: '28 days' },
                { value: '29', label: '29 days' },
                { value: '30', label: '30 days (default)' },
                { value: '31', label: '31 days' },
              ]}
              value={daysPerMonth}
              onChange={setDaysPerMonth}
              tooltip={tipDaysPerMonth}
            />

            {/* Fuel Type — drives inflation model.
                EV mode: locked to EV-only option.
                ICE mode: user can pick Petrol/Diesel or CNG. */}
            <SelectField
              id="fuel-type"
              label="Fuel Type"
              options={
                mode === 'EV'
                  ? [{ value: 'EV', label: 'Electric (EV)' }]
                  : [
                      { value: 'Petrol/Diesel', label: 'Petrol / Diesel' },
                      { value: 'CNG',           label: 'CNG' },
                    ]
              }
              value={fuelType}
              onChange={(v) => setFuelType(v as FuelType)}
              disabled={mode === 'EV'}
              tooltip={
                mode === 'EV'
                  ? 'Auto-synced to Electric mode. Switch the top toggle to change fuel type.'
                  : 'Used by the Predictive Engine to apply the correct annual price-inflation model.'
              }
            />

            {/* Driving Environment — drives traffic-penalty mileage adjustment */}
            <SelectField
              id="driving-env"
              label="Driving Environment"
              options={[
                { value: 'City',    label: 'City (Heavy Traffic)' },
                { value: 'Mixed',   label: 'Mixed (City + Highway)' },
                { value: 'Highway', label: 'Highway' },
              ]}
              value={drivingEnv}
              onChange={(v) => setDrivingEnv(v as DrivingEnv)}
              tooltip="City traffic applies a 15% mileage penalty. Highway gives a 10% boost. Used only in the prediction chart."
            />
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="fc-divider" aria-hidden="true" />

        {/* ── Section: Breakdown stats ── */}
        <section className="fc-section" aria-labelledby="breakdown-heading">
          <h2 id="breakdown-heading" className="fc-section-title">
            <TrendingUp size={16} /> Calculation Breakdown
          </h2>

          <div className="fc-stats-row">
            <StatPill
              label="Monthly Distance"
              value={`${results.monthlyDistance.toLocaleString('en-IN')} km`}
            />
            <StatPill
              label={`${mode === 'EV' ? 'Energy' : 'Fuel'} Consumed / Month`}
              value={`${results.fuelConsumption.toFixed(2)} ${consumptionUnit}`}
            />
            <StatPill
              label="Cost per km"
              value={results.costPerKm > 0 ? `${formatINR(results.costPerKm)} / km` : '—'}
            />
            <StatPill
              label="Cost per Day"
              value={results.dailyCost > 0 ? formatINR(results.dailyCost) : '—'}
            />
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="fc-divider" aria-hidden="true" />

        {/* ── Section: Results ── */}
        <section className="fc-section" aria-labelledby="results-heading">
          <h2 id="results-heading" className="fc-section-title">
            <IndianRupee size={16} /> Your Estimated Costs
          </h2>

          <div className="fc-results-grid">
            {/* Monthly cost — highlighted primary result */}
            <ResultCard
              label="Monthly Fuel Cost"
              value={formatINR(results.monthlyFuelCost)}
              sub="per month"
              highlight
            />

            {/* Yearly cost */}
            <ResultCard
              label="Annual Fuel Cost"
              value={formatINR(results.yearlyFuelCost)}
              sub="per year"
              highlight
            />

            {/* Calendar view: quarterly */}
            <ResultCard
              label="Quarterly Cost"
              value={formatINR(results.monthlyFuelCost * 3)}
              sub="3 months"
            />

            {/* 5-year projection */}
            <ResultCard
              label="5-Year Projection"
              value={formatINR(results.yearlyFuelCost * 5)}
              sub="5 years"
            />
          </div>
        </section>

        {/* ── Divider ── */}
        <div className="fc-divider" aria-hidden="true" />

        {/* ── Section: 5-Year Projection Chart ── */}
        <section className="fc-section fc-section--chart" aria-labelledby="chart-heading">
          <h2 id="chart-heading" className="fc-section-title">
            <TrendingUp size={16} /> Predictive Cost Projection
          </h2>

          {/* Legend — only shown when chart has real data */}
          {hasValidInputs && (
            <div className="fc-chart-legend">
              <span className="fc-legend-item fc-legend-item--standard">
                <span className="fc-legend-dot" />
                Standard (flat rates)
              </span>
              <span className="fc-legend-item fc-legend-item--predicted">
                <span className="fc-legend-dot" />
                Predicted (inflation + traffic)
              </span>
            </div>
          )}

          {/* Empty-state nudge — shown until all three core inputs are valid */}
          {!hasValidInputs ? (
            <div className="fc-chart-empty">
              <span>Enter your details above to see your 5-year cost curve.</span>
            </div>
          ) : (
            <div className="fc-chart-wrap">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart
                  data={projectionData}
                  margin={{ top: 10, right: 12, left: 0, bottom: 0 }}
                >
                  {/* ── Gradient definitions ── */}
                  <defs>
                    {/* Faded grey for standard line */}
                    <linearGradient id="fcGradStd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#94a3b8" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#94a3b8" stopOpacity={0}    />
                    </linearGradient>
                    {/* Vibrant neon for predicted line */}
                    <linearGradient id="fcGradPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor="#38bdf8" stopOpacity={0.40} />
                      <stop offset="45%"  stopColor="#6366f1" stopOpacity={0.18} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0}    />
                    </linearGradient>
                  </defs>

                  {/* Ultra-faint horizontal grid only */}
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="time"
                    tick={{ fill: 'hsl(0 0% 45%)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    dy={6}
                  />

                  <YAxis
                    tickFormatter={(v: number) => {
                      if (v === 0) return '₹0';
                      if (v >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
                      if (v >= 1000)   return `₹${(v / 1000).toFixed(0)}k`;
                      return `₹${v}`;
                    }}
                    tick={{ fill: 'hsl(0 0% 40%)', fontSize: 11, fontFamily: 'Inter, sans-serif' }}
                    axisLine={false}
                    tickLine={false}
                    width={54}
                  />

                  {/* Dual-value tooltip */}
                  <RechartsTooltip
                    cursor={{ stroke: 'rgba(255,255,255,0.07)', strokeWidth: 1 }}
                    contentStyle={{
                      background: 'hsl(0 0% 9%)',
                      border: '1px solid hsl(0 0% 18%)',
                      borderRadius: '0.55rem',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
                      padding: '0.6rem 1rem',
                      minWidth: '200px',
                    }}
                    labelStyle={{
                      color: 'hsl(0 0% 55%)',
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      marginBottom: '0.35rem',
                      display: 'block',
                    }}
                    formatter={(value: number, name: string) => [
                      formatINR(value),
                      name === 'standardCost' ? 'Standard (flat)' : 'Predicted (real-world)',
                    ]}
                    itemStyle={{ fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Space Grotesk, sans-serif', padding: '1px 0' }}
                  />

                  {/* ── Line 1: Standard (faded grey) ── */}
                  <Area
                    type="monotone"
                    dataKey="standardCost"
                    name="standardCost"
                    stroke="#64748b"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    fill="url(#fcGradStd)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#94a3b8', strokeWidth: 0 }}
                    isAnimationActive={true}
                    animationDuration={500}
                    animationEasing="ease-out"
                  />

                  {/* ── Line 2: Predicted (glowing neon) ── */}
                  <Area
                    type="monotone"
                    dataKey="predictedCost"
                    name="predictedCost"
                    stroke="#38bdf8"
                    strokeWidth={2.5}
                    fill="url(#fcGradPred)"
                    dot={{ r: 3.5, fill: '#38bdf8', strokeWidth: 0 }}
                    activeDot={{ r: 5.5, fill: '#fff', stroke: '#38bdf8', strokeWidth: 2 }}
                    isAnimationActive={true}
                    animationDuration={700}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>

              <p className="fc-chart-xlabel">Time →</p>
            </div>
          )}
        </section>

        {/* ── Disclaimer ── */}
        <p className="fc-disclaimer">
          <Info size={12} />
          Estimates are based on your inputs and assume steady daily usage. Actual costs
          vary with driving conditions, traffic, and local fuel prices. For EVs, home
          charging rates may differ from public charger rates.
        </p>
      </div>

      {/* ── Floating tip card ── */}
      <aside className="fc-tip-card">
        <Calendar size={20} className="fc-tip-icon" />
        <div>
          <p className="fc-tip-title">Pro Tip</p>
          <p className="fc-tip-body">
            For accurate city mileage, multiply ARAI figures by&nbsp;<strong>0.65–0.75</strong>.
            EVs charged at home cost roughly <strong>₹1–2 / km</strong> vs. petrol's
            &nbsp;<strong>₹4–7 / km</strong>.
          </p>
        </div>
      </aside>
    </div>
  );
}
