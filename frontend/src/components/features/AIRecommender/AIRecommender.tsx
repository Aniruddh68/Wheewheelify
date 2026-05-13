import { useState, useMemo, useEffect, useRef } from 'react';
import { Brain, Zap, MapPin, TrendingUp, Star, ChevronDown } from 'lucide-react';
import './AIRecommender.css';

// ─── Types ─────────────────────────────────────────────────────────────────────

type UsageType = 'City' | 'Mixed' | 'Highway';
type PriorityType = 'running_cost' | 'resale' | 'eco';
type FuelCategory = 'EV' | 'CNG' | 'Petrol' | 'Diesel';

interface Vehicle {
  id: string;
  name: string;
  tagline: string;
  fuelCategory: FuelCategory;
  image: string;
  priceLabel: string;
  // ML Attributes (scored 1–10)
  eco: number;
  city: number;
  highway: number;
  resale: number;
  upfrontCost: 'Low' | 'Medium' | 'High';    // used for display
  runningCost: 'Very Low' | 'Low' | 'Medium' | 'High'; // determines running score
  runningScore: number; // 1–10, derived (10 = very low cost)
}

interface ScoredVehicle extends Vehicle {
  matchScore: number;       // 0–100 after normalisation
  rawScore: number;
  insightTag: string;
}

// ─── Mock AI Knowledge Base ────────────────────────────────────────────────────

const VEHICLE_DATABASE: Vehicle[] = [
  {
    id: 'nexon-ev',
    name: 'Tata Nexon EV',
    tagline: 'Zero emission city warrior',
    fuelCategory: 'EV',
    image: '⚡',
    priceLabel: '₹14.5 – 19.5 L',
    eco: 10,
    city: 9,
    highway: 5,
    resale: 4,
    upfrontCost: 'High',
    runningCost: 'Very Low',
    runningScore: 10,
  },
  {
    id: 'creta-petrol',
    name: 'Hyundai Creta Petrol',
    tagline: 'The resale value champion',
    fuelCategory: 'Petrol',
    image: '🚗',
    priceLabel: '₹11 – 20 L',
    eco: 4,
    city: 7,
    highway: 8,
    resale: 9,
    upfrontCost: 'Medium',
    runningCost: 'High',
    runningScore: 3,
  },
  {
    id: 'thar-diesel',
    name: 'Mahindra Thar Diesel',
    tagline: 'Highway beast, off-road king',
    fuelCategory: 'Diesel',
    image: '🛻',
    priceLabel: '₹13 – 17 L',
    eco: 2,
    city: 4,
    highway: 9,
    resale: 8,
    upfrontCost: 'High',
    runningCost: 'Medium',
    runningScore: 5,
  },
  {
    id: 'ertiga-cng',
    name: 'Maruti Ertiga CNG',
    tagline: 'Low-cost family hauler',
    fuelCategory: 'CNG',
    image: '🚐',
    priceLabel: '₹9 – 13.5 L',
    eco: 7,
    city: 8,
    highway: 6,
    resale: 8,
    upfrontCost: 'Medium',
    runningCost: 'Low',
    runningScore: 8,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generates a human-readable AI insight string for a recommended vehicle,
 * driven by the user's top priority and primary usage pattern.
 */
function generateInsight(
  v: Vehicle,
  usage: UsageType,
  priority: PriorityType,
  monthlyKm: number
): string {
  // Priority-first insight
  if (priority === 'eco' && v.fuelCategory === 'EV') {
    return `Zero tailpipe emissions — the cleanest option on any road.`;
  }
  if (priority === 'eco' && v.fuelCategory === 'CNG') {
    return `CNG emits ~25% less CO₂ than petrol — a solid green choice.`;
  }
  if (priority === 'resale' && v.resale >= 8) {
    return `High resale demand keeps its value intact over the years.`;
  }
  if (priority === 'running_cost' && v.runningScore >= 8) {
    if (monthlyKm > 1500) {
      return `At ${monthlyKm.toLocaleString('en-IN')} km/month, the low running cost saves you the most money.`;
    }
    return `Extremely low per-km costs make every trip cheaper.`;
  }

  // Usage-first fallback
  if (usage === 'City' && v.city >= 8) {
    return `Optimised for stop-and-go city traffic — regenerative braking pays dividends.`;
  }
  if (usage === 'Highway' && v.highway >= 8) {
    return `Thrives on open highways with consistent high-speed efficiency.`;
  }
  if (usage === 'Mixed' && v.eco >= 7) {
    return `Balanced for mixed routes while keeping running costs low.`;
  }

  // Generic fallback
  return `A well-rounded match for your usage profile and budget priorities.`;
}

// ─── Animated Circular Progress ────────────────────────────────────────────────

function CircularProgress({ score, rank }: { score: number; rank: number }) {
  const ref = useRef<SVGCircleElement>(null);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (!ref.current) return;
    const offset = circumference - (score / 100) * circumference;
    ref.current.style.strokeDashoffset = String(circumference);
    // Animate after a brief delay so the fade-in plays first
    const t = setTimeout(() => {
      if (ref.current) {
        ref.current.style.transition = 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)';
        ref.current.style.strokeDashoffset = String(offset);
      }
    }, 300 + rank * 150);
    return () => clearTimeout(t);
  }, [score, circumference, rank]);

  const colorMap = ['hsl(0,100%,55%)', 'hsl(0,0%,80%)', 'hsl(35,90%,55%)'];
  const color = colorMap[rank] ?? 'hsl(0,100%,55%)';

  return (
    <div className="air-circle-wrap" aria-label={`${score}% match`}>
      <svg className="air-circle-svg" viewBox="0 0 100 100" aria-hidden="true">
        {/* Track */}
        <circle cx="50" cy="50" r={radius} className="air-circle-track" />
        {/* Progress arc */}
        <circle
          ref={ref}
          cx="50"
          cy="50"
          r={radius}
          className="air-circle-progress"
          style={{
            stroke: color,
            strokeDasharray: circumference,
            strokeDashoffset: circumference,
            filter: `drop-shadow(0 0 8px ${color}66)`,
          }}
        />
      </svg>
      <div className="air-circle-label">
        <span className="air-circle-pct" style={{ color }}>
          {score}
          <span className="air-circle-sym">%</span>
        </span>
        <span className="air-circle-sub">Match</span>
      </div>
    </div>
  );
}

