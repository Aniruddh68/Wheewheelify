import { useState, useEffect, useMemo, useRef, lazy, Suspense } from 'react';
import {
  Search, SlidersHorizontal, X, ChevronDown,
  Fuel, Zap, Gauge, Star, ChevronLeft, ChevronRight,
  Users, Cog, Battery, Route, RotateCcw,
} from 'lucide-react';
import { fetchVehicles, getFilterOptions } from '@/utils/parseVehicles';
import type { Vehicle } from '@/utils/parseVehicles';
import VehicleDetailModal from './VehicleDetailModal';
import './VehicleBrowser.css';

// ─── Lazy-load Spline (heavy ~500KB, skill best-practice) ─────────────────────
const Spline = lazy(() => import('@splinetool/react-spline'));

// Demo scene — replace with your own exported .splinecode URL from Spline.design
const DEMO_SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HlWTxhgHv/scene.splinecode';

const ITEMS_PER_PAGE = 12;

const fuelIcons: Record<string, React.ReactNode> = {
  electric: <Zap size={12} />,
  petrol:   <Fuel size={12} />,
  diesel:   <Fuel size={12} />,
  cng:      <Gauge size={12} />,
  hybrid:   <Zap size={12} />,
  'flex fuel': <Fuel size={12} />,
};

// ─── Fuel Badge ────────────────────────────────────────────────────────────────
function FuelBadge({ fuel }: { fuel: string }) {
  const key = fuel.toLowerCase();
  return (
    <span className={`fuel-badge fuel-${key.replace(/\s+/g, '-')}`}>
      {fuelIcons[key] || <Fuel size={12} />}
      {fuel}
    </span>
  );
}

