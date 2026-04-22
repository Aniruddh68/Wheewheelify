import { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, X,
  Fuel, Zap, Gauge, Star, ChevronLeft, ChevronRight,
  Users, Cog, Battery, Route, RotateCcw,
} from 'lucide-react';
import { fetchVehicles, getFilterOptions, groupVehicles } from '@/utils/parseVehicles';
import type { VehicleGroup } from '@/utils/parseVehicles';
import { useCompare } from '@/context/CompareContext';
import VehicleDetailModal from './VehicleDetailModal';
import './VehicleBrowser.css';



const ITEMS_PER_PAGE = 12;

const fuelIcons: Record<string, React.ReactNode> = {
  electric: <Zap size={12} />,
  petrol:   <Fuel size={12} />,
  diesel:   <Fuel size={12} />,
  cng:      <Gauge size={12} />,
  hybrid:   <Zap size={12} />,
  'flex fuel': <Fuel size={12} />,
};


// ─── Vehicle Card ──────────────────────────────────────────────────────────────
function VehicleCard({
  vehicle,
  onClick,
  onExplore,
}: {
  vehicle: VehicleGroup;
  onClick: () => void;
  onExplore: (e: React.MouseEvent) => void;
}) {
  const [imgError, setImgError] = useState(false);
  const { compareList, addToCompare, removeFromCompare } = useCompare();
  const isCompared = compareList.some(v => v.id === vehicle.id);

  return (
    <div className="vehicle-card vehicle-card--premium" onClick={onClick} tabIndex={0} role="button" onKeyDown={(e) => e.key === 'Enter' && onClick()}>
      <div className="card-image-wrap">
        <img src={imgError ? '/placeholder.svg' : vehicle.imageSrc} alt={`${vehicle.brand} ${vehicle.model}`} className="card-image" onError={() => setImgError(true)} loading="lazy" />
        <div className="card-image-overlay" />
        <div className="fuel-badge">{vehicle.fuels.join(" / ") || "TBA"}</div>
        {vehicle.ncapRating && vehicle.ncapRating !== '—' && (
          <div className="card-ncap"><Star size={10} fill="currentColor" />{vehicle.ncapRating}</div>
        )}

      </div>

      <div className="card-body">
        <p className="card-brand">{vehicle.brand}</p>
        <h3 className="card-model">{vehicle.model}</h3>
        <p className="card-variant">{vehicle.variants.length} Variants</p>

        <div className="card-stats">
          <div className="card-stat">
            <span className="stat-icon">{vehicle.isEV ? <Battery size={14} /> : <Route size={14} />}</span>
            <span className="stat-value">{vehicle.isEV ? "Up to " + (Math.max(...vehicle.variants.map(v => parseFloat(v.range) || 0)) || "—") + " km" : "Up to " + (Math.max(...vehicle.variants.map(v => parseFloat(v.mileage) || 0)) || "—")}</span>
            <span className="stat-label">{vehicle.isEV ? 'Range' : 'Mileage'}</span>
          </div>
          <div className="card-stat">
            <span className="stat-icon"><Users size={14} /></span>
            <span className="stat-value">{vehicle.seatingCapacities.join("/")}</span>
            <span className="stat-label">Seats</span>
          </div>
          <div className="card-stat">
            <span className="stat-icon"><Cog size={14} /></span>
            <span className="stat-value">{vehicle.transmissions.join(" / ") || '—'}</span>
            <span className="stat-label">Trans.</span>
          </div>
        </div>

        <div className="card-footer flex justify-between items-center mt-4" onClick={(e) => e.stopPropagation()}>
          <span className="card-price">{vehicle.priceLabel}</span>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all ${
                isCompared 
                  ? 'border-red-500 text-red-500 bg-red-500/10 hover:bg-red-500/20' 
                  : 'border-white/20 text-white/70 hover:border-white/60 hover:text-white bg-black/20'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                isCompared ? removeFromCompare(vehicle.id) : addToCompare(vehicle);
              }}
            >
              {isCompared ? '✓ Added' : '+ Compare'}
            </button>
            <button className="card-cta bg-white text-black hover:bg-gray-200 px-4 py-1.5 rounded text-sm font-bold tracking-wide transition-colors" onClick={onExplore}>Explore →</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Native Styled Checkbox List ───────────────────────────────────────────────
function FilterCheckboxList({ options, selected, onChange }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; }) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  };
  return (
    <div className="filter-checkbox-list">
      {options.map((opt) => (
        <label key={opt} className="filter-checkbox-label">
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} className="filter-checkbox-input" />
          <span className="filter-checkbox-text">{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ─── Price Historgram Slider ───────────────────────────────────────────────────
function PriceHistogramSlider({
  min, max, value, onChange,
}: {
  min: number; max: number; value: [number, number]; onChange: (v: [number, number]) => void;
}) {
  // Generate random heights for histogram mock just for aesthetic rendering
  const bars = useMemo(() => Array.from({ length: 40 }, () => Math.random() * 80 + 20), []);
  const rangeWidth = max - min || 1;
  
  return (
    <div className="price-histogram-wrap">
      <div className="price-histogram-chart">
        {bars.map((height, i) => {
          const valAtPoint = min + (i / bars.length) * rangeWidth;
          const isActive = valAtPoint >= value[0] && valAtPoint <= value[1];
          return (
            <div 
              key={i} 
              className={`histogram-bar ${isActive ? 'active' : ''}`} 
              style={{ height: `${height}%` }}
            />
          );
        })}
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
      <div className="price-range-inputs">
        <div className="price-input-box">
          <span>FROM</span>
          <strong>₹{value[0]}L</strong>
        </div>
        <div className="price-input-box">
          <span>TO</span>
          <strong>₹{value[1]}L</strong>
        </div>
      </div>
    </div>
  );
}

// ─── Main VehicleBrowser ───────────────────────────────────────────────────────
export default function VehicleBrowser() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<VehicleGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedFuels, setSelectedFuels] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTransmissions, setSelectedTransmissions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number] | null>(null);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc' | 'name' | 'rating'>('price-asc');

  const [page, setPage] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleGroup | null>(null);

  const location = useLocation();
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat === 'cars') setSelectedCategories(['Cars']);
    else if (cat === 'twowheelers') setSelectedCategories(['Bikes', 'Scooters']);
    else if (cat === 'bikes') setSelectedCategories(['Bikes']);
    else if (cat === 'scooters') setSelectedCategories(['Scooters']);
    else setSelectedCategories([]);
  }, [searchParams]);

  useEffect(() => {
    fetchVehicles()
      .then((data) => {
        const groupedData = groupVehicles(data);
        setVehicles(groupedData);
        const opts = getFilterOptions(groupedData);
        setPriceRange([opts.minPrice, opts.maxPrice]);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load vehicle data.');
        setLoading(false);
      });
  }, []);

  const filterOptions = useMemo(() => getFilterOptions(vehicles), [vehicles]);

  const filtered = useMemo(() => {
    if (!vehicles.length || selectedCategories.length === 0) return [];
    let out = vehicles;
    const q = search.trim().toLowerCase();
    if (q) {
      out = out.filter((v) =>
        v.brand.toLowerCase().includes(q) ||
        v.model.toLowerCase().includes(q) ||
        v.fuels.some(f => f.toLowerCase().includes(q)) ||
        v.carTypes.some(t => t.toLowerCase().includes(q))
      );
    }
    if (selectedCategories.length) out = out.filter((v) => selectedCategories.includes(v.vehicleCategory));
    if (selectedBrands.length) out = out.filter((v) => selectedBrands.includes(v.brand));
    if (selectedFuels.length) {
      const lc = selectedFuels.map(f => f.toLowerCase());
      out = out.filter(v => v.fuels.some(f => lc.includes(f.toLowerCase())));
    }
    if (selectedTypes.length) out = out.filter(v => v.carTypes.some(t => selectedTypes.includes(t)));
    if (selectedTransmissions.length) out = out.filter(v => v.transmissions.some(t => selectedTransmissions.includes(t)));
    if (priceRange && priceRange[0] !== priceRange[1]) {
      out = out.filter((v) => {
        if (v.minPrice === 0) return true;
        return v.minPrice <= priceRange[1] && v.maxPrice >= priceRange[0];
      });
    }
    return [...out].sort((a, b) => {
      if (sortBy === 'price-asc') return a.minPrice - b.minPrice;
      if (sortBy === 'price-desc') return b.maxPrice - a.maxPrice;
      if (sortBy === 'name') return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      if (sortBy === 'rating') return (b.ncapRating || '0').localeCompare(a.ncapRating || '0');
      return 0;
    });
  }, [vehicles, search, selectedCategories, selectedBrands, selectedFuels, selectedTypes, selectedTransmissions, priceRange, sortBy]);

  useEffect(() => { setPage(1); }, [search, selectedCategories, selectedBrands, selectedFuels, selectedTypes, selectedTransmissions, priceRange, sortBy]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  function clearAllFilters() {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setSelectedFuels([]);
    setSelectedTypes([]);
    setSelectedTransmissions([]);
    setSearch('');
    if (filterOptions) setPriceRange([filterOptions.minPrice, filterOptions.maxPrice]);
  }

  return (
    <section className="vehicle-browser" id="browse-all">
      <div className="vb-header">
        <p className="vb-eyebrow">Explore the Fleet</p>
        <h2 className="vb-title">Browse All Vehicles</h2>
      </div>

      <div className="vb-layout-wrapper">
        {/* ── Sidebar Filters ── */}
        <aside className="vb-sidebar">
          <div className="vb-sidebar-header">
            <h3>Filter by</h3>
            <button onClick={clearAllFilters} className="clear-reset-btn">Reset all <X size={12} /></button>
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Vehicle Category</h4>
            {filterOptions && <FilterCheckboxList options={filterOptions.categories} selected={selectedCategories} onChange={setSelectedCategories} />}
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Price Range / Lakh</h4>
            {priceRange && (
              <PriceHistogramSlider
                min={filterOptions.minPrice}
                max={filterOptions.maxPrice}
                value={priceRange}
                onChange={setPriceRange}
              />
            )}
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Body Type</h4>
            <FilterCheckboxList options={filterOptions.carTypes} selected={selectedTypes} onChange={setSelectedTypes} />
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Car Brand</h4>
            <FilterCheckboxList options={filterOptions.brands} selected={selectedBrands} onChange={setSelectedBrands} />
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Transmission</h4>
            <FilterCheckboxList options={filterOptions.transmissions} selected={selectedTransmissions} onChange={setSelectedTransmissions} />
          </div>

          <div className="filter-section">
            <h4 className="filter-section-title">Fuel Type</h4>
            <FilterCheckboxList options={filterOptions.fuelTypes} selected={selectedFuels} onChange={setSelectedFuels} />
          </div>
        </aside>

        {/* ── Main Canvas ── */}
        <div className="vb-main">
          <div className="vb-topbar">
            <div className="search-box">
              <Search size={16} className="text-white/40" />
              <input type="text" placeholder="Search brand, model, or type…" value={search} onChange={e => setSearch(e.target.value)} />
              {search && <button onClick={() => setSearch('')}><X size={14} /></button>}
            </div>
            <div className="sort-box">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)}>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name A–Z</option>
                <option value="rating">NCAP Rating</option>
              </select>
            </div>
          </div>

          <div className="results-info">
            {!loading && selectedCategories.length > 0 && <span>{filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} found</span>}
          </div>

          {loading && (
            <div className="vb-loading">
              <div className="loading-spinner" />
              <p>Loading vehicles…</p>
            </div>
          )}

          {error && <div className="vb-error"><p>{error}</p></div>}

          {!loading && !error && (
            <>
              {selectedCategories.length === 0 ? (
                <div className="vb-empty select-category-prompt py-24 flex flex-col items-center text-center">
                  <div className="illustration-wrapper mb-8 relative group">
                    <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full transition-all duration-700 group-hover:bg-blue-400/30"></div>
                    <svg className="w-32 h-32 text-blue-400 drop-shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-transform duration-500 hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-3">Select a Category to Explore</h4>
                  <p className="text-white/50 max-w-md mx-auto leading-relaxed">
                    Please choose Cars, Bikes, or Scooters from the filter panel to view and compare available vehicles.
                  </p>
                </div>
              ) : paginated.length === 0 ? (
                <div className="vb-empty">
                  <span>🔍</span>
                  <h4>No vehicles found</h4>
                  <p>Your active filters returned no results. Try expanding or clearing your selection.</p>
                  <button onClick={clearAllFilters} className="btn-clear-large">Reset All Filters</button>
                </div>
              ) : (
                <div className="vehicle-grid">
                  {paginated.map((vehicle) => (
                    <VehicleCard
                      key={vehicle.id}
                      vehicle={vehicle}
                      onClick={() => setSelectedVehicle(vehicle)}
                      onExplore={(e) => { e.stopPropagation(); navigate(`/vehicle/${vehicle.id}`); }}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="pagination">
                  <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}><ChevronLeft size={16} /></button>
                  {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
                    let pageNum: number;
                    if (totalPages <= 7) pageNum = i + 1;
                    else if (page <= 4) pageNum = i + 1;
                    else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
                    else pageNum = page - 3 + i;
                    return (
                      <button key={pageNum} className={`page-num ${page === pageNum ? 'page-active' : ''}`} onClick={() => setPage(pageNum)}>
                        {pageNum}
                      </button>
                    );
                  })}
                  <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}><ChevronRight size={16} /></button>
                </div>
              )}
            </>
          )}

          {selectedVehicle && <VehicleDetailModal vehicle={selectedVehicle} onClose={() => setSelectedVehicle(null)} />}

        </div>
      </div>
    </section>
  );
}