// ─── Rank badge colours ───────────────────────────────────────────────────────

const RANK_META = [
  { label: '#1 Pick', accentClass: 'air-card--red',   rankClass: 'air-rank--red'   },
  { label: '#2 Pick', accentClass: 'air-card--white',  rankClass: 'air-rank--white' },
  { label: '#3 Pick', accentClass: 'air-card--gold',   rankClass: 'air-rank--gold'  },
];

// ─── Result Card ───────────────────────────────────────────────────────────────

function ResultCard({ vehicle, rank, visible }: { vehicle: ScoredVehicle; rank: number; visible: boolean }) {
  const meta = RANK_META[rank];

  return (
    <article
      className={`air-card ${meta.accentClass} ${visible ? 'air-card--visible' : ''}`}
      style={{ animationDelay: `${rank * 0.15}s` }}
    >
      {/* Top bar: rank badge + circle progress (floated right) */}
      <div className="air-card-topbar">
        <div className={`air-rank ${meta.rankClass}`}>{meta.label}</div>
        <CircularProgress score={vehicle.matchScore} rank={rank} />
      </div>

      {/* Emoji + Name + Tagline — full width, no truncation */}
      <div className="air-card-identity">
        <span className="air-card-emoji" role="img" aria-hidden="true">
          {vehicle.image}
        </span>
        <h3 className="air-card-name">{vehicle.name}</h3>
        <p className="air-card-tagline">{vehicle.tagline}</p>
      </div>

      {/* Attribute pills */}
      <div className="air-attrs">
        <span className="air-attr-pill">
          <Zap size={11} />
          {vehicle.fuelCategory}
        </span>
        <span className="air-attr-pill">
          <MapPin size={11} />
          City {vehicle.city}/10
        </span>
        <span className="air-attr-pill">
          <TrendingUp size={11} />
          Resale {vehicle.resale}/10
        </span>
        <span className="air-attr-pill air-attr-pill--price">
          {vehicle.priceLabel}
        </span>
      </div>

      {/* AI Insight tag */}
      <div className="air-insight">
        <Brain size={13} className="air-insight-icon" />
        <span className="air-insight-text">{vehicle.insightTag}</span>
      </div>
    </article>
  );
}