// ─── 3D Modal (full-screen glassmorphic overlay) ───────────────────────────────
function SplineModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const [sceneLoaded, setSceneLoaded] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="spline-modal-overlay"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={`3D view of ${vehicle.brand} ${vehicle.model}`}
    >
      <div className="spline-modal-panel">
        {/* Header */}
        <div className="spline-modal-header">
          <div>
            <p className="spline-modal-eyebrow">{vehicle.brand}</p>
            <h3 className="spline-modal-title">{vehicle.model}</h3>
            <p className="spline-modal-sub">Interactive 3D Viewer — drag to rotate</p>
          </div>
          <button className="spline-modal-close" onClick={onClose} aria-label="Close 3D viewer">
            <X size={20} />
          </button>
        </div>

        {/* 3D Canvas */}
        <div className="spline-modal-canvas">
          {!sceneLoaded && (
            <div className="spline-modal-loader">
              <div className="spline-loader-ring" />
              <p>Loading 3D scene…</p>
            </div>
          )}
          <Suspense fallback={null}>
            <Spline
              scene={DEMO_SPLINE_SCENE}
              onLoad={() => setSceneLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                opacity: sceneLoaded ? 1 : 0,
                transition: 'opacity 0.6s ease',
              }}
            />
          </Suspense>
        </div>

        {/* Footer hint */}
        <div className="spline-modal-footer">
          <span>🖱 Drag to rotate · Scroll to zoom · Right-click to pan</span>
          <span style={{ opacity: 0.4, fontSize: '0.72rem' }}>
            Replace DEMO_SPLINE_SCENE with your own scene URL
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Vehicle Card ──────────────────────────────────────────────────────────────
function VehicleCard({
  vehicle,
  onClick,
  onView3D,
}: {
  vehicle: Vehicle;
  onClick: () => void;
  onView3D: (e: React.MouseEvent) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className="vehicle-card vehicle-card--premium"
      onClick={onClick}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      {/* ── Image ── */}
      <div className="card-image-wrap">
        <img
          src={imgError ? '/placeholder.svg' : vehicle.imageSrc}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="card-image"
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className="card-image-overlay" />
        <FuelBadge fuel={vehicle.fuelType} />

        {vehicle.ncapRating && vehicle.ncapRating !== '—' && (
          <div className="card-ncap">
            <Star size={10} fill="currentColor" />
            {vehicle.ncapRating}
          </div>
        )}

        {/* 3D button — top-right on hover */}
        <button
          className="card-3d-btn"
          onClick={onView3D}
          aria-label={`View ${vehicle.model} in 3D`}
          title="View in 3D"
        >
          <RotateCcw size={13} />
          3D
        </button>
      </div>

      {/* ── Content ── */}
      <div className="card-body">
        <p className="card-brand">{vehicle.brand}</p>
        <h3 className="card-model">{vehicle.model}</h3>
        <p className="card-variant">{vehicle.variant}</p>

        {/* Icon-based specs row */}
        <div className="card-stats">
          {/* Mileage / Range */}
          <div className="card-stat">
            <span className="stat-icon">
              {vehicle.isEV ? <Battery size={14} /> : <Route size={14} />}
            </span>
            <span className="stat-value">
              {vehicle.isEV
                ? vehicle.range !== '—' ? `${vehicle.range} km` : '—'
                : vehicle.mileage !== '—' ? `${vehicle.mileage}` : '—'}
            </span>
            <span className="stat-label">{vehicle.isEV ? 'Range' : 'Mileage'}</span>
          </div>

          {/* Seats */}
          <div className="card-stat">
            <span className="stat-icon"><Users size={14} /></span>
            <span className="stat-value">{vehicle.seatingCapacity}</span>
            <span className="stat-label">Seats</span>
          </div>

          {/* Transmission */}
          <div className="card-stat">
            <span className="stat-icon"><Cog size={14} /></span>
            <span className="stat-value">{vehicle.transmission || '—'}</span>
            <span className="stat-label">Trans.</span>
          </div>
        </div>

        <div className="card-footer">
          <span className="card-price">{vehicle.priceLabel}</span>
          <button className="card-cta">Explore →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Multi-select Dropdown ─────────────────────────────────────────────────────
function MultiSelect({
  label, options, selected, onChange,
}: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };

  return (
    <div className="multi-select" ref={ref}>
      <button className="ms-trigger" onClick={() => setOpen(!open)}>
        <span>{selected.length ? `${label} (${selected.length})` : label}</span>
        <ChevronDown size={14} className={open ? 'rotate-180' : ''} style={{ transition: 'transform 0.2s' }} />
      </button>
      {open && (
        <div className="ms-dropdown">
          {options.map((opt) => (
            <label key={opt} className="ms-option">
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => toggle(opt)}
                className="ms-checkbox"
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Price Range Slider ────────────────────────────────────────────────────────
function PriceRangeSlider({
  min, max, value, onChange,
}: {
  min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void;
}) {
  return (
    <div className="price-range">
      <div className="price-labels">
        <span>₹{value[0]}L</span>
        <span>₹{value[1]}L</span>
      </div>
      <div className="dual-slider">
        <input
          type="range" min={min} max={max} value={value[0]}
          onChange={(e) => { const v = Number(e.target.value); if (v < value[1]) onChange([v, value[1]]); }}
          className="range-input range-low"
        />
        <input
          type="range" min={min} max={max} value={value[1]}
          onChange={(e) => { const v = Number(e.target.value); if (v > value[0]) onChange([value[0], v]); }}
          className="range-input range-high"
        />
      </div>
      <div className="price-range-labels">
        <span>₹{min}L</span>
        <span>₹{max}L</span>
      </div>
    </div>
  );
}

// ─── Main VehicleBrowser ───────────────────────────────────────────────────────
export default function VehicleBrowser() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name' | 'rating'>('price-asc');

  const [page, setPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // 3D modal state
  const [splineVehicle, setSplineVehicle] = useState<Vehicle | null>(null);

  // Load data
  useEffect(() => {
    fetchVehicles()
      .then((data) => {
        setVehicles(data);
        const opts = getFilterOptions(data);
        setPriceRange([opts.minPrice, opts.maxPrice]);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load vehicle data.');
        setLoading(false);
      });
  }, []);

  const filterOptions = useMemo(() => getFilterOptions(vehicles), [vehicles]);

  // ─── Filter + Sort ────────────────────────────────────────────────────────
  // Design: every filter dimension is optional — empty selection = "show all".
  // Multiple active filters are ANDed (intersection), not ORed.
  const filtered = useMemo(() => {
    if (!vehicles.length) return [];

    let out = vehicles;

    // 1. Free-text search (OR across brand / model / variant / fuel / type)
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter(
        (v) =>
          v.brand.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.variant.toLowerCase().includes(q) ||
          v.fuelType.toLowerCase().includes(q) ||
          v.carType.toLowerCase().includes(q),
      );
    }

    // 2. Multi-select filters (each dimension: empty = all pass)
    // Test Case 1 — default load: all arrays empty → no filtering → full list
    // Test Case 2 — single filter: only one array non-empty → narrow by that dimension
    // Test Case 3 — multi filter: multiple arrays non-empty → AND intersection
    // Test Case 4 — impossible combo: out.length === 0 → caught below in render
    if (selectedBrands.length > 0) {
      out = out.filter((v) => selectedBrands.includes(v.brand));
    }
    if (selectedFuels.length > 0) {
      // Case-insensitive match so 'Electric' === 'electric' etc.
      const fuelsLC = selectedFuels.map((f) => f.toLowerCase());
      out = out.filter((v) => fuelsLC.includes(v.fuelType.toLowerCase()));
    }
    if (selectedTypes.length > 0) {
      out = out.filter((v) => selectedTypes.includes(v.carType));
    }
    if (selectedTransmissions.length > 0) {
      out = out.filter((v) => selectedTransmissions.includes(v.transmission));
    }

    // 3. Price range — only filter when range is non-trivial (min !== max)
    if (priceRange && priceRange[0] !== priceRange[1]) {
      out = out.filter((v) => {
        // Vehicles with price === 0 are "Upcoming" — let them through
        if (v.price === 0) return true;
        return v.price >= priceRange[0] && v.price <= priceRange[1];
      });
    }

    // 4. Sort
    return [...out].sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      if (sortBy === 'rating') return (b.ncapRating || '0').localeCompare(a.ncapRating || '0');
      return 0;
    });
  }, [vehicles, search, selectedBrands, selectedFuels, selectedTypes, selectedTransmissions, priceRange, sortBy]);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [search, selectedBrands, selectedFuels, selectedTypes, selectedTransmissions, priceRange, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const hasActiveFilters = selectedBrands.length || selectedFuels.length || selectedTypes.length || selectedTransmissions.length;

  function clearAllFilters() {
    setSelectedBrands([]);
    setSelectedFuels([]);
    setSelectedTypes([]);
    setSelectedTransmissions([]);
    setSearch('');
    if (filterOptions) setPriceRange([filterOptions.minPrice, filterOptions.maxPrice]);
  }

  return (
    <section className="vehicle-browser" id="browse-all">
      {/* Section header */}
      <div className="vb-header">
        <p className="vb-eyebrow">Explore the Fleet</p>
        <h2 className="vb-title">Browse All Vehicles</h2>
        <p className="vb-subtitle">
          Discover, filter, and compare {vehicles.length}+ vehicles across every segment —{' '}
          from budget hatchbacks to flagship EVs.
        </p>
      </div>

      {/* ── Sticky glassmorphic controls bar ── */}
      <div className="vb-sticky-bar">
        <div className="vb-controls">
          <div className="search-bar">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              placeholder="Search brand, model, or type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            {search && (
              <button onClick={() => setSearch('')} className="search-clear">
                <X size={14} />
              </button>
            )}
          </div>

          <div className="controls-right">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="sort-select"
            >
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name">Name A–Z</option>
              <option value="rating">NCAP Rating</option>
            </select>

            <button
              className={`filter-toggle ${showFilters ? 'active' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal size={16} />
              Filters
              {hasActiveFilters ? <span className="filter-badge">{(selectedBrands.length + selectedFuels.length + selectedTypes.length + selectedTransmissions.length)}</span> : null}
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="filter-panel">
            <div className="filter-row">
              <MultiSelect label="Brand" options={filterOptions.brands} selected={selectedBrands} onChange={setSelectedBrands} />
              <MultiSelect label="Fuel Type" options={filterOptions.fuelTypes} selected={selectedFuels} onChange={setSelectedFuels} />
              <MultiSelect label="Car Type" options={filterOptions.carTypes} selected={selectedTypes} onChange={setSelectedTypes} />
              <MultiSelect label="Transmission" options={filterOptions.transmissions} selected={selectedTransmissions} onChange={setSelectedTransmissions} />
              {priceRange && (
                <div className="filter-group">
                  <label className="filter-label">Price Range</label>
                  <PriceRangeSlider
                    min={filterOptions.minPrice}
                    max={filterOptions.maxPrice}
                    value={priceRange}
                    onChange={setPriceRange}
                  />
                </div>
              )}
            </div>
            {hasActiveFilters ? (
              <button className="clear-filters" onClick={clearAllFilters}>
                <X size={13} /> Clear all filters
              </button>
            ) : null}
          </div>
        )}

        {/* Quick-filter pills (fuel) */}
        <div className="quick-pills">
          {['All', 'Petrol', 'Diesel', 'Electric', 'Hybrid', 'Flex Fuel'].map((f) => (
            <button
              key={f}
              className={`pill ${f === 'All' ? (selectedFuels.length === 0 ? 'pill-active' : '') : selectedFuels.includes(f) ? 'pill-active' : ''}`}
              onClick={() => {
                if (f === 'All') setSelectedFuels([]);
                else setSelectedFuels((prev) => prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]);
              }}
            >
              {f === 'Electric' && <Zap size={12} />}
              {f === 'Petrol' && <Fuel size={12} />}
              {f === 'Diesel' && <Fuel size={12} />}
              {f === 'Hybrid' && <Battery size={12} />}
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Results info */}
      <div className="results-info">
        {!loading && (
          <span>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found</span>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="vb-loading">
          <div className="loading-spinner" />
          <p>Loading vehicles…</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="vb-error">
          <p>{error}</p>
        </div>
      )}

      {/* Grid */}
      {!loading && !error && (
        <>
          {paginated.length === 0 ? (
            <div className="vb-empty">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔍</div>
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem', color: 'hsl(var(--primary-foreground))' }}>
                No vehicles found
              </p>
              <p style={{ fontSize: '0.85rem', maxWidth: 380, lineHeight: 1.6 }}>
                {search.trim()
                  ? `No results for "${search.trim()}". Try a different search term.`
                  : 'Your active filters returned no results. Try expanding or clearing your selection.'}
              </p>
              <button onClick={clearAllFilters} className="btn-clear" style={{ marginTop: '1rem' }}>Reset All Filters</button>
            </div>
          ) : (
            <div className="vehicle-grid">
              {paginated.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onClick={() => setSelectedVehicle(vehicle)}
                  onView3D={(e) => { e.stopPropagation(); setSplineVehicle(vehicle); }}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 7) { pageNum = i + 1; }
                else if (page <= 4) { pageNum = i + 1; }
                else if (page >= totalPages - 3) { pageNum = totalPages - 6 + i; }
                else { pageNum = page - 3 + i; }
                return (
                  <button
                    key={pageNum}
                    className={`page-num ${page === pageNum ? 'page-active' : ''}`}
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      {/* Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicle={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

      {/* Spline 3D Modal */}
      {splineVehicle && (
        <SplineModal
          vehicle={splineVehicle}
          onClose={() => setSplineVehicle(null)}
        />
      )}
    </section>
  );
}
