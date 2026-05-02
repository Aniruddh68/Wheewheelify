import { useCompare } from '@/context/CompareContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, ChevronRight, X, Zap, Shield, Battery, Info, Cog, Star, Fuel } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import type { Vehicle, VehicleGroup } from '@/utils/parseVehicles';
import { formatLakhPrice } from '@/utils/formatCurrency';

// ── Helpers ──────────────────────────────────────────────────────────────────
function toN(val: string | number | undefined): number {
  if (val === undefined || val === null) return 0;
  const n = parseFloat(val.toString().replace(/[^\d.]/g, ''));
  return isNaN(n) ? 0 : n;
}

function findWinner(nums: number[], highest = true): number {
  const validNums = nums.map((n) => (isNaN(n) ? -Infinity : n));
  const best = highest ? Math.max(...validNums) : Math.min(...validNums);
  if (!isFinite(best)) return -1;
  const idx = validNums.indexOf(best);
  return validNums.every((n) => n === validNums[0]) ? -1 : idx;
}

// ── Radial Gauge (inline component for fuel tank etc.) ───────────────────────
function RadialGauge({ val, unit, isNA, isWinner, highlightColor, pct, label, icon: Icon }: {
  val: any; unit: string; isNA: boolean; isWinner: boolean; highlightColor: string; pct: number; label: string; icon?: any;
}) {
  const gaugeRadius = 32;
  const gaugeCirc = 2 * Math.PI * gaugeRadius;
  const arcFraction = 0.75;
  const arcLen = gaugeCirc * arcFraction;
  const arcGap = gaugeCirc * (1 - arcFraction);
  const fillPct = isNA ? 0 : Math.min(pct, 100);
  const fillOffset = arcLen - (fillPct / 100) * arcLen;
  const strokeColor = isWinner ? highlightColor : '#f43f5e';

  return (
    <div className="bg-[#1a1b22] border border-white/[0.06] rounded-2xl px-5 py-5 flex items-center gap-5 shadow-xl h-full min-h-[90px]">
      <div className="flex flex-col items-center gap-1.5 shrink-0 min-w-[48px]">
        <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center" style={{ color: strokeColor }}>
          {Icon ? <Icon size={18} /> : <Zap size={18} />}
        </div>
        <span className="text-[9px] uppercase tracking-widest font-bold text-white/50 text-center leading-tight whitespace-nowrap">{label}</span>
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <div className="relative w-[72px] h-[72px] flex items-center justify-center shrink-0">
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 72 72" style={{ transform: 'rotate(135deg)' }}>
            <circle cx="36" cy="36" r={gaugeRadius} stroke="rgba(255,255,255,0.06)" strokeWidth="5" fill="none"
              strokeDasharray={`${arcLen} ${arcGap}`} strokeLinecap="round" />
            {!isNA && (
              <circle cx="36" cy="36" r={gaugeRadius} stroke={strokeColor} strokeWidth="5" fill="none"
                className="transition-all duration-1000 ease-out"
                strokeDasharray={`${arcLen} ${arcGap}`} strokeDashoffset={fillOffset}
                strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${strokeColor}40)` }} />
            )}
          </svg>
        </div>
        <span className={`text-xl font-black tracking-tight whitespace-nowrap ${isNA ? 'text-white/20' : 'text-white'}`}>
          {isNA ? 'N/A' : `${val}${unit}`}
        </span>
      </div>
    </div>
  );
}

// ── SpecBlock Component ──────────────────────────────────────────────────────
interface SpecBlockProps {
  label: string;
  values: (string | number | boolean)[];
  type?: 'text' | 'bar' | 'stars' | 'boolean' | 'radial';
  unit?: string;
  winnerIdx?: number;
  highlightColor?: string;
  icon?: any;
}

function SpecBlock({ label, values, type = 'text', unit = '', winnerIdx = -1, highlightColor = 'var(--accent)', icon: Icon }: SpecBlockProps) {

  const nums = values.map((v) => toN(v));
  const max = Math.max(...nums.filter((n) => !isNaN(n) && isFinite(n)), 0.001);

  return (
    <div className="py-6 border-b border-white/5 last:border-0 group/block">
      <h4 className="text-[11px] font-bold text-white/40 uppercase tracking-widest mb-4 flex items-center gap-2">
        {label}
      </h4>
      <div className="flex gap-4 md:gap-8">
        {values.map((val, i) => {
          const isWinner = i === winnerIdx;
          const numVal = nums[i];
          const pct = type === 'bar' ? Math.min(100, Math.max(0, (numVal / max) * 100)) : 0;
          
          // Styling logic
          const colorClass = isWinner ? 'text-[var(--accent)]' : 'text-white/90';
          const isNA = val === '—' || val === '' || val === undefined;

          return (
            <div key={i} className="flex-1">
              {type === 'stars' ? (
                <div className="flex items-center gap-2">
                  <span className={`text-3xl font-black tracking-tighter ${isNA ? 'text-white/20' : colorClass}`}>
                    {isNA ? 'N/A' : val}
                  </span>
                  {!isNA && (
                    <div className="flex flex-col">
                      <span className="text-white/30 text-[10px] uppercase font-bold tracking-widest leading-none mb-1">Out of 5</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, starIdx) => (
                          <Star 
                            key={starIdx} 
                            size={12} 
                            className={starIdx < numVal ? (isWinner ? 'text-[var(--accent)] fill-[var(--accent)]' : 'text-white/60 fill-white/60') : 'text-white/10'} 
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : type === 'boolean' ? (
                <div className="flex items-center gap-3">
                  {val === 'Yes' || val === true || val === 'true' || val === '1' ? (
                    <>
                      <CheckCircle2 className="text-green-400" size={28} />
                      <span className="text-sm font-bold text-green-400 uppercase tracking-wider">Yes</span>
                    </>
                  ) : (
                    <>
                      <X className="text-white/20" size={28} />
                      <span className="text-sm font-bold text-white/20 uppercase tracking-wider">No</span>
                    </>
                  )}
                </div>
              ) : type === 'radial' ? (
                <RadialGauge val={val} unit={unit} isNA={isNA} isWinner={isWinner} highlightColor={highlightColor} pct={pct} label={label} icon={Icon} />
              ) : (
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className={`text-2xl md:text-3xl font-black tracking-tight ${isNA ? 'text-white/20' : colorClass}`}>
                      {isNA ? 'N/A' : val}
                    </span>
                    {!isNA && unit && <span className="text-xs font-bold text-white/40 tracking-wider">{unit}</span>}
                  </div>
                  {type === 'bar' && !isNA && (
                    <div className="h-1.5 w-full bg-white/5 rounded-full mt-4 overflow-hidden relative">
                      <div 
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${pct}%`,
                          backgroundColor: isWinner ? highlightColor : 'rgba(255,255,255,0.2)',
                          boxShadow: isWinner ? `0 0 10px ${highlightColor}` : 'none'
                        }} 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-20">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/5 via-black to-black">
        <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
          <CheckCircle2 size={40} className="text-white/20" />
        </div>
        <h1 className="text-4xl font-headline font-black uppercase tracking-tighter mb-4">
          Comparison Builder
        </h1>
        <p className="text-white/50 max-w-md mx-auto mb-8 text-lg leading-relaxed">
          Select at least 2 vehicles from the explore page to see a head-to-head breakdown.
        </p>
        <button
          onClick={() => navigate('/browse')}
          className="bg-white text-black px-8 py-3 font-bold uppercase tracking-wider rounded active:scale-95 transition-transform hover:bg-gray-200 flex items-center gap-2"
        >
          Explore Vehicles <ChevronRight size={18} />
        </button>
      </div>
      <Footer />
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ComparePage() {
  const { compareList, removeFromCompare, setCompareList } = useCompare();
  const navigate = useNavigate();
  const location = useLocation();

  // Hydrate context from location state if available and context is empty
  useEffect(() => {
    if (compareList.length === 0 && location.state?.selectedVehicles?.length > 0) {
      setCompareList(location.state.selectedVehicles);
    }
  }, [compareList.length, location.state, setCompareList]);

  // Use state data immediately on first render if context is empty
  const activeList = compareList.length > 0 ? compareList : (location.state?.selectedVehicles || []);

  const [selectedVariantIdx, setSelectedVariantIdx] = useState<number[]>(() => activeList.map(() => 0));

  const activeVariants: Vehicle[] = useMemo(
    () =>
      activeList.map((group, i) => {
        const idx = Math.min(selectedVariantIdx[i] ?? 0, group.variants.length - 1);
        return group.variants[idx];
      }),
    [activeList, selectedVariantIdx]
  );

  const handleVariantChange = (colIdx: number, variantIdx: number) => {
    setSelectedVariantIdx((prev) => {
      const next = [...prev];
      next[colIdx] = variantIdx;
      return next;
    });
  };

  if (activeList.length < 2) return <EmptyState />;

  const category = activeList[0]?.vehicleCategory;
  const colCount = activeList.length;

  // Compute Similarity if 2 vehicles
  let similarityScore = 0;
  if (colCount === 2) {
    let score = 0;
    let total = 0;
    const v1 = activeVariants[0];
    const v2 = activeVariants[1];
    const check = (a: any, b: any) => { total++; if (a === b && a !== '—' && a !== '') score++; };
    check(v1.carType, v2.carType);
    check(v1.fuelType, v2.fuelType);
    check(v1.transmission, v2.transmission);
    check(v1.seatingCapacity, v2.seatingCapacity);
    check(v1.turbo, v2.turbo);
    check(v1.abs, v2.abs);
    check(v1.sunroof, v2.sunroof);
    check(v1.ncapRating, v2.ncapRating);
    similarityScore = total > 0 ? Math.round((score / total) * 100) : 0;
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-20 font-sans selection:bg-[var(--accent)] selection:text-black">
      <Navbar />

      <main className="flex-1 p-4 md:p-8 lg:p-12 max-w-[1400px] mx-auto w-full">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-8 group transition-colors text-xs font-bold uppercase tracking-widest"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" /> Back to explore
        </button>

        {/* ── STICKY HEADER ── */}
        <div className="sticky top-20 z-40 bg-black/80 backdrop-blur-3xl pt-8 pb-6 border-b border-white/5 mb-12 rounded-b-3xl">
          <div className="flex gap-4 md:gap-8 items-end justify-between px-4">
            {activeList.map((group, colIdx) => {
              const activeV = activeVariants[colIdx];
              return (
                <div key={group.id} className="flex-1 flex flex-col items-center text-center relative animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${colIdx * 100}ms`}}>
                  
                  {/* Remove Button */}
                  {colCount > 2 && (
                    <button
                      onClick={() => {
                        removeFromCompare(group.id);
                        setSelectedVariantIdx((prev) => prev.filter((_, i) => i !== colIdx));
                      }}
                      className="absolute top-0 right-0 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-full transition-colors z-10"
                    >
                      <X size={14} />
                    </button>
                  )}

                  {/* Image */}
                  <div className="h-24 md:h-36 flex items-center justify-center mb-6 w-full">
                    <img
                      src={group.imageSrc}
                      alt={group.model}
                      className="max-h-full max-w-full object-contain mix-blend-screen drop-shadow-2xl transition-transform hover:scale-110 duration-500"
                    />
                  </div>

                  {/* Text Details */}
                  <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter leading-none mb-2">
                    {group.model}
                  </h3>
                  <p className="text-sm font-semibold text-[var(--accent)] mb-4">
                    {activeV?.price > 0 ? formatLakhPrice(activeV.price) : 'TBA'}
                  </p>

                  {/* Variant Selector */}
                  {group.variants.length > 0 && (
                    <div className="w-full max-w-[200px] relative">
                      <select
                        value={selectedVariantIdx[colIdx] ?? 0}
                        onChange={(e) => handleVariantChange(colIdx, Number(e.target.value))}
                        className="w-full bg-white/5 border border-white/10 text-white/80 text-xs rounded-md px-3 py-2.5 appearance-none cursor-pointer hover:bg-white/10 focus:outline-none focus:border-[var(--accent)] transition-colors text-center font-medium"
                      >
                        {group.variants.map((v, vi) => (
                          <option key={vi} value={vi} className="bg-zinc-900 text-white">
                            {v.variant || `Variant ${vi + 1}`}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-white/30">
                        <ChevronRight size={14} className="rotate-90" />
                      </div>
                    </div>
                  )}
                  
                  {/* VS Badge (only show between items) */}
                  {colIdx < colCount - 1 && (
                    <div className="absolute top-1/2 -right-2 md:-right-4 translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-white/40 italic z-10 hidden sm:flex">
                      VS
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CONTENT SECTIONS ── */}
        <div className="space-y-6 md:space-y-10 px-4">
          
          {/* Similarity Overview (Only for 2 vehicles) */}
          {colCount === 2 && (
            <div className="bg-gradient-to-br from-white/5 to-transparent border border-white/10 rounded-3xl p-6 md:p-8 animate-in fade-in duration-1000 mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-white/60 mb-2">General Overview</h3>
              <p className="text-lg text-white/80 leading-relaxed max-w-3xl mb-8">
                The <strong className="text-white">{activeVariants[0]?.model}</strong> and <strong className="text-white">{activeVariants[1]?.model}</strong> share approximately <strong className="text-[var(--accent)]">{similarityScore}%</strong> of their core technical specifications and features based on your selected variants.
              </p>
              
              <div className="w-full max-w-md">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest mb-3 text-white/40">
                  <span>Similarity Index</span>
                  <span className="text-[var(--accent)]">{similarityScore}%</span>
                </div>
                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${similarityScore}%` }} />
                </div>
              </div>
            </div>
          )}

          {/* Performance Section */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10">
            <h3 className="text-xl font-headline font-black uppercase mb-8 flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500"><Zap size={20} /></div>
              Performance & Efficiency
            </h3>
            <div className="space-y-2">
              <SpecBlock 
                label={activeVariants.some((v) => v.isEV) ? 'Range / Mileage' : 'Mileage'} 
                values={activeVariants.map((v) => v.isEV ? (v.range !== '—' ? toN(v.range) : '—') : (v.mileage !== '—' ? toN(v.mileage) : '—'))} 
                type="bar" 
                unit={activeVariants.some((v) => v.isEV) ? 'km' : 'kmpl'} 
                winnerIdx={findWinner(activeVariants.map((v) => v.isEV ? toN(v.range) : toN(v.mileage)))} 
                highlightColor="#3b82f6" 
              />
              <SpecBlock 
                label="Engine Capacity" 
                values={activeVariants.map((v) => toN(v.engineCC || v.engine) || '—')} 
                type="bar" 
                unit="cc" 
                winnerIdx={findWinner(activeVariants.map((v) => toN(v.engineCC || v.engine)))} 
                highlightColor="#eab308" 
              />
              <SpecBlock 
                label="Power" 
                values={activeVariants.map((v) => toN(v.power || v.horsepower) || '—')} 
                type="bar" 
                unit="bhp" 
                winnerIdx={findWinner(activeVariants.map((v) => toN(v.power || v.horsepower)))} 
                highlightColor="#eab308" 
              />
              <SpecBlock 
                label="Torque" 
                values={activeVariants.map((v) => toN(v.torque) || '—')} 
                type="bar" 
                unit="Nm" 
                winnerIdx={findWinner(activeVariants.map((v) => toN(v.torque)))} 
                highlightColor="#eab308" 
              />
            </div>
          </div>

          {/* Safety Section */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10">
            <h3 className="text-xl font-headline font-black uppercase mb-8 flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500"><Shield size={20} /></div>
              Safety Ratings
            </h3>
            <div className="space-y-2">
              {category === 'Cars' && (
                <>
                  <SpecBlock 
                    label="Global NCAP Rating" 
                    values={activeVariants.map((v) => toN(v.ncapRating) || '—')} 
                    type="stars" 
                    winnerIdx={findWinner(activeVariants.map((v) => toN(v.ncapRating)))} 
                    highlightColor="#22c55e" 
                  />
                  <SpecBlock 
                    label="Airbags" 
                    values={activeVariants.map((v) => v.airbags > 0 ? v.airbags : '—')} 
                    type="bar" 
                    unit="Airbags" 
                    winnerIdx={findWinner(activeVariants.map((v) => v.airbags))} 
                    highlightColor="#22c55e" 
                  />
                  <SpecBlock label="ADAS Features" values={activeVariants.map((v) => v.adas)} type="boolean" />
                </>
              )}
              <SpecBlock label="ABS / Braking" values={activeVariants.map((v) => v.abs)} type="boolean" />
            </div>
          </div>

          {/* Core Specs Section */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10">
            <h3 className="text-xl font-headline font-black uppercase mb-8 flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500"><Cog size={20} /></div>
              Technical Specifications
            </h3>
            <div className="space-y-2">
              <SpecBlock label="Fuel Type" values={activeVariants.map((v) => v.fuelType || '—')} type="text" />
              <SpecBlock label="Transmission" values={activeVariants.map((v) => v.transmission || '—')} type="text" />
              <SpecBlock label="Fuel Tank Capacity" values={activeVariants.map((v) => toN(v.fuelTankCapacity) || '—')} type="radial" icon={Fuel} unit="L" winnerIdx={findWinner(activeVariants.map(v => toN(v.fuelTankCapacity)))} highlightColor="#f43f5e" />
              {category === 'Cars' && (
                <SpecBlock label="Seating Capacity" values={activeVariants.map((v) => v.seatingCapacity || '—')} type="bar" unit="Seats" winnerIdx={findWinner(activeVariants.map(v => v.seatingCapacity))} highlightColor="#a855f7" />
              )}
            </div>
          </div>

          {/* Features Section */}
          {category === 'Cars' && (
            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10">
              <h3 className="text-xl font-headline font-black uppercase mb-8 flex items-center gap-3">
                <div className="p-2 bg-pink-500/10 rounded-lg text-pink-500"><Info size={20} /></div>
                Features & Comfort
              </h3>
              <div className="space-y-2">
                <SpecBlock label="Sunroof" values={activeVariants.map((v) => v.sunroof)} type="boolean" />
                <SpecBlock label="Touchscreen Size" values={activeVariants.map((v) => v.touchscreenSize || '—')} type="text" />
                <SpecBlock label="Connectivity" values={activeVariants.map((v) => v.connectivity || '—')} type="text" />
                <SpecBlock label="Seat Material" values={activeVariants.map((v) => v.seatMaterial || '—')} type="text" />
              </div>
            </div>
          )}

          {/* Dimensions Section */}
          <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 md:p-10">
            <h3 className="text-xl font-headline font-black uppercase mb-8 flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Info size={20} /></div>
              Dimensions & Space
            </h3>
            <div className="space-y-2">
              <SpecBlock label="Length" values={activeVariants.map((v) => v.length || '—')} type="bar" unit="mm" winnerIdx={findWinner(activeVariants.map(v => toN(v.length)))} highlightColor="#3b82f6" />
              <SpecBlock label="Width" values={activeVariants.map((v) => v.width || '—')} type="bar" unit="mm" winnerIdx={findWinner(activeVariants.map(v => toN(v.width)))} highlightColor="#3b82f6" />
              <SpecBlock label="Height" values={activeVariants.map((v) => v.height || '—')} type="bar" unit="mm" winnerIdx={findWinner(activeVariants.map(v => toN(v.height)))} highlightColor="#3b82f6" />
              <SpecBlock label="Wheelbase" values={activeVariants.map((v) => v.wheelbase || '—')} type="bar" unit="mm" winnerIdx={findWinner(activeVariants.map(v => toN(v.wheelbase)))} highlightColor="#3b82f6" />
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center border-t border-white/5 pt-12 pb-8">
          <p className="text-white/40 mb-6 text-sm">Want to compare a different segment?</p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => navigate('/browse')}
              className="bg-white text-black hover:bg-gray-200 px-8 py-4 font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 rounded-full text-sm shadow-[0_0_30px_rgba(255,255,255,0.1)]"
            >
              Browse All Vehicles
            </button>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}