// ─── Processing Animation ──────────────────────────────────────────────────────

function ProcessingOverlay({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="air-processing" aria-live="polite" aria-label="Analysing your profile…">
      <div className="air-processing-dots">
        <span /><span /><span />
      </div>
      <p className="air-processing-label">AI Processing…</p>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function AIRecommender() {
  // ── Inputs
  const [monthlyKm, setMonthlyKm] = useState<number>(1000);
  const [usage, setUsage] = useState<UsageType>('City');
  const [priority, setPriority] = useState<PriorityType>('running_cost');

  // ── UI state
  const [processing, setProcessing] = useState(false);
  const [resultsVisible, setResultsVisible] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // ─── Weighted Scoring Engine (useMemo) ───────────────────────────────────
  const recommendations = useMemo<ScoredVehicle[]>(() => {
    const scored = VEHICLE_DATABASE.map((v) => {
      let score = 0;

      // --- Distance Logic ---
      // Heavy petrol penalty above 1500 km/month; EV/CNG boost
      const distanceMult = monthlyKm > 1500 ? 1.5 : 1.0;
      const petrolPenalty = monthlyKm > 1500 && (v.fuelCategory === 'Petrol' || v.fuelCategory === 'Diesel') ? -2 : 0;
      const cleanFuelBoost = monthlyKm > 1500 && (v.fuelCategory === 'EV' || v.fuelCategory === 'CNG') ? 2 : 0;

      // --- Usage Logic ---
      let usageScore = 0;
      if (usage === 'City') {
        usageScore = v.city;
        if (v.fuelCategory === 'Diesel') usageScore -= 2; // diesel penalty in city
        if (v.fuelCategory === 'EV' || v.fuelCategory === 'CNG') usageScore += 1;
      } else if (usage === 'Highway') {
        usageScore = v.highway;
        if (v.fuelCategory === 'Diesel' || v.fuelCategory === 'Petrol') usageScore += 1;
      } else {
        // Mixed: average of city + highway
        usageScore = (v.city + v.highway) / 2;
      }

      // --- Priority Logic (2× multiplier on matched attribute) ---
      let priorityScore = 0;
      if (priority === 'running_cost') {
        priorityScore = v.runningScore * 2; // 2× multiplier
      } else if (priority === 'resale') {
        priorityScore = v.resale * 2;
      } else if (priority === 'eco') {
        priorityScore = v.eco * 2;
      }

      // --- Compose final raw score ---
      score =
        usageScore * distanceMult +
        petrolPenalty +
        cleanFuelBoost +
        priorityScore;

      return { ...v, rawScore: Math.max(0, score), matchScore: 0, insightTag: '' };
    });

    // --- Normalise so the top car = 100% ---
    const maxRaw = Math.max(...scored.map((s) => s.rawScore));
    const normalised = scored.map((s) => ({
      ...s,
      matchScore: maxRaw > 0 ? Math.round((s.rawScore / maxRaw) * 100) : 0,
    }));

    // --- Sort descending, take top 3 ---
    const top3 = normalised
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    // --- Attach insight tags ---
    return top3.map((v) => ({
      ...v,
      insightTag: generateInsight(v, usage, priority, monthlyKm),
    }));
  }, [monthlyKm, usage, priority]);

  // ─── Handle CTA click ────────────────────────────────────────────────────
  function handleFindMatch() {
    setResultsVisible(false);
    setProcessing(true);
    setHasRun(true);
    setTimeout(() => {
      setProcessing(false);
      setResultsVisible(true);
    }, 1800);
  }

  // ─── Slider fill gradient ────────────────────────────────────────────────
  const sliderPct = Math.round((monthlyKm / 5000) * 100);

  return (
    <div className="air-page">
      {/* Ambient glow */}
      <div className="air-bg-glow" aria-hidden="true" />

      {/* ── Header ── */}
      <header className="air-header">
        <span className="air-badge">
          <Brain size={11} />
          AI Powered
        </span>
        <h1 className="air-title">
          Smart Vehicle <span className="air-title-accent">Recommender</span>
        </h1>
        <p className="air-subtitle">
          Describe your lifestyle. Our weighted ML engine analyses{' '}
          <strong>4 vehicles × 6 attributes</strong> to surface your perfect match.
        </p>
      </header>

      {/* ── Input Panel ── */}
      <section className="air-card-panel" aria-labelledby="profile-heading">
        <div className="air-panel-header">
          <Star size={15} className="air-panel-icon" />
          <h2 id="profile-heading" className="air-panel-title">Your Driver Profile</h2>
        </div>

        {/* Slider: Monthly Distance */}
        <div className="air-field">
          <label htmlFor="air-km-slider" className="air-label">
            Monthly Distance
            <span className="air-label-val">{monthlyKm.toLocaleString('en-IN')} km</span>
          </label>
          <div className="air-slider-wrap">
            <input
              id="air-km-slider"
              type="range"
              min={0}
              max={5000}
              step={50}
              value={monthlyKm}
              onChange={(e) => setMonthlyKm(Number(e.target.value))}
              className="air-slider"
              style={
                {
                  '--fill-pct': `${sliderPct}%`,
                } as React.CSSProperties
              }
            />
            <div className="air-slider-ticks" aria-hidden="true">
              <span>0</span>
              <span>1,250</span>
              <span>2,500</span>
              <span>3,750</span>
              <span>5,000</span>
            </div>
          </div>
        </div>

        {/* Toggle: Primary Usage */}
        <div className="air-field">
          <span className="air-label">Primary Usage</span>
          <div className="air-toggle-group" role="group" aria-label="Primary usage">
            {(['City', 'Mixed', 'Highway'] as UsageType[]).map((u) => (
              <button
                key={u}
                id={`air-usage-${u.toLowerCase()}`}
                className={`air-toggle-btn ${usage === u ? 'air-toggle-btn--active' : ''}`}
                onClick={() => setUsage(u)}
                aria-pressed={usage === u}
              >
                {u === 'City' && '🏙️'}
                {u === 'Mixed' && '🛣️'}
                {u === 'Highway' && '🛤️'}
                &nbsp;{u}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown: Top Priority */}
        <div className="air-field">
          <label htmlFor="air-priority" className="air-label">Top Priority</label>
          <div className="air-select-wrap">
            <select
              id="air-priority"
              className="air-select"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityType)}
            >
              <option value="running_cost">💰 Lowest Running Cost</option>
              <option value="resale">📈 Highest Resale Value</option>
              <option value="eco">🌿 Eco-Friendly / Zero Emission</option>
            </select>
            <ChevronDown size={14} className="air-select-chevron" aria-hidden="true" />
          </div>
        </div>

        {/* CTA */}
        <button
          id="air-cta"
          className="air-cta"
          onClick={handleFindMatch}
          disabled={processing}
          aria-busy={processing}
        >
          {processing ? (
            <>
              <span className="air-cta-dots">
                <span /><span /><span />
              </span>
              Analysing…
            </>
          ) : (
            <>
              <Brain size={16} />
              {hasRun ? 'Recalculate Match' : 'Find My Perfect Vehicle'}
            </>
          )}
        </button>
      </section>

      {/* ── Results ── */}
      {hasRun && (
        <section className="air-results-section" aria-label="AI recommendations">
          <ProcessingOverlay visible={processing} />

          {resultsVisible && (
            <>
              <div className="air-results-header">
                <h2 className="air-results-title">
                  <Brain size={18} className="air-results-icon" />
                  Top <span className="air-title-accent">3 Matches</span>
                </h2>
                <p className="air-results-sub">
                  Ranked by your weighted preference profile
                </p>
              </div>

              <div className="air-results-grid">
                {recommendations.map((vehicle, i) => (
                  <ResultCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    rank={i}
                    visible={resultsVisible}
                  />
                ))}
              </div>

              <p className="air-disclaimer">
                <Brain size={11} />
                Scores are generated by a proprietary weighted scoring model and are for guidance only.
                Always test drive before purchasing.
              </p>
            </>
          )}
        </section>
      )}
    </div>
  );
}
