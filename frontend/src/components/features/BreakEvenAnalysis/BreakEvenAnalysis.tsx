import { useState, useMemo, useCallback } from 'react';
import { Zap, Fuel, Leaf, TrendingDown, IndianRupee, ChevronDown, ChevronUp, ToggleLeft, ToggleRight } from 'lucide-react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot,
} from 'recharts';
import './BreakEvenAnalysis.css';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fL(v: number): string {
  if (isNaN(v) || !isFinite(v) || v < 0) return '₹0';
  const l = v / 1e5;
  if (l >= 100) return `₹${(l / 100).toFixed(2)}Cr`;
  if (l >= 1)   return `₹${l.toFixed(2)}L`;
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

function fINR(v: number): string {
  if (isNaN(v) || !isFinite(v) || v < 0) return '₹0';
  return `₹${Math.round(v).toLocaleString('en-IN')}`;
}

// ─── EMI calc ─────────────────────────────────────────────────────────────────
function calcEMI(P: number, annualRate: number, tenureYears: number) {
  const safeRate = Math.max(0, annualRate); // Prevent negative interest
  const r = safeRate / 12 / 100;
  const n = Math.max(1, tenureYears) * 12; // Prevent 0 division
  if (r === 0 || n === 0 || isNaN(P) || P <= 0) return { emi: 0, totalInterest: 0 };
  const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalInterest = emi * n - P;
  return { emi: isNaN(emi) ? 0 : emi, totalInterest: isNaN(totalInterest) ? 0 : totalInterest };
}

// ─── Presets ──────────────────────────────────────────────────────────────────
const PRESETS = {
  city:    { label: '🏙️ City Commuter',   distance: 800,  petrolCpkm: 8.5 },
  highway: { label: '🛣️ Highway Cruiser',  distance: 2500, petrolCpkm: 6.5 },
  weekend: { label: '🌅 Weekend Driver',   distance: 400,  petrolCpkm: 7.5 },
} as const;

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function TCOTooltip({ active, payload, label, breakEvenYear }: any) {
  if (!active || !payload?.length) return null;
  const petrol = payload.find((p: any) => p.dataKey === 'petrolCost')?.value;
  const ev     = payload.find((p: any) => p.dataKey === 'evCost')?.value;
  
  if (petrol === undefined || ev === undefined || isNaN(petrol) || isNaN(ev)) return null;

  const diff   = petrol - ev;
  const isNear = breakEvenYear !== -1 && Math.abs(Number(label) - breakEvenYear) <= 1;
  return (
    <div className="tco-tooltip">
      <p className="tco-tt-year">Year {label}</p>
      <div className="tco-tt-row"><span className="tco-tt-dot" style={{ background: '#FF3B30' }} /><span>Petrol</span><strong style={{ color: '#FF3B30' }}>{fL(petrol)}</strong></div>
      <div className="tco-tt-row"><span className="tco-tt-dot" style={{ background: '#fff' }} /><span>EV</span><strong style={{ color: '#fff' }}>{fL(ev)}</strong></div>
      <div className={`tco-tt-diff ${diff >= 0 ? 'pos' : 'neg'}`}>
        {diff >= 0 ? `EV saves ${fL(diff)}` : `Petrol saves ${fL(-diff)}`}
      </div>
      {isNear && <div className="tco-tt-be">★ Near break-even</div>}
    </div>
  );
}

// ─── Toggle Switch ────────────────────────────────────────────────────────────
function Toggle({ id, label, sub, checked, onChange }: { id: string; label: string; sub: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button id={id} className={`tco-toggle ${checked ? 'tco-toggle--on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className="tco-toggle-icon">{checked ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}</span>
      <span>
        <span className="tco-toggle-label">{label}</span>
        <span className="tco-toggle-sub">{sub}</span>
      </span>
    </button>
  );
}

// ─── Slider ───────────────────────────────────────────────────────────────────
function Slider({ id, label, value, min, max, step, onChange, fmt, accent = '#FF3B30' }: {
  id: string; label: string; value: number | string; min: number; max: number; step: number;
  onChange: (v: number | string) => void; fmt: (v: number) => string; accent?: string;
}) {
  const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const pct = Math.max(0, Math.min(100, ((numValue - min) / (max - min)) * 100)) || 0;
  return (
    <div className="tco-slider-field">
      <div className="tco-slider-header">
        <label htmlFor={id}>{label}</label>
        <div className="tco-slider-input-wrap">
          <input 
            type="number" 
            value={value} 
            onChange={e => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="tco-number-input"
            style={{ color: accent, background: 'transparent', border: 'none', width: '80px', textAlign: 'right', fontWeight: 700, outline: 'none' }}
          />
        </div>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value === '' ? min : numValue}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="tco-slider"
        style={{ '--pct': `${pct}%`, '--accent': accent } as React.CSSProperties}
      />
      <div className="tco-slider-bounds"><span>{fmt(min)}</span><span>{fmt(max)}</span></div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent = '#FF3B30' }: { label: string; value: string; sub: string; accent?: string }) {
  return (
    <div className="tco-stat">
      <span className="tco-stat-label">{label}</span>
      <span className="tco-stat-value" style={{ color: accent }}>{value}</span>
      <span className="tco-stat-sub">{sub}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function BreakEvenAnalysis() {
  const [evPrice,          setEvPrice]          = useState<number | string>(1_500_000);
  const [petrolPrice,      setPetrolPrice]      = useState<number | string>(1_100_000);
  const [evCostPerKm,      setEvCostPerKm]      = useState<number | string>(1.2);
  const [petrolCostPerKm,  setPetrolCostPerKm]  = useState<number | string>(7.5);
  const [monthlyDistance,  setMonthlyDistance]  = useState<number | string>(1200);
  const [evMaintenance,    setEvMaintenance]    = useState<number | string>(6_000);
  const [petrolMaintenance,setPetrolMaintenance]= useState<number | string>(12_000);
  const [includeEMI,       setIncludeEMI]       = useState(false);
  const [loanTenure,       setLoanTenure]       = useState<number | string>(5);
  const [baseInterestRate, setBaseInterestRate] = useState<number | string>(9.5);
  const [includeResale,    setIncludeResale]    = useState(false);
  const [showControls,     setShowControls]     = useState(true);
  const [activePreset,     setActivePreset]     = useState<string | null>(null);

  const applyPreset = useCallback((type: keyof typeof PRESETS) => {
    setMonthlyDistance(PRESETS[type].distance);
    setPetrolCostPerKm(PRESETS[type].petrolCpkm);
    setActivePreset(type);
  }, []);

  // ── Core TCO Engine (Defensive Math) ─────────────────────────────────────────
  const { tcoData, breakEvenYear, greenMetrics, willNeverBreakEven } = useMemo(() => {
    // Sanitize inputs
    const pEvPrice = Math.max(0, Number(evPrice) || 0);
    const pPetrolPrice = Math.max(0, Number(petrolPrice) || 0);
    const pEvCostPerKm = Math.max(0, Number(evCostPerKm) || 0);
    const pPetrolCostPerKm = Math.max(0, Number(petrolCostPerKm) || 0);
    const pMonthlyDistance = Math.max(0, Number(monthlyDistance) || 0);
    const pEvMaint = Math.max(0, Number(evMaintenance) || 0);
    const pPetrolMaint = Math.max(0, Number(petrolMaintenance) || 0);
    const pLoanTenure = Math.max(1, Number(loanTenure) || 1); // Avoid 0 tenure division
    const pBaseRate = Number(baseInterestRate) || 0;

    const evEmi     = includeEMI ? calcEMI(pEvPrice,     Math.max(0, pBaseRate - 1.5), pLoanTenure) : { emi: 0, totalInterest: 0 };
    const petrolEmi = includeEMI ? calcEMI(pPetrolPrice, Math.max(0, pBaseRate),       pLoanTenure) : { emi: 0, totalInterest: 0 };
    const evInterestPerYr     = includeEMI ? evEmi.totalInterest     / pLoanTenure : 0;
    const petrolInterestPerYr = includeEMI ? petrolEmi.totalInterest / pLoanTenure : 0;

    const evYearlyRunning     = pEvCostPerKm     * pMonthlyDistance * 12;
    const petrolYearlyRunning = pPetrolCostPerKm * pMonthlyDistance * 12;

    const BATTERY_BUMP = 300_000;
    const BATTERY_YEAR = 8;

    let evCum     = pEvPrice;
    let petrolCum = pPetrolPrice;
    let foundBE   = -1;

    // Never break even fast-check: if EV costs more to buy AND more to run
    const willNeverBreakEven = (pEvPrice >= pPetrolPrice) && (evYearlyRunning + pEvMaint >= petrolYearlyRunning + pPetrolMaint) && (!includeEMI || evInterestPerYr >= petrolInterestPerYr);

    const data = Array.from({ length: 16 }, (_, yr) => {
      if (yr === 0) {
        let evNet     = evCum;
        let petrolNet = petrolCum;
        if (includeResale) {
          const evRes     = Math.max(pEvPrice     * Math.pow(0.88, yr), pEvPrice     * 0.10);
          const petrolRes = Math.max(pPetrolPrice * Math.pow(0.90, yr), pPetrolPrice * 0.10);
          evNet     = evCum     - evRes;
          petrolNet = petrolCum - petrolRes;
        }
        return { year: 0, evCost: Math.round(evNet), petrolCost: Math.round(petrolNet) };
      }

      evCum     += evYearlyRunning     + pEvMaint;
      petrolCum += petrolYearlyRunning + pPetrolMaint;

      if (includeEMI && yr <= pLoanTenure) {
        evCum     += evInterestPerYr;
        petrolCum += petrolInterestPerYr;
      }

      if (yr === BATTERY_YEAR) evCum += BATTERY_BUMP;

      let evNet     = evCum;
      let petrolNet = petrolCum;
      if (includeResale) {
        const evRes     = Math.max(pEvPrice     * Math.pow(0.88, yr), pEvPrice     * 0.10);
        const petrolRes = Math.max(pPetrolPrice * Math.pow(0.90, yr), pPetrolPrice * 0.10);
        evNet     = evCum     - evRes;
        petrolNet = petrolCum - petrolRes;
      }

      const point = { year: yr, evCost: Math.round(evNet), petrolCost: Math.round(petrolNet) };

      if (foundBE === -1 && evNet < petrolNet) foundBE = yr;

      return point;
    });

    // Green metrics
    const safePetrolCost = Math.max(pPetrolCostPerKm, 0.1); // Prevent division by zero
    const litersPerKm    = safePetrolCost / 7.5; 
    const litersTotal    = pMonthlyDistance * 12 * Math.max(foundBE, 1) * litersPerKm;
    const co2Saved       = litersTotal * 2.3;
    const treesEquiv     = co2Saved / 20;

    return {
      tcoData:      data,
      breakEvenYear: foundBE,
      willNeverBreakEven,
      greenMetrics: { co2Saved: Math.round(co2Saved || 0), treesEquiv: Math.round(treesEquiv || 0) },
    };
  }, [evPrice, petrolPrice, evCostPerKm, petrolCostPerKm, monthlyDistance,
      evMaintenance, petrolMaintenance, includeEMI, loanTenure, baseInterestRate, includeResale]);

  // ── Derived display values ────────────────────────────────────────────────
  const yr15     = tcoData[15];
  const monthlySavings = ((Number(petrolCostPerKm) || 0) - (Number(evCostPerKm) || 0)) * (Number(monthlyDistance) || 0);
  const upfrontDiff    = (Number(evPrice) || 0) - (Number(petrolPrice) || 0);

  const beText = willNeverBreakEven
    ? 'EV does not break even in this scenario.'
    : breakEvenYear === -1
    ? 'No break-even within 15 years'
    : breakEvenYear === 0
    ? 'EV cheaper from Day 1 🚀'
    : `Financial Break-even at Year ${breakEvenYear} 🎉`;

  return (
    <div className="tco-page">
      <div className="tco-glow tco-glow--red"   aria-hidden="true" />
      <div className="tco-glow tco-glow--white" aria-hidden="true" />

      <header className="tco-header">
        <span className="tco-badge">Predictive TCO Engine</span>
        <h1 className="tco-title">Break-even <span className="tco-title-red">Analysis</span></h1>
        <p className="tco-subtitle">
          Advanced financial modelling — EMI, depreciation, battery events &amp; carbon ROI over 15 years.
        </p>
      </header>

      <div className="tco-presets" role="group" aria-label="Scenario presets">
        {(Object.keys(PRESETS) as Array<keyof typeof PRESETS>).map(k => (
          <button key={k} id={`preset-${k}`}
            className={`tco-preset-btn ${activePreset === k ? 'tco-preset-btn--active' : ''}`}
            onClick={() => applyPreset(k)}>
            {PRESETS[k].label}
          </button>
        ))}
      </div>

      <div className="tco-grid">
        <aside className="tco-controls">
          <button className="tco-collapse-btn" onClick={() => setShowControls(v => !v)} aria-expanded={showControls}>
            <span><Fuel size={14}/> Parameters</span>
            {showControls ? <ChevronUp size={14}/> : <ChevronDown size={14}/>}
          </button>

          {showControls && (
            <div className="tco-controls-body">
              <div className="tco-section-head tco-section-head--ev"><Zap size={13}/>Electric Vehicle</div>
              <Slider id="ev-price"        label="Purchase Price"   value={evPrice}       min={500_000} max={8_000_000} step={50_000}  onChange={setEvPrice}       fmt={fL}  accent="#fff"/>
              <Slider id="ev-cpkm"         label="Running Cost/km"  value={evCostPerKm}   min={0}       max={15}        step={0.1}     onChange={setEvCostPerKm}   fmt={v => `₹${v.toFixed(2)}/km`} accent="#fff"/>
              <Slider id="ev-maint"        label="Yearly Maintenance" value={evMaintenance} min={0}      max={50_000}    step={500}     onChange={setEvMaintenance} fmt={fINR} accent="#fff"/>

              <div className="tco-divider"/>

              <div className="tco-section-head tco-section-head--petrol"><Fuel size={13}/>Petrol Vehicle</div>
              <Slider id="petrol-price"    label="Purchase Price"   value={petrolPrice}      min={300_000} max={8_000_000} step={50_000}  onChange={setPetrolPrice}       fmt={fL}  accent="#FF3B30"/>
              <Slider id="petrol-cpkm"     label="Running Cost/km"  value={petrolCostPerKm}  min={0}       max={30}        step={0.5}     onChange={setPetrolCostPerKm}   fmt={v => `₹${v.toFixed(2)}/km`} accent="#FF3B30"/>
              <Slider id="petrol-maint"    label="Yearly Maintenance" value={petrolMaintenance} min={0}     max={80_000}    step={1_000}   onChange={setPetrolMaintenance} fmt={fINR} accent="#FF3B30"/>

              <div className="tco-divider"/>

              <div className="tco-section-head tco-section-head--neutral"><TrendingDown size={13}/>Driving Habits</div>
              <Slider id="monthly-dist"    label="Monthly Distance" value={monthlyDistance}  min={0}       max={10000}     step={100}     onChange={setMonthlyDistance}   fmt={v => `${v.toLocaleString('en-IN')} km`} accent="#a78bfa"/>

              <div className="tco-divider"/>

              <div className="tco-section-head tco-section-head--neutral"><IndianRupee size={13}/>Financial Options</div>
              <Toggle id="toggle-emi"     label="Include EMI"        sub="Loan financing with green discount" checked={includeEMI}    onChange={setIncludeEMI}/>
              {includeEMI && (
                <>
                  <Slider id="loan-tenure"  label="Loan Tenure"      value={loanTenure}       min={1} max={10} step={1}   onChange={setLoanTenure}        fmt={v => `${v} yrs`}    accent="#facc15"/>
                  <Slider id="interest-rate" label="Base Interest %"  value={baseInterestRate} min={0} max={25} step={0.5} onChange={setBaseInterestRate}  fmt={v => `${v.toFixed(1)}%`} accent="#facc15"/>
                </>
              )}
              <Toggle id="toggle-resale"  label="Include Resale/Depreciation" sub="EV: 12%/yr · Petrol: 10%/yr"  checked={includeResale} onChange={setIncludeResale}/>
            </div>
          )}
        </aside>

        <div className="tco-right">
          <div className="tco-kpi-strip">
            <StatCard label="Upfront Premium" value={fL(Math.abs(upfrontDiff))} sub={upfrontDiff > 0 ? 'EV costs more' : 'EV costs less'} accent="#FF3B30"/>
            <StatCard label="Monthly Savings"  value={monthlySavings > 0 ? fINR(monthlySavings) : '—'} sub="running cost delta" accent="#fff"/>
            <StatCard label="Break-even"
              value={willNeverBreakEven ? 'Never' : breakEvenYear === -1 ? '>15yr' : breakEvenYear === 0 ? 'Day 1' : `Yr ${breakEvenYear}`}
              sub="first crossover" accent="#facc15"/>
            <StatCard label="15yr Net Saving"
              value={fL(Math.abs(yr15.petrolCost - yr15.evCost))}
              sub={yr15.petrolCost >= yr15.evCost ? 'EV wins' : 'Petrol wins'}
              accent={yr15.petrolCost >= yr15.evCost ? '#4ade80' : '#FF3B30'}/>
          </div>

          <div className={`tco-banner ${willNeverBreakEven || breakEvenYear === -1 ? 'tco-banner--warn' : 'tco-banner--ok'}`} role="status" aria-live="polite">
            {beText}
          </div>

          <div className="tco-chart-wrap">
            <ResponsiveContainer width="100%" height={380}>
              <ComposedChart data={tcoData} margin={{ top: 24, right: 24, left: 16, bottom: 8 }}>
                <defs>
                  <linearGradient id="colorPetrol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#FF3B30" stopOpacity={0.35}/>
                    <stop offset="100%" stopColor="#FF3B30" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEV" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#FFFFFF" stopOpacity={0.2}/>
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0}/>
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="0" stroke="#1c1c1c" vertical={false}/>
                <XAxis dataKey="year" tickFormatter={v => `Y${v}`} tick={{ fill: '#555', fontSize: 11 }} axisLine={{ stroke: '#333' }} tickLine={false}/>
                <YAxis tickFormatter={v => fL(v)} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={68}/>
                <Tooltip content={<TCOTooltip breakEvenYear={breakEvenYear}/>}/>

                <ReferenceLine x={8} stroke="#facc15" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: '⚡ Battery', fill: '#facc15', fontSize: 10, position: 'insideTopRight' }}/>
                {!willNeverBreakEven && breakEvenYear > 0 && breakEvenYear <= 15 && (
                  <ReferenceLine x={breakEvenYear} stroke="#4ade80" strokeDasharray="4 3" strokeWidth={1.5} label={{ value: `★ BE`, fill: '#4ade80', fontSize: 10, position: 'insideTopLeft' }}/>
                )}

                <Area type="monotone" dataKey="petrolCost" name="Petrol" stroke="#FF3B30" strokeWidth={3} fill="url(#colorPetrol)" dot={false} activeDot={{ r: 5, fill: '#FF3B30', stroke: '#000', strokeWidth: 2 }}/>
                <Area type="monotone" dataKey="evCost" name="EV" stroke="#FFFFFF" strokeWidth={3} fill="url(#colorEV)" dot={false} activeDot={{ r: 5, fill: '#fff', stroke: '#000', strokeWidth: 2 }}/>
              </ComposedChart>
            </ResponsiveContainer>

            <div className="tco-chart-legend">
              <span className="tco-cl-item"><span className="tco-cl-line" style={{ background: '#FF3B30' }}/> Petrol (ICE)</span>
              <span className="tco-cl-item"><span className="tco-cl-line" style={{ background: '#fff' }}/> EV (Electric)</span>
              <span className="tco-cl-item"><span className="tco-cl-dot" style={{ background: '#facc15' }}/> Battery Bump (Yr 8)</span>
              {!willNeverBreakEven && breakEvenYear > 0 && <span className="tco-cl-item"><span className="tco-cl-dot" style={{ background: '#4ade80' }}/> Break-even</span>}
            </div>
          </div>

          <div className="tco-green-card">
            <div className="tco-green-icon"><Leaf size={28}/></div>
            <div className="tco-green-body">
              <p className="tco-green-headline">{beText}</p>
              {!willNeverBreakEven && breakEvenYear > 0 && (
                <>
                  <p className="tco-green-stat">
                    Equivalent to planting&nbsp;<strong>{greenMetrics.treesEquiv.toLocaleString('en-IN')} trees</strong>
                  </p>
                  <p className="tco-green-sub">
                    CO₂ offset: ~{greenMetrics.co2Saved.toLocaleString('en-IN')} kg saved by break-even year
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="tco-table-wrap">
            <table className="tco-table">
              <thead><tr><th>Year</th><th style={{ color: '#fff' }}>EV TCO</th><th style={{ color: '#FF3B30' }}>Petrol TCO</th><th>Net Δ</th></tr></thead>
              <tbody>
                {tcoData.map(row => {
                  const diff = row.petrolCost - row.evCost;
                  const isBE = row.year === breakEvenYear && !willNeverBreakEven;
                  const isBump = row.year === 8;
                  return (
                    <tr key={row.year} className={`tco-tr ${isBE ? 'tco-tr--be' : ''} ${isBump ? 'tco-tr--bump' : ''}`}>
                      <td>
                        {row.year === 0 ? 'Day 0' : `Year ${row.year}`}
                        {isBE && <span className="tco-badge-sm tco-badge-sm--be">★ BE</span>}
                        {isBump && <span className="tco-badge-sm tco-badge-sm--bump">⚡ Batt.</span>}
                      </td>
                      <td style={{ color: '#ccc' }}>{fL(row.evCost)}</td>
                      <td style={{ color: '#FF3B30' }}>{fL(row.petrolCost)}</td>
                      <td className={diff >= 0 ? 'tco-pos' : 'tco-neg'}>
                        {diff >= 0 ? `+${fL(diff)}` : `-${fL(-diff)}`}
                        <span className="tco-diff-lbl">{diff >= 0 ? ' EV↓' : ' Pet↓'}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
