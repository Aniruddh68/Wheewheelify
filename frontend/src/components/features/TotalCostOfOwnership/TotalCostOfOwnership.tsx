import { useState, useMemo, useEffect } from 'react';
import { Car, Fuel, Zap, Settings, ShieldAlert, Info, TrendingUp } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, PieChart, Pie, Cell
} from 'recharts';
import './TotalCostOfOwnership.css';

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

// ─── Slider Component ─────────────────────────────────────────────────────────
function Slider({ id, label, value, min, max, step, onChange, fmt, accent = '#FF3B30' }: any) {
  const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
  const pct = Math.max(0, Math.min(100, ((numValue - min) / (max - min)) * 100)) || 0;
  return (
    <div className="vtco-field">
      <div className="vtco-label">
        <label htmlFor={id}>{label}</label>
        <div className="vtco-slider-input-wrap">
          <input 
            type="number" 
            value={value} 
            onChange={e => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="vtco-num-input"
            style={{ color: accent }}
          />
        </div>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value === '' ? min : numValue}
        onChange={e => onChange(parseFloat(e.target.value))}
        className="vtco-slider"
        style={{ '--pct': `${pct}%`, '--accent': accent } as React.CSSProperties}
      />
      <div className="vtco-bounds"><span>{fmt(min)}</span><span>{fmt(max)}</span></div>
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function TCOTooltip({ active, payload, label, isNCR, fuelType }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  
  const isBanned = fuelType === 'Diesel' && isNCR && Number(label) >= 10;

  return (
    <div className="vtco-tooltip">
      <p className="vtco-tt-year">End of Year {label}</p>
      
      <div className="vtco-tt-row">
        <span>Cumulative Fuel</span>
        <strong>{fL(data.running)}</strong>
      </div>
      <div className="vtco-tt-row">
        <span>Cumulative Maint.</span>
        <strong>{fL(data.maint)}</strong>
      </div>
      <div className="vtco-tt-row">
        <span>Cumulative Ins.</span>
        <strong>{fL(data.ins)}</strong>
      </div>
      <div className="vtco-tt-row" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #222' }}>
        <span>Asset Value (Resale)</span>
        <strong style={{ color: isBanned ? '#FF3B30' : '#4ade80' }}>
          {isBanned ? '₹0 (Banned)' : fL(data.salvage)}
        </strong>
      </div>

      <div className="vtco-tt-total">
        <span>Net TCO</span>
        <span>{fL(data.netTco)}</span>
      </div>
      
      {isBanned && (
        <div className="vtco-ncr-warn">
          <ShieldAlert size={12} style={{ display: 'inline', marginRight: 4 }}/>
          NCR Diesel Ban Active
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function TotalCostOfOwnership() {
  const [purchasePrice, setPurchasePrice] = useState<number | string>(1_500_000);
  const [fuelType, setFuelType] = useState('Petrol');
  const [monthlyRunning, setMonthlyRunning] = useState<number | string>(1200);
  const [fuelCostPerUnit, setFuelCostPerUnit] = useState<number | string>(100);
  const [efficiency, setEfficiency] = useState<number | string>(15);
  const [isNCR, setIsNCR] = useState(false);
  const [viewMode, setViewMode] = useState<'chart'|'table'>('chart');

  // Step 1: Auto-Reset State on Fuel Type Change (Fix State Bleed)
  useEffect(() => {
    if (fuelType === 'EV') {
      setFuelCostPerUnit(8);
      setEfficiency(7);
    } else if (fuelType === 'Diesel') {
      setFuelCostPerUnit(90);
      setEfficiency(15);
    } else if (fuelType === 'Petrol') {
      setFuelCostPerUnit(100);
      setEfficiency(16);
    } else if (fuelType === 'CNG') {
      setFuelCostPerUnit(75);
      setEfficiency(20);
    }
  }, [fuelType]);

  // ── Core TCO Engine ─────────────────────────────────────────────────────────
  const { tcoData, totals } = useMemo(() => {
    const pPrice = Math.max(0, Number(purchasePrice) || 0);
    const pRunning = Math.max(0, Number(monthlyRunning) || 0);
    const pFuelCost = Math.max(0, Number(fuelCostPerUnit) || 0);
    const safeEfficiency = Number(efficiency) > 0 ? Number(efficiency) : 1; // Division by Zero fallback

    let cumRunning = 0;
    let cumMaint = 0;
    let cumIns = 0;

    let currentMaint = 12000;
    if (fuelType === 'EV') currentMaint = 8000;
    else if (fuelType === 'Diesel') currentMaint = 15000;
    else if (fuelType === 'CNG') currentMaint = 10000;
    else if (fuelType === 'Petrol') currentMaint = 12000;

    let currentIns = pPrice * 0.03;
    let currentFuelPrice = pFuelCost;

    const data = Array.from({ length: 16 }, (_, yr) => {
      if (yr === 0) {
        return { 
          year: 0, netTco: 0, salvage: pPrice, 
          running: 0, maint: 0, ins: 0, cumTotal: pPrice,
          annualFuel: 0, annualMaintenance: 0, annualInsurance: 0, isSpike: false, purchasePrice: pPrice
        };
      }

      // 1. Running Cost (Fuel) - 4% YoY Inflation
      const fuelThisYear = ((pRunning * 12) / safeEfficiency) * currentFuelPrice;
      cumRunning += fuelThisYear;
      currentFuelPrice *= 1.04;

      // 2. Maintenance - 5% YoY Inflation
      let maintThisYear = currentMaint;
      let isSpike = false;
      // The EV Battery & Overhaul Spike Trap: Add to this year only, do NOT inflate it into next year's base.
      if (fuelType === 'EV' && yr === 8) { maintThisYear += 300_000; isSpike = true; } 
      if (fuelType !== 'EV' && yr === 7) { maintThisYear += 50_000; isSpike = true; }  
      cumMaint += maintThisYear;
      currentMaint *= 1.05;

      // 3. Insurance - drops 10% YoY
      const insThisYear = currentIns;
      cumIns += currentIns;
      currentIns *= 0.90;

      // 4. Salvage Value (Depreciation)
      let calculatedDepreciation = 0;
      if (fuelType === 'Petrol' || fuelType === 'CNG') {
        calculatedDepreciation = pPrice * Math.pow(0.88, yr); // 12% dep
      } else if (fuelType === 'EV') {
        calculatedDepreciation = pPrice * Math.pow(0.85, yr); // 15% dep
      } else if (fuelType === 'Diesel') {
        calculatedDepreciation = pPrice * Math.pow(0.86, yr); // 14% dep
      }
      
      // The 5% Scrap Floor Trap
      let salvage = Math.max(calculatedDepreciation, pPrice * 0.05);

      // The NCR Diesel Cliff Trap
      if (fuelType === 'Diesel' && isNCR && yr >= 10) {
        salvage = 0; 
      }

      const cumTotal = pPrice + cumRunning + cumMaint + cumIns;
      const netTco = cumTotal - salvage;

      return {
        year: yr,
        netTco: Math.round(netTco),
        salvage: Math.round(salvage),
        running: Math.round(cumRunning),
        maint: Math.round(cumMaint + cumIns),
        annualFuel: Math.round(fuelThisYear || 0),
        annualMaintenance: Math.round(maintThisYear || 0),
        annualInsurance: Math.round(insThisYear || 0),
        isSpike,
        purchasePrice: pPrice,
        cumTotal: Math.round(cumTotal)
      };
    });

    return { 
      tcoData: data, 
      totals: data[15] 
    };
  }, [purchasePrice, fuelType, monthlyRunning, fuelCostPerUnit, efficiency, isNCR]);

  // Derived UI states
  const accentColor = fuelType === 'EV' ? '#fff' : '#FF3B30';
  const y15 = totals;

  const fuelPct = ((y15.running / y15.cumTotal) * 100).toFixed(1);
  const maintPct = ((y15.maint / y15.cumTotal) * 100).toFixed(1);

  const fuelLabel = fuelType === 'EV' ? "Charging" : "Fuel";

  const pieData = [
    { name: 'Purchase', value: y15.purchasePrice, color: '#8B0000' },
    { name: fuelLabel, value: y15.running, color: '#FF3B30' },
    { name: 'Maint & Ins', value: y15.maint, color: '#f97316' }
  ];

  return (
    <div className="vtco-page">
      <div className="vtco-glow vtco-glow--red" aria-hidden="true" />
      <div className="vtco-glow vtco-glow--white" aria-hidden="true" />

      <header className="vtco-header">
        <span className="vtco-badge">15-Year Financial Model</span>
        <h1 className="vtco-title">Total Cost of <span className="vtco-title-red">Ownership</span></h1>
        <p className="vtco-subtitle">
          Real-world modelling including depreciation, inflation, major repairs, and regional policies.
        </p>
      </header>

      <div className="vtco-grid">
        
        {/* ── LEFT: Controls ── */}
        <aside className="vtco-controls">
          <div className="vtco-section-head"><Car size={14}/> Vehicle Profile</div>
          
          <div className="vtco-field">
            <div className="vtco-label"><label>Fuel Type</label></div>
            <div className="vtco-select-wrap">
              <select className="vtco-select" value={fuelType} onChange={e => setFuelType(e.target.value)}>
                <option value="Petrol">Petrol</option>
                <option value="Diesel">Diesel</option>
                <option value="CNG">CNG</option>
                <option value="EV">Electric (EV)</option>
              </select>
            </div>
          </div>

          <Slider id="vtco-price" label="Purchase Price" value={purchasePrice} min={3_00_000} max={1_00_00_000} step={50_000} onChange={setPurchasePrice} fmt={fL} accent={accentColor}/>
          
          <div className="vtco-divider"/>
          <div className="vtco-section-head"><Fuel size={14}/> Usage & Efficiency</div>

          <Slider id="vtco-dist" label="Monthly Distance" value={monthlyRunning} min={0} max={5000} step={100} onChange={setMonthlyRunning} fmt={v => `${v} km`} accent={accentColor}/>
          <Slider id="vtco-fuel" label={`Cost per ${fuelType === 'CNG' ? 'kg' : fuelType === 'EV' ? 'kWh' : 'Liter'}`} value={fuelCostPerUnit} min={0} max={150} step={1} onChange={setFuelCostPerUnit} fmt={fINR} accent={accentColor}/>
          <Slider id="vtco-eff" label={`Efficiency (${fuelType === 'CNG' ? 'km/kg' : fuelType === 'EV' ? 'km/kWh' : 'kmpl'})`} value={efficiency} min={1} max={50} step={0.5} onChange={setEfficiency} fmt={v => v.toFixed(1)} accent={accentColor}/>

          {fuelType === 'Diesel' && (
            <>
              <div className="vtco-divider"/>
              <div className="vtco-section-head" style={{ color: '#facc15' }}><ShieldAlert size={14}/> Policy Constraints</div>
              <button className={`vtco-toggle ${isNCR ? 'vtco-toggle--on' : ''}`} onClick={() => setIsNCR(!isNCR)}>
                <span className="vtco-toggle-icon">{isNCR ? <ToggleRight size={20} color="#FF3B30"/> : <ToggleLeft size={20}/>}</span>
                <span>
                  <span className="vtco-toggle-label" style={{ color: isNCR ? '#FF3B30' : '#888' }}>NCR Registration</span>
                  <span className="vtco-toggle-sub">Subject to 10-year Diesel Ban rule. Asset value drops to ₹0 at Year 10.</span>
                </span>
              </button>
            </>
          )}

          <div className="vtco-insight">
            <div className="vtco-insight-title"><Zap size={14} /> AI Insight</div>
            <div className="vtco-insight-text">
              Based on your usage of <strong>{monthlyRunning} km/month</strong>, fuel makes up <strong>{fuelPct}%</strong> of your total 15-year out-of-pocket expenses. 
              {Number(fuelPct) > 50 && " Consider switching to an EV or CNG to heavily reduce this burden."}
              {Number(maintPct) > 30 && " High maintenance costs indicate this vehicle may be expensive to keep running long-term."}
            </div>
          </div>

          <div className="vtco-donut-wrap">
            <div className="vtco-section-head" style={{ marginBottom: '8px' }}>15-Year Cost Breakdown</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="vtco-tooltip" style={{ minWidth: 'auto', padding: '8px 12px' }}>
                      <span style={{ color: payload[0].payload.color, fontWeight: 'bold' }}>{payload[0].name}</span><br/>
                      {fL(payload[0].value)}
                    </div>
                  );
                }}/>
              </PieChart>
            </ResponsiveContainer>
            <div className="vtco-chart-legend" style={{ paddingTop: 0, gap: '16px' }}>
              {pieData.map(d => (
                <span key={d.name} className="vtco-cl-item" style={{ fontSize: '0.7rem' }}>
                  <span className="vtco-cl-line" style={{ background: d.color, width: '12px' }}/> {d.name}
                </span>
              ))}
            </div>
          </div>

        </aside>

        {/* ── RIGHT: Chart & Output ── */}
        <div className="vtco-right">
          
          {/* KPI Strip */}
          <div className="vtco-kpi-strip">
            <div className="vtco-stat">
              <span className="vtco-stat-label">15Yr {fuelLabel} Spend</span>
              <span className="vtco-stat-value" style={{ color: '#CCC' }}>{fL(y15.running)}</span>
              <span className="vtco-stat-sub">@ 4% inflation/yr</span>
            </div>
            <div className="vtco-stat">
              <span className="vtco-stat-label">15Yr Maintenance</span>
              <span className="vtco-stat-value" style={{ color: '#CCC' }}>{fL(y15.maint)}</span>
              <span className="vtco-stat-sub">inc. major repairs</span>
            </div>
            <div className="vtco-stat">
              <span className="vtco-stat-label">Scrap/Resale</span>
              <span className="vtco-stat-value" style={{ color: '#4ade80' }}>{fL(y15.salvage)}</span>
              <span className="vtco-stat-sub">Asset value at Yr 15</span>
            </div>
            <div className="vtco-stat">
              <span className="vtco-stat-label">Final 15Yr TCO</span>
              <span className="vtco-stat-value" style={{ color: accentColor }}>{fL(y15.netTco)}</span>
              <span className="vtco-stat-sub">Net Out of Pocket</span>
            </div>
          </div>

          {/* View Toggle */}
          <div className="vtco-view-toggle">
            <button className={`vtco-vt-btn ${viewMode === 'chart' ? 'vtco-vt-btn--active' : ''}`} onClick={() => setViewMode('chart')}>📈 Visual Chart</button>
            <button className={`vtco-vt-btn ${viewMode === 'table' ? 'vtco-vt-btn--active' : ''}`} onClick={() => setViewMode('table')}>📊 Detailed Table</button>
          </div>

          {viewMode === 'chart' ? (
            <div className="vtco-chart-wrap">
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={tcoData} margin={{ top: 24, right: 24, left: 16, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="0" stroke="#1A1A1A" vertical={false}/>
                  <XAxis dataKey="year" tickFormatter={v => `Y${v}`} tick={{ fill: '#555', fontSize: 11 }} axisLine={{ stroke: '#333' }} tickLine={false}/>
                  <YAxis tickFormatter={v => fL(v)} tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} width={68}/>
                  <Tooltip content={<TCOTooltip isNCR={isNCR} fuelType={fuelType}/>}/>

                  {fuelType === 'EV' && (
                    <ReferenceLine x={8} stroke="#facc15" strokeDasharray="4 3" label={{ value: '⚡ Battery', fill: '#facc15', fontSize: 10, position: 'insideTopLeft' }}/>
                  )}
                  {fuelType !== 'EV' && (
                    <ReferenceLine x={7} stroke="#a78bfa" strokeDasharray="4 3" label={{ value: '🔧 Overhaul', fill: '#a78bfa', fontSize: 10, position: 'insideTopLeft' }}/>
                  )}
                  {fuelType === 'Diesel' && isNCR && (
                    <ReferenceLine x={10} stroke="#FF3B30" strokeDasharray="4 3" label={{ value: '⛔ NCR Ban', fill: '#FF3B30', fontSize: 10, position: 'insideTopLeft' }}/>
                  )}

                  <Area type="monotone" dataKey="purchasePrice" stackId="1" name="Purchase" stroke="none" fill="#8B0000" />
                  <Area type="monotone" dataKey="running" stackId="1" name={fuelLabel} stroke="none" fill="#FF3B30" />
                  <Area type="monotone" dataKey="maint" stackId="1" name="Maintenance & Ins" stroke="none" fill="#f97316" />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="vtco-chart-legend">
                <span className="vtco-cl-item"><span className="vtco-cl-line" style={{ background: '#8B0000' }}/> Purchase</span>
                <span className="vtco-cl-item"><span className="vtco-cl-line" style={{ background: '#FF3B30' }}/> {fuelLabel}</span>
                <span className="vtco-cl-item"><span className="vtco-cl-line" style={{ background: '#f97316' }}/> Maintenance</span>
                <span className="vtco-cl-item"><span className="vtco-cl-line" style={{ background: '#333' }}/> Yr {fuelType === 'EV' ? '8 Battery' : '7 Overhaul'}</span>
                {fuelType === 'Diesel' && isNCR && <span className="vtco-cl-item" style={{ color: '#FF3B30' }}>⛔ NCR Ban Drop</span>}
              </div>
            </div>
          ) : (
            <div className="vtco-table-wrap">
              <table className="vtco-table">
                <thead>
                  <tr>
                    <th style={{textAlign: 'left'}}>Year</th>
                    <th>{fuelLabel} Spend</th>
                    <th>Maint & Repairs</th>
                    <th>Insurance</th>
                    <th>Asset Value (Resale)</th>
                    <th>Net TCO</th>
                  </tr>
                </thead>
                <tbody>
                  {tcoData.map(row => {
                    const isNCRBan = fuelType === 'Diesel' && isNCR && row.year >= 10;
                    return (
                      <tr key={row.year}>
                        <td style={{textAlign: 'left', fontWeight: 'bold', color: '#FFF'}}>
                          {row.year === 0 ? 'Day 0' : `Year ${row.year}`}
                        </td>
                        <td>{row.annualFuel > 0 ? fINR(row.annualFuel) : '—'}</td>
                        <td className={row.isSpike ? 'vtco-cell-highlight' : ''}>
                          {row.annualMaintenance > 0 ? fINR(row.annualMaintenance) : '—'}
                        </td>
                        <td>{row.annualInsurance > 0 ? fINR(row.annualInsurance) : '—'}</td>
                        <td className={isNCRBan ? 'vtco-cell-danger' : ''}>
                          {isNCRBan ? '₹0 (Banned)' : fINR(row.salvage)}
                        </td>
                        <td style={{color: accentColor, fontWeight: 'bold'}}>{fINR(row.netTco)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
